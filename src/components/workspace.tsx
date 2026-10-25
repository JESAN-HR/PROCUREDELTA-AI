"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  GitCompareArrows,
  History,
  ScanLine,
  ShieldCheck,
  Layers3,
  BookOpen,
  Plus,
  Upload,
  Check,
  Trash2,
  Search,
  Download,
  ChevronRight,
  CircleHelp,
  Moon,
  Sun,
  LockKeyhole,
} from "lucide-react";
import { diffWords } from "diff";
import {
  compare,
  createBrief,
  makeDocument,
  originalDemo,
  revisedDemo,
  labels,
  type Document,
  type Fact,
  type Report,
} from "@/lib/engine";
import { readPdf } from "@/lib/pdf";
import { emptyStore, readStore, writeStore, type Store } from "@/lib/storage";
import OptionalAi from "./optional-ai";
import { ReportReview, Timelines } from "./report-tools";
import { banglaLabels, searchableReport } from "@/lib/reports";
const nav = [
  ["dashboard", "Overview", LayoutDashboard],
  ["analyze", "New analysis", Plus],
  ["comparison", "Comparison", GitCompareArrows],
  ["documents", "Documents", FileText],
  ["history", "Report history", History],
  ["evidence", "Evidence library", ScanLine],
] as const;
const resources = [
  ["architecture", "Architecture", Layers3],
  ["security", "Security & privacy", ShieldCheck],
  ["docs", "Documentation", BookOpen],
] as const;
function Evidence({
  fact,
  doc,
  alternate,
}: {
  fact?: Fact;
  doc: Document;
  alternate?: Document;
}) {
  return (
    <div className="evidence">
      {fact ? (
        fact.evidence.map((e, i) => (
          <blockquote key={i}>
            <p>“{e.quote}”</p>
            <cite>
              {(e.documentId === alternate?.id ? alternate : doc).title} ·{" "}
              {e.page ? `Page ${e.page}` : "Text excerpt · no page citation"}
              {e.clause ? ` · Clause ${e.clause}` : ""}
            </cite>
          </blockquote>
        ))
      ) : (
        <p>Not identified in this document.</p>
      )}
    </div>
  );
}
function InputPanel({
  doc,
  setDoc,
  side,
}: {
  doc: Document;
  setDoc: (d: Document) => void;
  side: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ocr, setOcr] = useState(false),
    [ocrProgress, setOcrProgress] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const pages = await readPdf(file, { ocr, progress: setOcrProgress });
      setDoc({ ...doc, title: file.name, pages, kind: "pdf", edited: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF could not be read.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card input-panel">
      <div className="panel-heading">
        <span className={"doc-icon " + (side === "Revised" ? "green" : "")}>
          <FileText size={21} />
        </span>
        <div>
          <h3>{side} document</h3>
          <p>
            {side === "Original"
              ? "The initial tender or notice"
              : "The amended or replacement notice"}
          </p>
        </div>
        <span className="number">{side === "Original" ? "01" : "02"}</span>
      </div>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={ocr}
          onChange={(e) => setOcr(e.target.checked)}
        />{" "}
        Enable local English + Bangla OCR for image-only pages (up to 10 pages)
      </label>
      {busy && <p role="status">{ocrProgress || "Extracting document…"}</p>}
      <label
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void upload(e.dataTransfer.files[0]);
        }}
      >
        <Upload size={23} />
        <strong>
          {busy ? "Extracting PDF text…" : "Drop a PDF here, or browse"}
        </strong>
        <span>Text-based PDF · up to 10 MB / 100 pages</span>
        <input
          type="file"
          accept="application/pdf"
          aria-label={`${side} PDF`}
          disabled={busy}
          onChange={(e) => void upload(e.target.files?.[0])}
        />
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {doc.pages.some((p) => p.ocr) && (
        <p className="warning">
          OCR-derived text. Review recognition errors before analyzing. Page
          references identify the scanned page, not verified wording.
        </p>
      )}
      <label>
        Document title
        <input
          value={doc.title}
          maxLength={200}
          onChange={(e) => setDoc({ ...doc, title: e.target.value })}
        />
      </label>
      <div className="two">
        <label>
          Issuing authority <small>optional metadata</small>
          <input
            value={doc.authority}
            maxLength={200}
            onChange={(e) => setDoc({ ...doc, authority: e.target.value })}
          />
        </label>
        <label>
          Source URL <small>user-provided</small>
          <input
            type="url"
            placeholder="https://…"
            value={doc.url}
            onChange={(e) => setDoc({ ...doc, url: e.target.value })}
          />
        </label>
      </div>
      <label>
        Paste or correct document text
        <textarea
          aria-label={`${side} text`}
          value={doc.pages.map((p) => p.text).join("\n\n")}
          maxLength={150000}
          placeholder="Tender title: …&#10;Submission deadline: November 10, 2026&#10;Experience requirement: two years"
          onChange={(e) =>
            setDoc({
              ...doc,
              pages: [{ text: e.target.value }],
              edited: doc.kind === "pdf" || doc.edited,
              kind: "text",
            })
          }
        />
      </label>
      <div className="panel-footer">
        <span>
          {doc.pages.reduce((n, p) => n + p.text.length, 0).toLocaleString()}{" "}
          characters ·{" "}
          {doc.kind === "pdf"
            ? `${doc.pages.length} PDF pages`
            : "pasted / edited text"}
        </span>
        <button
          className="text-button"
          onClick={() => setDoc(makeDocument("", `${side} notice`))}
        >
          Clear
        </button>
      </div>
    </section>
  );
}
export default function Workspace({ route }: { route: string }) {
  const router = useRouter();
  const [store, setStore] = useState<Store>(emptyStore),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [dark, setDark] = useState(false);
  const [original, setOriginal] = useState(() =>
      makeDocument("", "Original notice"),
    ),
    [revised, setRevised] = useState(() => makeDocument("", "Revised notice")),
    [complete, setComplete] = useState(false),
    [progress, setProgress] = useState(""),
    [single, setSingle] = useState(false),
    [bangla, setBangla] = useState(false);
  useEffect(() => {
    /* Browser-only hydration of the persisted workspace after SSR. */
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate browser storage after server rendering
      setStore(readStore(localStorage));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Storage unavailable.");
    }
    setReady(true);
  }, []);
  function save(next: Store) {
    try {
      writeStore(localStorage, next);
      setStore(next);
      setError("");
      return true;
    } catch {
      setError(
        "Browser storage is unavailable or full. Export or delete older records and retry.",
      );
      return false;
    }
  }
  const report =
    store.reports.find((r) => r.id === store.activeId) ?? store.reports[0];
  function demo() {
    setSingle(false);
    setOriginal(
      makeDocument(originalDemo, "Fictional road equipment · original"),
    );
    setRevised(makeDocument(revisedDemo, "Fictional road equipment · revised"));
    setComplete(true);
    setError("");
  }
  async function analyze() {
    setError("");
    setProgress("Reading source text…");
    await new Promise((r) => setTimeout(r, 150));
    try {
      const result = single
        ? createBrief(original)
        : compare(original, revised, complete);
      setProgress("Comparing fields and linking evidence…");
      await new Promise((r) => setTimeout(r, 200));
      if (
        save({
          ...store,
          documents: [
            ...store.documents.filter(
              (d) => d.id !== original.id && d.id !== revised.id,
            ),
            original,
            ...(single ? [] : [revised]),
          ],
          reports: [result, ...store.reports],
          activeId: result.id,
        })
      )
        router.push("/comparison");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setProgress("");
    }
  }
  function open(r: Report) {
    if (save({ ...store, activeId: r.id })) router.push("/comparison");
  }
  function removeDocument(id: string) {
    save({
      ...store,
      documents: store.documents.filter((d) => d.id !== id),
      reports: store.reports.filter(
        (r) => r.original.id !== id && r.revised.id !== id,
      ),
      activeId: undefined,
    });
  }
  function printReport() {
    const details = Array.from(
      document.querySelectorAll<HTMLDetailsElement>("main details"),
    );
    const previous = details.map((element) => element.open);
    details.forEach((element) => {
      element.open = true;
    });
    window.print();
    details.forEach((element, index) => {
      element.open = previous[index];
    });
  }
  function exportReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `procuredelta-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  const title =
    route === "home"
      ? "Procurement, in plain sight."
      : route === "analyze"
        ? "Understand what changed."
        : route === "comparison"
          ? report?.mode === "brief"
            ? "Procurement brief"
            : "Change transparency report"
          : route === "dashboard"
            ? "Your transparency workspace"
            : route === "documents"
              ? "Document library"
              : route === "history"
                ? "Report history"
                : route === "evidence"
                  ? "Follow every finding to its source."
                  : route === "architecture"
                    ? "Built for verifiable understanding."
                    : route === "security"
                      ? "Private by default. Honest by design."
                      : "From two notices to a clear picture.";
  const totalChanges = store.reports.reduce((n, r) => n + r.changes.length, 0);
  return (
    <div className={dark ? "app dark" : "app"}>
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">Δ</span>
          <span>
            ProcureDelta<span className="ai-label">AI</span>
            <small>CIVIC INTELLIGENCE</small>
          </span>
        </Link>
        <div className="workspace-label">
          PERSONAL WORKSPACE <span>LOCAL</span>
        </div>
        <nav aria-label="Main navigation">
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={"/" + href}
              className={route === href ? "active" : ""}
            >
              <Icon size={18} />
              {label}
              {href === "analyze" && <span className="nav-plus">↗</span>}
            </Link>
          ))}
        </nav>
        <div className="nav-section">RESOURCES</div>
        <nav aria-label="Resources">
          {resources.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={"/" + href}
              className={route === href ? "active" : ""}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-card">
            <span className="status-dot" />
            <strong>Local processing active</strong>
            <p>Your documents stay in this browser.</p>
            <Link href="/security">
              How your data is handled <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="prototype">
            <span className="avatar">PD</span>
            <div>
              Public-interest technology
              <small>Independent prototype · v1.0</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div>
            Workspace <ChevronRight size={14} />{" "}
            <strong>
              {route === "home"
                ? "Welcome"
                : route.charAt(0).toUpperCase() + route.slice(1)}
            </strong>
          </div>
          <div>
            <span className="private">
              <LockKeyhole size={13} /> No API key required
            </span>
            <button
              className="icon-button"
              aria-label="Toggle appearance"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link className="icon-button" aria-label="Help" href="/docs">
              <CircleHelp size={18} />
            </Link>
          </div>
        </header>
        <main>
          <div className="eyebrow">
            <span /> PROCUREMENT TRANSPARENCY, MADE ACCESSIBLE
          </div>
          <div className="page-heading">
            <div>
              <h1>{title}</h1>
              <p>
                {route === "analyze"
                  ? "Compare an original tender with its amendment. Get a clear, source-linked account of the differences."
                  : route === "comparison"
                    ? "A traceable view of the changes that deserve your attention."
                    : route === "home"
                      ? "Turn complex tender amendments into clear, evidence-backed understanding."
                      : "Evidence first. Clear explanations. You stay in control."}
              </p>
            </div>
            {route !== "analyze" && route !== "home" && (
              <Link href="/analyze" className="button primary">
                <Plus size={16} /> New analysis
              </Link>
            )}
          </div>
          {error && (
            <div className="error" role="alert">
              {error}{" "}
              <button
                onClick={() => {
                  localStorage.removeItem("procuredelta.v1");
                  setStore(emptyStore);
                  setError("");
                }}
              >
                Clear all local data
              </button>
            </div>
          )}
          {route === "home" && (
            <>
              <section className="hero">
                <div>
                  <span className="pill">
                    OPEN DOCUMENTS. INFORMED COMMUNITIES.
                  </span>
                  <h2>
                    The fine print changes.
                    <br />
                    <em>Now you can see how.</em>
                  </h2>
                  <p>
                    Compare tender notices, identify important differences, and
                    trace every finding back to the original words.
                  </p>
                  <div className="actions">
                    <Link href="/analyze" className="button primary">
                      Compare documents <ArrowRight size={17} />
                    </Link>
                    <Link href="/architecture" className="button secondary">
                      See how it works
                    </Link>
                  </div>
                  <div className="hero-note">
                    <ShieldCheck size={16} /> Free local analysis · No account ·
                    No API key
                  </div>
                </div>
                <div className="hero-report">
                  <div className="report-top">
                    <span className="doc-icon green">
                      <GitCompareArrows />
                    </span>
                    <span>
                      ONE AMENDMENT.
                      <br />
                      <strong>A clearer picture.</strong>
                    </span>
                  </div>
                  <div className="example-label">
                    FICTIONAL EXAMPLE · RUN IT IN THE ANALYZER
                  </div>
                  <div className="example-row">
                    <span>Submission deadline</span>
                    <div>
                      <del>10 Nov 2026</del>
                      <ArrowRight size={17} />
                      <strong>17 Nov 2026</strong>
                    </div>
                    <small>7 additional days to submit</small>
                  </div>
                  <div className="example-row">
                    <span>Experience requirement</span>
                    <div>
                      <del>2 years</del>
                      <ArrowRight size={17} />
                      <strong>3 years</strong>
                    </div>
                    <small>1 additional year of experience</small>
                  </div>
                  <div className="verified">
                    <Check size={15} /> Every finding connected to source text
                  </div>
                </div>
              </section>
              <div className="three feature-grid">
                {[
                  [
                    "01",
                    "Bring the source",
                    "Upload text-based PDFs or paste the two notices. Correct extraction before comparing.",
                  ],
                  [
                    "02",
                    "See the difference",
                    "Local rules compare labeled dates, budgets, conditions, and requirements.",
                  ],
                  [
                    "03",
                    "Check the evidence",
                    "Inspect exact quotations, verify context, and print a shareable report.",
                  ],
                ].map(([n, h, p]) => (
                  <section className="card" key={n}>
                    <span className="step-number">{n}</span>
                    <h3>{h}</h3>
                    <p>{p}</p>
                  </section>
                ))}
              </div>
              <div className="notice">
                <ShieldCheck size={20} />
                <p>
                  <strong>Clarity is a public good.</strong> ProcureDelta
                  highlights document differences for human review. It is an
                  independent prototype, not an official procurement service or
                  a determination of wrongdoing.
                </p>
              </div>
            </>
          )}
          {route === "analyze" && (
            <>
              <div className="card">
                <label>
                  Analysis mode
                  <select
                    aria-label="Analysis mode"
                    value={single ? "brief" : "comparison"}
                    onChange={(e) => setSingle(e.target.value === "brief")}
                  >
                    <option value="comparison">
                      Original + amendment comparison
                    </option>
                    <option value="brief">Single notice brief</option>
                  </select>
                </label>
                <p>
                  A revised notice is optional. Use a single notice to
                  understand its dates, requirements, and supporting evidence.
                </p>
              </div>
              <div className="workflow">
                <span className="current">
                  <b>1</b> Add documents
                </span>
                <i />
                <span>
                  <b>2</b> Compare & review
                </span>
                <i />
                <span>
                  <b>3</b> Verify evidence
                </span>
              </div>
              <div className="demo-strip">
                <div>
                  <span className="spark">✧</span>
                  <div>
                    <strong>Take a closer look. Try a fictional tender.</strong>
                    <p>
                      Two notices. A changed deadline and experience
                      requirement. Real local processing.
                    </p>
                  </div>
                </div>
                <button className="button secondary" onClick={demo}>
                  Load demo documents <ArrowRight size={15} />
                </button>
              </div>
              <div className="two upload-grid">
                <InputPanel
                  doc={original}
                  setDoc={setOriginal}
                  side="Original"
                />
                {!single && (
                  <InputPanel
                    doc={revised}
                    setDoc={setRevised}
                    side="Revised"
                  />
                )}
              </div>
              <div className="analysis-controls">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    disabled={single}
                    checked={complete}
                    onChange={(e) => setComplete(e.target.checked)}
                  />{" "}
                  Both documents are complete versions, and the revised notice
                  replaces the original.
                </label>
                <p>
                  Leave unchecked for partial amendments. Missing fields will be
                  marked uncertain, not removed.
                </p>
                <div className="action-bar">
                  <span>
                    <LockKeyhole size={15} /> Rule-based analysis · documents
                    stay local
                  </span>
                  <button
                    className="button primary"
                    disabled={!!progress || !ready}
                    onClick={() => void analyze()}
                  >
                    {progress ||
                      (single
                        ? "Create procurement brief"
                        : "Analyze changes")}{" "}
                    {!progress && <ArrowRight size={17} />}
                  </button>
                </div>
                <p role="status">{progress}</p>
              </div>
              <div className="notice">
                <CircleHelp size={19} />
                <p>
                  Local processing recognizes supported prose, labeled fields,
                  and explicit amendment instructions. OCR is optional and
                  local. Complex layouts and unrecognized clauses still require
                  review; all results are tied to supplied text, not
                  independently verified official sources.
                </p>
              </div>
            </>
          )}
          {(route === "comparison" || route === "evidence") &&
            (report ? (
              <>
                <div className="report-banner">
                  <div>
                    <span className="pill">
                      {route === "evidence"
                        ? "SOURCE VERIFICATION"
                        : "LOCAL RULE-BASED REPORT"}
                    </span>
                    <h2>
                      {report.effectiveFields?.fields.tenderTitle?.value ??
                        report.revisedFields.fields.tenderTitle?.value ??
                        report.revised.title}
                    </h2>
                    <p>
                      {new Date(report.createdAt).toLocaleString()} ·{" "}
                      {report.mode === "brief"
                        ? "Single-document brief"
                        : report.completeReplacement
                          ? "Complete replacement confirmed by user"
                          : "Partial amendment / context unconfirmed"}
                    </p>
                  </div>
                  <div className="actions">
                    <button className="button secondary" onClick={printReport}>
                      <Download size={15} /> Print / PDF
                    </button>
                    <button className="button secondary" onClick={exportReport}>
                      JSON
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => {
                        setOriginal(report.original);
                        setRevised(report.revised);
                        setComplete(report.completeReplacement);
                        setSingle(report.mode === "brief");
                        router.push("/analyze");
                        sessionStorage.setItem(
                          "procuredelta.edit",
                          JSON.stringify({
                            original: report.original,
                            revised: report.revised,
                            complete: report.completeReplacement,
                            single: report.mode === "brief",
                          }),
                        );
                      }}
                    >
                      Correct inputs
                    </button>
                  </div>
                </div>
                <div className="stats">
                  <Stat
                    label="Findings for review"
                    value={report.changes.length}
                  />
                  <Stat
                    label="Modified fields"
                    value={
                      report.changes.filter((c) => c.kind === "Modified").length
                    }
                  />
                  <Stat
                    label="Uncertain findings"
                    value={
                      report.changes.filter((c) => c.kind === "Uncertain")
                        .length
                    }
                  />
                  <Stat
                    label="Source documents"
                    value={report.mode === "brief" ? 1 : 2}
                  />
                </div>
                <div className="section-title">
                  <h2>
                    {route === "evidence"
                      ? "Exact passages, original context"
                      : "What changed"}
                  </h2>
                  <span className="pill">
                    DOCUMENT FACTS + RULE-BASED EXPLANATIONS
                  </span>
                </div>
                {report.mode !== "brief" && !report.changes.length && (
                  <div className="card">
                    <h3>No structured changes detected</h3>
                    <p>
                      This does not certify that the notices are identical.
                      Review the full text difference below.
                    </p>
                  </div>
                )}
                {report.changes.map((change, i) => (
                  <article
                    className="card change-card"
                    key={`${change.field}-${i}`}
                  >
                    <div className="change-heading">
                      <div>
                        <span className="finding-number">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3>
                          {bangla
                            ? banglaLabels[change.field]
                            : labels[change.field]}
                        </h3>
                      </div>
                      <span className={"badge " + change.kind.toLowerCase()}>
                        {change.kind}
                      </span>
                    </div>
                    <div className="two comparison-values">
                      <div>
                        <small>ORIGINAL DOCUMENT</small>
                        <p>{change.before?.value ?? "Not identified"}</p>
                      </div>
                      <div>
                        <small>REVISED DOCUMENT</small>
                        <p>
                          {change.after?.value ??
                            (change.kind === "Removed"
                              ? "Explicitly removed; inspect instruction"
                              : "Not identified")}
                        </p>
                      </div>
                    </div>
                    <p className="explanation">
                      <CircleHelp size={16} />
                      {change.explanation}
                    </p>
                    {change.method && (
                      <p className="muted">Resolution: {change.method}</p>
                    )}
                    <details open={route === "evidence"}>
                      <summary>
                        <ScanLine size={16} /> Inspect source evidence
                      </summary>
                      <div className="two">
                        <Evidence fact={change.before} doc={report.original} />
                        <Evidence fact={change.after} doc={report.revised} />
                      </div>
                      {change.instruction && (
                        <>
                          <h4>Operative amendment instruction</h4>
                          <Evidence
                            fact={change.instruction}
                            doc={report.revised}
                          />
                        </>
                      )}
                    </details>
                  </article>
                ))}
                <section className="card">
                  <div className="section-title">
                    <h2>
                      {bangla ? "দরপত্রের সারসংক্ষেপ" : "Procurement brief"}
                    </h2>
                    <button
                      className="button secondary"
                      onClick={() => setBangla(!bangla)}
                    >
                      {bangla ? "English labels" : "বাংলা শিরোনাম"}
                    </button>
                  </div>
                  {bangla && (
                    <p lang="bn">
                      শিরোনাম বাংলায় দেখানো হচ্ছে। মূল নথির উদ্ধৃতি ও
                      বিশ্লেষণের ভাষা অপরিবর্তিত রয়েছে। এটি স্বয়ংক্রিয় অনুবাদ
                      নয়।
                    </p>
                  )}
                  <p className="muted">
                    Source-supported reading of the notice and resolved
                    amendments. Original-only conditions are labeled as carried
                    context. Unknowns and conflicting statements require review.
                  </p>
                  <div className="brief-grid">
                    {Object.entries(labels).map(([key, label]) => {
                      const fact = (
                        report.effectiveFields ?? report.revisedFields
                      ).fields[key as keyof typeof labels];
                      return (
                        <details key={key}>
                          <summary>
                            {bangla
                              ? banglaLabels[key as keyof typeof labels]
                              : label}
                            {report.carriedFields?.includes(
                              key as keyof typeof labels,
                            ) && (
                              <small>
                                {" "}
                                · Original condition / carried context
                              </small>
                            )}
                            <strong>
                              {fact?.value ?? "Unknown / not identified"}
                            </strong>
                          </summary>
                          <Evidence
                            fact={fact}
                            doc={report.revised}
                            alternate={report.original}
                          />
                        </details>
                      );
                    })}
                  </div>
                  {[
                    ...report.originalFields.extractionWarnings,
                    ...report.revisedFields.extractionWarnings,
                    ...(report.effectiveFields?.extractionWarnings ?? []),
                  ].map((w, i) => (
                    <p key={i} className="warning">
                      {w}
                    </p>
                  ))}
                </section>
                <ReportReview
                  report={report}
                  onReview={(value) =>
                    save({
                      ...store,
                      reports: store.reports.map((r) =>
                        r.id === report.id ? { ...r, reviewed: value } : r,
                      ),
                    })
                  }
                />
                <section className="card">
                  <h2>
                    {report.mode === "brief"
                      ? "Source text"
                      : "Full text difference"}
                  </h2>
                  <p className="muted">
                    Text edits only; highlights do not establish legal meaning.{" "}
                    <del>Removed text</del> · <ins>Added text</ins>
                  </p>
                  <div className="text-diff">
                    {diffWords(
                      report.original.pages.map((p) => p.text).join("\n"),
                      report.revised.pages.map((p) => p.text).join("\n"),
                    ).map((part, i) =>
                      part.added ? (
                        <ins key={i}>{part.value}</ins>
                      ) : part.removed ? (
                        <del key={i}>{part.value}</del>
                      ) : (
                        <span key={i}>{part.value}</span>
                      ),
                    )}
                  </div>
                </section>
                <OptionalAi key={report.id} report={report} />
              </>
            ) : (
              <Empty title="Your first comparison starts with two documents." />
            ))}
          {route === "documents" && (
            <>
              <div className="section-title">
                <h2>{store.documents.length} saved documents</h2>
                <Link href="/analyze" className="button secondary">
                  <Upload size={16} /> Add documents
                </Link>
              </div>
              <SearchBox query={query} setQuery={setQuery} />
              {!store.documents.length ? (
                <Empty title="A home for your source documents." />
              ) : (
                store.documents
                  .filter((d) =>
                    `${d.title} ${d.authority}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((doc) => (
                    <details className="card document-row" key={doc.id}>
                      <summary>
                        <FileText size={22} />
                        <div>
                          <strong>{doc.title}</strong>
                          <small>
                            {doc.kind.toUpperCase()} · {doc.pages.length} text
                            section(s)
                            {doc.authority
                              ? ` · User-entered authority: ${doc.authority}`
                              : ""}
                          </small>
                        </div>
                      </summary>
                      {doc.url && (
                        <p>
                          <a href={doc.url} rel="noreferrer" target="_blank">
                            User-provided source ↗
                          </a>{" "}
                          · not verified
                        </p>
                      )}
                      {doc.pages.map((p, i) => (
                        <div key={i}>
                          <span className="pill">
                            {p.page
                              ? `PAGE ${p.page}`
                              : "TEXT · NO PAGE CITATION"}
                          </span>
                          <pre>{p.text}</pre>
                        </div>
                      ))}
                      <button
                        className="button danger"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 size={15} /> Delete document and linked reports
                      </button>
                    </details>
                  ))
              )}
            </>
          )}
          {(route === "history" || route === "dashboard") && (
            <>
              {route === "dashboard" && (
                <>
                  <div className="stats">
                    <Stat
                      label="Documents analyzed"
                      value={
                        new Set(
                          store.reports.flatMap((r) => [
                            r.original.id,
                            r.revised.id,
                          ]),
                        ).size
                      }
                    />
                    <Stat
                      label="Comparisons performed"
                      value={
                        store.reports.filter((r) => r.mode !== "brief").length
                      }
                    />
                    <Stat label="Recorded findings" value={totalChanges} />
                    <Stat
                      label="Uncertain findings"
                      value={store.reports.reduce(
                        (n, r) =>
                          n +
                          r.changes.filter((c) => c.kind === "Uncertain")
                            .length,
                        0,
                      )}
                    />
                  </div>
                  <section className="card">
                    <h2>Findings by category</h2>
                    <p className="muted">
                      Counts across saved reports; repeated analyses are counted
                      separately.
                    </p>
                    {["Modified", "Added", "Removed", "Uncertain"].map(
                      (kind) => {
                        const count = store.reports.reduce(
                          (n, r) =>
                            n + r.changes.filter((c) => c.kind === kind).length,
                          0,
                        );
                        return (
                          <div className="bar-row" key={kind}>
                            <span>{kind}</span>
                            <div>
                              <i
                                style={{
                                  width: `${totalChanges ? (count / totalChanges) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <strong>{count}</strong>
                          </div>
                        );
                      },
                    )}
                  </section>
                </>
              )}
              <div className="section-title">
                <h2>
                  {route === "dashboard"
                    ? "Recent reports"
                    : "Saved comparisons"}
                </h2>
                <span className="muted">Stored on this device</span>
              </div>
              <Timelines
                reports={store.reports}
                onOpen={open}
                onAmend={(r) => {
                  sessionStorage.setItem(
                    "procuredelta.edit",
                    JSON.stringify({
                      original: r.original,
                      revised: makeDocument("", "New amendment"),
                      complete: false,
                      single: false,
                    }),
                  );
                  router.push("/analyze");
                }}
              />
              <SearchBox query={query} setQuery={setQuery} />
              {!store.reports.length ? (
                <Empty title="Your work will tell the story." />
              ) : (
                store.reports
                  .filter((r) =>
                    searchableReport(r).includes(query.toLowerCase()),
                  )
                  .map((r) => (
                    <div className="card history-row" key={r.id}>
                      <span className="doc-icon green">
                        <GitCompareArrows size={22} />
                      </span>
                      <button className="report-link" onClick={() => open(r)}>
                        <strong>{r.revised.title}</strong>
                        <small>
                          {new Date(r.createdAt).toLocaleString()} ·{" "}
                          {r.changes.length} findings
                        </small>
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Delete report ${r.revised.title}`}
                        onClick={() =>
                          save({
                            ...store,
                            reports: store.reports.filter((x) => x.id !== r.id),
                          })
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label="Open report"
                        onClick={() => open(r)}
                      >
                        <ArrowUpRight size={20} />
                      </button>
                    </div>
                  ))
              )}
            </>
          )}
          {["architecture", "security", "docs"].includes(route) && (
            <Info route={route} clear={() => save(emptyStore)} />
          )}
        </main>
        <footer>
          <span>
            ProcureDelta AI <b>·</b> Making Public Procurement Understandable
          </span>
          <span>
            Independent prototype <b>·</b> Official documents remain
            authoritative
          </span>
        </footer>
      </div>
      <EditLoader
        route={route}
        setOriginal={setOriginal}
        setRevised={setRevised}
        setComplete={setComplete}
        setSingle={setSingle}
      />
    </div>
  );
}
function EditLoader({
  route,
  setOriginal,
  setRevised,
  setComplete,
  setSingle,
}: {
  route: string;
  setOriginal: (d: Document) => void;
  setRevised: (d: Document) => void;
  setComplete: (v: boolean) => void;
  setSingle: (v: boolean) => void;
}) {
  useEffect(() => {
    if (route === "analyze") {
      const raw = sessionStorage.getItem("procuredelta.edit");
      if (raw) {
        try {
          const data = JSON.parse(raw);
          setOriginal(data.original);
          setRevised(data.revised);
          setComplete(data.complete);
          setSingle(data.single ?? false);
        } finally {
          sessionStorage.removeItem("procuredelta.edit");
        }
      }
    }
  }, [route, setOriginal, setRevised, setComplete, setSingle]);
  return null;
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>From your saved analyses</small>
    </div>
  );
}
function SearchBox({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (s: string) => void;
}) {
  return (
    <label className="search">
      <Search size={18} />
      <input
        aria-label="Search saved records"
        placeholder="Search by document title…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </label>
  );
}
function Empty({ title }: { title: string }) {
  return (
    <section className="card empty">
      <span className="doc-icon green">
        <FileText size={30} />
      </span>
      <h2>{title}</h2>
      <p>
        Compare your own notices or explore the explicitly fictional example.
        <br />
        Your saved results will appear here.
      </p>
      <Link href="/analyze" className="button primary">
        Start an analysis <ArrowRight size={16} />
      </Link>
    </section>
  );
}
function Info({ route, clear }: { route: string; clear: () => void }) {
  const content =
    route === "architecture"
      ? [
          [
            "01 · Ingestion",
            "Text-based PDFs are parsed in your browser using a patched PDF.js release. Exact text and actual page numbers are retained. Pasted and corrected text has no page attribution. Optional Tesseract OCR runs locally on image-only pages; verify the recognized text.",
          ],
          [
            "02 · Deterministic extraction",
            "English prose and label patterns recognize dates, amounts, experience, delivery and eligibility terms. Clause-linked amendment instructions match old values before applying replacements. Bengali labels and digits are supported; general bilingual understanding is not claimed. This is deterministic processing, not model inference.",
          ],
          [
            "03 · Comparison and evidence",
            "Structured fields and explicit amendment instructions are compared alongside a word diff. Missing fields remain uncertain unless a complete replacement or unchanged-terms statement supplies context. Unclassified operative wording is queued for human review. Quotations remain exact; legal meaning is never certified.",
          ],
          [
            "04 · Persistence and optional AI",
            "Validated records are saved in browser localStorage with a versioned key. A storage adapter can later target Postgres. Optional Gemini or a separately installed Ollama model provides schema-validated interpretations with exact-quote checks. No model is installed or enabled by default.",
          ],
        ]
      : route === "security"
        ? [
            [
              "Your documents stay local by default",
              "PDF extraction, deterministic comparison, and saved reports run in your browser. There is no account, database, analytics tracker, or automatic cloud upload. Optional AI sends both texts to Google only after a separate consent action.",
            ],
            [
              "Storage and deletion",
              "Browser localStorage is not encrypted. Anyone using this browser profile can access saved documents. Deleting a document also deletes linked reports. Clearing browser data removes all saved work. Export reports before clearing.",
            ],
            [
              "Untrusted input, bounded processing",
              "PDFs are limited to 10 MB, 100 pages, and 150,000 extracted characters. Text renders as escaped React content. Source URLs permit HTTP(S) only and are never fetched by the server. Model requests are bounded, same-origin, and disabled by default.",
            ],
            [
              "Responsible interpretation",
              "Official procurement notices remain authoritative. This prototype cannot determine corruption, fraud, compliance, or legal meaning. Source quote validation checks textual presence, not truth or entailment. Prompt injection defenses reduce risk but do not guarantee model behavior.",
            ],
          ]
        : [
            [
              "1 · Add the two notices",
              "Open New analysis. Upload a text-based PDF or paste text into each panel. Add optional titles, issuing authority, and public source links. Metadata is user-provided and is not treated as an extracted fact.",
            ],
            [
              "2 · Review and compare",
              "Correct the extracted text before analyzing. For local extraction use labels such as Submission deadline: November 10, 2026 and Experience requirement: two years. Only check complete replacement if both documents really are complete versions.",
            ],
            [
              "3 · Inspect the evidence",
              "Review old and new values, expand source evidence, and check the full text difference. The procurement brief shows recognized fields and unknowns. Correct inputs and rerun when needed; existing reports remain historical snapshots.",
            ],
            [
              "4 · Save and share",
              "Reports save automatically in this browser. Open them from History, inspect metrics on Overview, and print a report using your browser’s Save as PDF option. JSON export includes source documents; handle it accordingly.",
            ],
            [
              "One-minute fictional demonstration",
              "Open New analysis → Load demo documents → Analyze changes. Show the seven-day deadline extension and one-year experience increase. Expand evidence, then visit Overview to show the actual saved metrics. No key or network API is required.",
            ],
          ];
  return (
    <div className="info-grid">
      {content.map(([h, p]) => (
        <section className="card" key={h}>
          <h2>{h}</h2>
          <p>{p}</p>
        </section>
      ))}
      {route === "security" && (
        <section className="card">
          <h2>Delete local workspace</h2>
          <p>Removes all documents and saved comparisons from this browser.</p>
          <button
            className="button danger"
            onClick={() => {
              if (window.confirm("Delete all local documents and reports?"))
                clear();
            }}
          >
            <Trash2 size={16} /> Clear all local data
          </button>
        </section>
      )}
    </div>
  );
}
