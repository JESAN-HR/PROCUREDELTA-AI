import { describe, it, expect } from "vitest";
import { makeDocument, compare, createBrief } from "../src/lib/engine";
import { validateAiOutput } from "../src/lib/ai";
import { publicReportHtml, procurementGroups } from "../src/lib/reports";
describe("grounding and review safeguards", () => {
  const a = makeDocument("Deadline: November 10, 2026"),
    b = makeDocument("Deadline: November 17, 2026");
  it("rejects model facts without verbatim source support", () =>
    expect(() =>
      validateAiOutput(
        {
          facts: [
            {
              field: "estimatedBudget",
              value: "BDT 900,000",
              quote: "Invented budget",
              document: "original",
            },
          ],
          interpretations: [],
        },
        a,
        b,
      ),
    ).toThrow());
  it("rejects invented interpretations evidence", () =>
    expect(() =>
      validateAiOutput(
        {
          facts: [],
          interpretations: [
            {
              explanation: "Example",
              originalQuote: a.pages[0].text,
              revisedQuote: "Not in source",
              uncertainty: "Review",
            },
          ],
        },
        a,
        b,
      ),
    ).toThrow());
  it("accepts structurally valid source-matching output without calling a model", () =>
    expect(
      validateAiOutput(
        {
          facts: [
            {
              field: "submissionDeadline",
              value: "November 10, 2026",
              quote: a.pages[0].text,
              document: "original",
            },
          ],
          interpretations: [],
        },
        a,
        b,
      ).facts,
    ).toHaveLength(1));
  it("requires review and escapes active HTML in public export", () => {
    const r = createBrief(
      makeDocument("Tender title: <script>alert(1)</script>"),
    );
    expect(() => publicReportHtml(r)).toThrow("Review");
    const html = publicReportHtml({ ...r, reviewed: true });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
  it("groups briefs and comparisons by identifier", () => {
    const doc = makeDocument("Tender ID: PUBLIC-2026-12");
    const r = createBrief(doc);
    expect(
      procurementGroups([
        r,
        compare(
          doc,
          makeDocument(
            "Tender ID: PUBLIC-2026-12\nDeadline: November 17, 2026",
          ),
        ),
      ]),
    ).toHaveLength(1);
  });
  it("detects time-only changes in referenced amendment rows", () => {
    const r = compare(
      makeDocument(
        "1. RECEIPT\nOffers must arrive no later than 14:00 hours on 10 November 2026.",
      ),
      makeDocument(
        "Existing wording / Read instead\nPage 1, clause 1\n10 November 2026, at 14:00 hours\n10 November 2026, at 16:00 hours",
      ),
    );
    expect(
      r.changes.find((c) => c.field === "submissionTime")?.after?.normalized,
    ).toBe("16:00");
    expect(
      r.changes.find((c) => c.field === "submissionDeadline"),
    ).toBeUndefined();
  });
});
