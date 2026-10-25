"use client";
import type { Report } from "@/lib/engine";
import { procurementGroups, publicReportHtml } from "@/lib/reports";
export function ReportReview({
  report,
  onReview,
}: {
  report: Report;
  onReview: (value: boolean) => void;
}) {
  function download() {
    const url = URL.createObjectURL(
      new Blob([publicReportHtml(report)], { type: "text/html" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `procuredelta-public-${report.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="card">
      <h2>Review before sharing</h2>
      {[
        ...(report.originalFields.reviewPassages ?? []),
        ...(report.mode === "brief"
          ? []
          : (report.revisedFields.reviewPassages ?? [])),
      ].map((e, i) => (
        <details key={i}>
          <summary>
            Unclassified operative wording — human review needed
          </summary>
          <blockquote>
            {e.quote}
            <cite>
              {e.documentId === report.original.id
                ? report.original.title
                : report.revised.title}
              {e.page ? ` · Page ${e.page}` : ""}
            </cite>
          </blockquote>
        </details>
      ))}
      <p>
        Exact quotations establish what the supplied document says, not that its
        source is official. Public source URLs are user-provided and have not
        been authenticated.
      </p>
      {(report.unresolved ?? []).map((message, i) => (
        <p className="warning" key={i}>
          {message}
        </p>
      ))}
      <label className="checkbox">
        <input
          type="checkbox"
          checked={report.reviewed ?? false}
          onChange={(e) => onReview(e.target.checked)}
        />{" "}
        I reviewed the source evidence and uncertainty before sharing this
        report.
      </label>
      <button
        className="button secondary"
        disabled={!report.reviewed}
        onClick={download}
      >
        Download reviewed public report (HTML)
      </button>
      <p className="muted">
        Creates a standalone readable report you can share or host yourself.
        Nothing is automatically published. It contains quoted source text.
      </p>
    </section>
  );
}
export function Timelines({
  reports,
  onOpen,
  onAmend,
}: {
  reports: Report[];
  onOpen: (r: Report) => void;
  onAmend: (r: Report) => void;
}) {
  return (
    <section className="card">
      <h2>Procurement timelines</h2>
      <p>
        Grouped by extracted procurement identifier. Entries follow analysis
        time; issue dates are shown when found. Grouping does not authenticate
        that documents belong together.
      </p>
      {!reports.length && (
        <p>No procurement records yet. Create a brief or compare notices.</p>
      )}
      {procurementGroups(reports).map((group) => (
        <details key={group.key}>
          <summary>
            <strong>{group.title}</strong> · {group.key} ·{" "}
            {group.records.length} record(s)
          </summary>
          <ol>
            {group.records.map((r) => (
              <li key={r.id}>
                <button className="text-button" onClick={() => onOpen(r)}>
                  {r.mode === "brief" ? "Original brief" : "Comparison"} ·{" "}
                  {new Date(r.createdAt).toLocaleString()} · notice issued{" "}
                  {r.revisedFields.fields.publicationDate?.value ?? "unknown"}
                </button>
              </li>
            ))}
          </ol>
          <button
            className="button secondary"
            onClick={() => onAmend(group.records[0])}
          >
            Compare another amendment with original
          </button>
          <p className="muted">
            Each amendment is compared against the original notice. Multiple
            amendments are not automatically consolidated.
          </p>
        </details>
      ))}
    </section>
  );
}
