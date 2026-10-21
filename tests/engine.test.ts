import { describe, it, expect } from "vitest";
import {
  compare,
  extract,
  makeDocument,
  normalize,
  originalDemo,
  revisedDemo,
  documentSchema,
} from "../src/lib/engine";
import { readStore, writeStore } from "../src/lib/storage";
import { readPdf } from "../src/lib/pdf";
describe("real local processing", () => {
  it("detects the fictional seven-day and one-year changes", () => {
    const r = compare(
      makeDocument(originalDemo),
      makeDocument(revisedDemo),
      true,
    );
    expect(r.changes).toHaveLength(2);
    expect(r.changes[0].explanation).toContain("extended by 7 days");
    expect(r.changes[1].explanation).toContain("increased by 1 year");
  });
  it("normalizes unambiguous dates and numbers", () => {
    expect(normalize("submissionDeadline", "November 10, 2026")).toBe(
      "2026-11-10",
    );
    expect(normalize("submissionDeadline", "02/03/2026")).toBe("02/03/2026");
    expect(normalize("estimatedBudget", "BDT 2,500,000")).toBe("bdt 2500000");
    expect(normalize("submissionDeadline", "February 30, 2026")).toBe(
      "february 30, 2026",
    );
  });
  it("ignores unchanged fields", () =>
    expect(
      compare(makeDocument(originalDemo), makeDocument(originalDemo)).changes,
    ).toEqual([]));
  it("does not treat absence as removal in partial amendments", () => {
    const r = compare(
      makeDocument(originalDemo),
      makeDocument("Submission deadline: November 17, 2026"),
    );
    expect(
      r.changes.find((c) => c.field === "experienceRequirements")?.kind,
    ).toBe("Uncertain");
  });
  it("classifies complete-version additions and removals", () => {
    const r = compare(
      makeDocument("Tender title: Test\nExperience: two years"),
      makeDocument("Tender title: Test\nEligibility: Registered"),
      true,
    );
    expect(r.changes.map((c) => c.kind).sort()).toEqual(["Added", "Removed"]);
  });
  it("retains unknowns and reports missing deadline", () => {
    const e = extract(makeDocument("Some prose with no recognized labels"));
    expect(e.fields.submissionDeadline).toBeUndefined();
    expect(e.extractionWarnings.length).toBeGreaterThan(0);
  });
  it("flags conflicting information", () => {
    const d = makeDocument(
      "Submission deadline: November 10, 2026\nSubmission deadline: November 12, 2026",
    );
    expect(extract(d).fields.submissionDeadline?.conflict).toBe(true);
    expect(
      compare(d, makeDocument(revisedDemo)).changes.find(
        (c) => c.field === "submissionDeadline",
      )?.kind,
    ).toBe("Uncertain");
  });
  it("preserves exact quotes and real page references", () => {
    const d = makeDocument();
    d.pages = [{ text: "  Experience: two years  ", page: 3 }];
    const e = extract(d).fields.experienceRequirements!.evidence[0];
    expect(e.quote).toBe("  Experience: two years  ");
    expect(e.page).toBe(3);
    expect(e.documentId).toBe(d.id);
    expect(
      extract(makeDocument("Experience: two years")).fields
        .experienceRequirements!.evidence[0].page,
    ).toBeUndefined();
  });
  it("rejects blank input and unsafe URL schemes", () => {
    expect(() => compare(makeDocument(), makeDocument(revisedDemo))).toThrow();
    expect(
      documentSchema.safeParse({
        ...makeDocument("Text"),
        url: "javascript:alert(1)",
      }).success,
    ).toBe(false);
  });
  it("persists comparisons without changing evidence", () => {
    const r = compare(makeDocument(originalDemo), makeDocument(revisedDemo));
    let raw = "";
    const storage = {
      getItem: () => raw,
      setItem: (_: string, v: string) => {
        raw = v;
      },
    };
    writeStore(storage, {
      documents: [r.original, r.revised],
      reports: [r],
      activeId: r.id,
    });
    expect(readStore(storage).reports[0]).toEqual(r);
  });
  it("rejects malformed storage", () =>
    expect(() => readStore({ getItem: () => "{bad" })).toThrow());
  it("rejects invalid and oversized PDF input before parsing", async () => {
    await expect(
      readPdf(new File(["not pdf"], "fake.pdf", { type: "application/pdf" })),
    ).rejects.toThrow("signature");
    await expect(
      readPdf(new File(["text"], "test.txt", { type: "text/plain" })),
    ).rejects.toThrow("MIME");
    await expect(
      readPdf(
        new File([new Uint8Array(11 * 1024 * 1024)], "large.pdf", {
          type: "application/pdf",
        }),
      ),
    ).rejects.toThrow("10 MB");
  });
});
