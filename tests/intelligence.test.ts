import { describe, it, expect } from "vitest";
import { compare, createBrief, makeDocument } from "../src/lib/engine";
import { evidenceIsValid } from "../src/lib/intelligence";
import messy from "./fixtures/messy-pdfjs.json";
const original = {
  ...makeDocument("", "Messy original"),
  pages: messy.original,
};
const revised = {
  ...makeDocument("", "Partial amendment"),
  pages: messy.revised,
};
describe("messy-document evaluation", () => {
  it("extracts prose and table facts for a single-document brief", () => {
    const r = createBrief(original);
    expect(r.mode).toBe("brief");
    expect(r.originalFields.fields.submissionDeadline?.normalized).toBe(
      "2026-11-10",
    );
    expect(r.originalFields.fields.securityDeposit?.normalized).toBe(
      "bdt 50000",
    );
    expect(r.originalFields.fields.deliveryPeriod?.value).toMatch(/45/);
  });
  it("resolves six material amendments without treating unchanged terms as removed", () => {
    const r = compare(original, revised);
    expect(r.changes.map((c) => [c.field, c.kind])).toEqual(
      expect.arrayContaining([
        ["submissionDeadline", "Modified"],
        ["experienceRequirements", "Modified"],
        ["securityDeposit", "Modified"],
        ["deliveryPeriod", "Modified"],
        ["comparableContract", "Added"],
        ["certificationRequirements", "Removed"],
      ]),
    );
    expect(r.changes.filter((c) => c.kind !== "Uncertain")).toHaveLength(6);
    expect(
      r.changes.find((c) => c.field === "estimatedBudget"),
    ).toBeUndefined();
    expect(r.effectiveFields?.fields.paymentTerms?.value).toMatch(/30 days/);
    expect(r.effectiveFields?.fields.certificationRequirements).toBeUndefined();
  });
  it("every quotation is an exact substring on the cited source page", () => {
    const r = compare(original, revised);
    for (const c of r.changes)
      for (const f of [c.before, c.after, c.instruction])
        for (const e of f?.evidence ?? [])
          expect(
            evidenceIsValid(
              e.documentId === original.id ? original : revised,
              e,
            ),
          ).toBe(true);
  });
  it("does not apply a replacement whose old value does not match", () => {
    const r = compare(
      makeDocument("Bid security: BDT 50,000"),
      makeDocument("Replace bid security BDT 20,000 with BDT 75,000."),
    );
    expect(r.changes.some((c) => c.method)).toBe(false);
  });
  it("recognizes day-first dates and a different explicit replacement without fixture values", () => {
    const r = compare(
      makeDocument(
        "Offers must be received by 5 December 2027.\nBid security: USD 12,000",
      ),
      makeDocument(
        "The closing date is extended from 5 December 2027 to 8 December 2027.\nReplace bid security USD 12,000 with USD 9,000.",
      ),
    );
    expect(
      r.changes.find((c) => c.field === "submissionDeadline")?.after
        ?.normalized,
    ).toBe("2027-12-08");
    expect(
      r.changes.find((c) => c.field === "securityDeposit")?.explanation,
    ).toContain("USD 3,000");
  });
  it("marks unrelated procurements uncertain", () => {
    const r = compare(
      makeDocument("Tender ID: AA-2026-001\nDeadline: November 10, 2026"),
      makeDocument("Tender ID: BB-2026-002\nDeadline: November 17, 2026"),
    );
    expect(r.changes.every((c) => c.kind === "Uncertain")).toBe(true);
  });
  it("supports Bengali labeled fields and digit normalization without translating evidence", () => {
    const r = createBrief(
      makeDocument("দরপত্রের নাম: সড়ক সরঞ্জাম\nদরপত্র জামানত: BDT ৫০,০০০"),
    );
    expect(r.originalFields.fields.securityDeposit?.normalized).toBe(
      "bdt 50000",
    );
  });
});

it("handles quoted non-scalar clause replacements", () => {
  const r = compare(
    makeDocument("Equipment must be factory new."),
    makeDocument(
      'Replace "Equipment must be factory new." with "Certified refurbished equipment is also permitted."',
    ),
  );
  expect(r.changes.find((c) => c.field === "otherConditions")?.kind).toBe(
    "Modified",
  );
});

it("queues an independently sourced public amendment excerpt for human review", () => {
  // Source: MHA/NATGRID corrigendum, page 2, accessed 2026-10-23.
  // This is an excerpt-only abstention test, not an original/amendment pair.
  const quote =
    "The existing Form-6 of the Tender enquiry document stands replaced by the revised format as under:";
  const r = createBrief(makeDocument(quote));
  expect(r.originalFields.reviewPassages?.[0].quote).toBe(quote);
  expect(r.changes).toHaveLength(0);
});
