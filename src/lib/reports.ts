import type { Report, Field } from "./engine";
import { labels } from "./engine";
export const banglaLabels: Record<Field, string> = {
  otherConditions: "অন্যান্য শর্তের পরিবর্তন",
  tenderTitle: "দরপত্রের নাম",
  tenderIdentifier: "দরপত্র নম্বর",
  procuringAuthority: "ক্রয়কারী সংস্থা",
  publicationDate: "প্রকাশের তারিখ",
  submissionDeadline: "দাখিলের শেষ তারিখ",
  submissionTime: "দাখিলের শেষ সময়",
  estimatedBudget: "প্রাক্কলিত মূল্য",
  currency: "মুদ্রা",
  eligibilityRequirements: "যোগ্যতার শর্ত",
  experienceRequirements: "অভিজ্ঞতার শর্ত",
  technicalRequirements: "কারিগরি শর্ত",
  securityDeposit: "দরপত্র জামানত",
  paymentTerms: "পরিশোধের শর্ত",
  documentReferences: "নথির উল্লেখ",
  deliveryPeriod: "সরবরাহের সময়",
  comparableContract: "সমজাতীয় চুক্তির শর্ত",
  certificationRequirements: "সনদের শর্ত",
};
export function procurementGroups(reports: Report[]) {
  const groups = new Map<string, Report[]>();
  for (const r of reports) {
    const id = r.originalFields.fields.tenderIdentifier;
    const key = id && !id.conflict ? id.normalized : r.original.id;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.entries()].map(([key, records]) => ({
    key,
    records: records.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    title:
      records[0].originalFields.fields.tenderTitle?.value ??
      records[0].original.title,
  }));
}
export function searchableReport(report: Report) {
  return [
    report.original.title,
    report.revised.title,
    ...Object.values(
      report.effectiveFields?.fields ?? report.revisedFields.fields,
    ).map((f) => f?.value ?? ""),
    report.original.authority,
    report.revised.authority,
  ]
    .join(" ")
    .toLowerCase();
}
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function publicReportHtml(report: Report) {
  if (!report.reviewed)
    throw new Error(
      "Review the evidence and mark this report reviewed before exporting a public copy.",
    );
  const title =
    report.originalFields.fields.tenderTitle?.value ?? report.original.title;
  const source = (id: string) =>
    id === report.original.id ? report.original : report.revised;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(title)} — ProcureDelta</title><style>body{font:16px/1.6 system-ui;max-width:900px;margin:40px auto;padding:20px;color:#153b35}article{border:1px solid #ccd9d5;padding:20px;margin:20px 0}blockquote{white-space:pre-wrap;background:#f1f6f4;padding:15px}small{color:#536a62}dt{font-weight:bold}dd{margin:0 0 15px}</style><h1>${escape(title)}</h1><p>Human-reviewed local report · ${escape(report.createdAt)}. Reviewed by the exporting user; this is not official verification.</p><p>Document-supported facts and deterministic explanations. Official notices remain authoritative. No misconduct determination.</p><h2>Procurement brief</h2><dl>${Object.entries(
    report.effectiveFields?.fields ?? report.revisedFields.fields,
  )
    .map(
      ([k, f]) =>
        `<dt>${escape(labels[k as Field])}</dt><dd>${escape(f!.value)}${f!.evidence.map((e) => `<blockquote>${escape(e.quote)}<br><small>${escape(source(e.documentId).title)}${e.page ? ` · Page ${e.page}` : ""}</small></blockquote>`).join("")}</dd>`,
    )
    .join("")}</dl><h2>Findings</h2>${report.changes
    .map(
      (c) =>
        `<article><h3>${escape(labels[c.field])} — ${c.kind}</h3><p>${escape(c.before?.value ?? "Not identified")} → ${escape(c.after?.value ?? (c.kind === "Removed" ? "Explicitly removed" : "Not identified"))}</p><p>${escape(c.explanation)}</p>${[
          c.before,
          c.after,
          c.instruction,
        ]
          .flatMap((f) => f?.evidence ?? [])
          .map(
            (e) =>
              `<blockquote>${escape(e.quote)}<br><small>${escape(source(e.documentId).title)}${e.page ? ` · Page ${e.page}` : ""}</small></blockquote>`,
          )
          .join("")}</article>`,
    )
    .join(
      "",
    )}<h2>Limitations and unresolved items</h2><ul>${[...(report.unresolved ?? []), ...(report.effectiveFields?.extractionWarnings ?? []), "Sources and provenance have not been independently authenticated."].map((w) => `<li>${escape(w)}</li>`).join("")}</ul></html>`;
}
