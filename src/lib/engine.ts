import { z } from "zod";
export const pageSchema = z.object({
  text: z.string(),
  page: z.number().int().positive().optional(),
});
export const documentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  authority: z.string().max(200),
  url: z
    .string()
    .max(2000)
    .refine((v) => !v || /^https?:\/\//i.test(v), "Use an HTTP or HTTPS URL"),
  pages: z.array(pageSchema).min(1),
  kind: z.enum(["pdf", "text"]),
  edited: z.boolean().default(false),
});
export type Document = z.infer<typeof documentSchema>;
export const labels = {
  tenderTitle: "Tender title",
  tenderIdentifier: "Tender identifier",
  procuringAuthority: "Procuring authority",
  publicationDate: "Publication date",
  submissionDeadline: "Submission deadline",
  estimatedBudget: "Estimated budget",
  currency: "Currency",
  eligibilityRequirements: "Eligibility requirements",
  experienceRequirements: "Experience requirements",
  technicalRequirements: "Technical requirements",
  securityDeposit: "Security deposit",
  paymentTerms: "Payment terms",
  documentReferences: "Document references",
} as const;
export type Field = keyof typeof labels;
export type Evidence = { documentId: string; quote: string; page?: number };
export type Fact = {
  value: string;
  normalized: string;
  evidence: Evidence[];
  conflict: boolean;
};
export type Extraction = {
  fields: Partial<Record<Field, Fact>>;
  extractionWarnings: string[];
};
export type Change = {
  field: Field;
  kind: "Added" | "Removed" | "Modified" | "Uncertain";
  before?: Fact;
  after?: Fact;
  explanation: string;
};
export type Report = {
  id: string;
  createdAt: string;
  original: Document;
  revised: Document;
  originalFields: Extraction;
  revisedFields: Extraction;
  changes: Change[];
  completeReplacement: boolean;
};
const patterns: Record<Field, RegExp> = {
  tenderTitle: /^(?:tender title|procurement|title)\s*:\s*(.+)$/i,
  tenderIdentifier: /^(?:tender (?:id|identifier|number|no\.?))\s*:\s*(.+)$/i,
  procuringAuthority:
    /^(?:procuring authority|issuing authority|authority)\s*:\s*(.+)$/i,
  publicationDate: /^(?:publication date|published)\s*:\s*(.+)$/i,
  submissionDeadline:
    /^(?:submission deadline|deadline|closing date)\s*:\s*(.+)$/i,
  estimatedBudget: /^(?:estimated budget|budget|estimated cost)\s*:\s*(.+)$/i,
  currency: /^currency\s*:\s*(.+)$/i,
  eligibilityRequirements:
    /^(?:eligibility|eligibility requirements)\s*:\s*(.+)$/i,
  experienceRequirements:
    /^(?:experience|experience requirement[s]?)\s*:\s*(.+)$/i,
  technicalRequirements:
    /^(?:technical requirements|specifications)\s*:\s*(.+)$/i,
  securityDeposit: /^(?:security deposit|bid security)\s*:\s*(.+)$/i,
  paymentTerms: /^payment terms\s*:\s*(.+)$/i,
  documentReferences: /^(?:document references|references|amends)\s*:\s*(.+)$/i,
};
export function normalize(field: Field, value: string): string {
  const clean = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.]$/, "")
    .toLowerCase();
  if (field === "submissionDeadline" || field === "publicationDate") {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
    const named = /^([a-z]+) (\d{1,2}),? (\d{4})$/.exec(clean);
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const y = iso ? +iso[1] : named ? +named[3] : 0,
      m = iso ? +iso[2] : named ? months.indexOf(named[1]) + 1 : 0,
      d = iso ? +iso[3] : named ? +named[2] : 0;
    if (y && m && d) {
      const date = new Date(Date.UTC(y, m - 1, d));
      if (date.getUTCMonth() === m - 1 && date.getUTCDate() === d)
        return date.toISOString().slice(0, 10);
    }
  }
  if (field === "experienceRequirements")
    return clean.replace(
      /\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/g,
      (w) =>
        String(
          [
            "one",
            "two",
            "three",
            "four",
            "five",
            "six",
            "seven",
            "eight",
            "nine",
            "ten",
          ].indexOf(w) + 1,
        ),
    );
  if (["estimatedBudget", "securityDeposit"].includes(field))
    return clean.replace(/(?<=\d),(?=\d{3}\b)/g, "");
  return clean;
}
export function extract(doc: Document): Extraction {
  const fields: Extraction["fields"] = {};
  const warnings: string[] = [];
  for (const page of doc.pages)
    for (const quote of page.text.split(/\r?\n/))
      for (const field of Object.keys(patterns) as Field[]) {
        const match = patterns[field].exec(quote.trim());
        if (!match) continue;
        const value = match[1].trim(),
          normalized = normalize(field, value),
          evidence = {
            documentId: doc.id,
            quote,
            ...(page.page ? { page: page.page } : {}),
          };
        const prior = fields[field];
        if (prior) {
          prior.evidence.push(evidence);
          if (prior.normalized !== normalized) {
            prior.conflict = true;
            prior.value += " | " + value;
            warnings.push(
              `Conflicting ${labels[field].toLowerCase()} values require review.`,
            );
          }
        } else
          fields[field] = {
            value,
            normalized,
            evidence: [evidence],
            conflict: false,
          };
      }
  if (!Object.keys(fields).length)
    warnings.push(
      "No labeled fields recognized. Inspect the full text difference; local extraction supports English label: value lines.",
    );
  if (!fields.submissionDeadline)
    warnings.push("Submission deadline was not identified.");
  if (doc.edited)
    warnings.push(
      "Text was corrected by a user. PDF page attribution has been cleared.",
    );
  return { fields, extractionWarnings: [...new Set(warnings)] };
}
export function compare(
  original: Document,
  revised: Document,
  completeReplacement = false,
): Report {
  documentSchema.parse(original);
  documentSchema.parse(revised);
  for (const doc of [original, revised]) {
    const t = doc.pages.map((p) => p.text).join("\n");
    if (!t.trim() || t.length > 150000)
      throw new Error("Each document must contain 1–150,000 characters.");
  }
  const originalFields = extract(original),
    revisedFields = extract(revised),
    changes: Change[] = [];
  for (const field of Object.keys(labels) as Field[]) {
    const before = originalFields.fields[field],
      after = revisedFields.fields[field];
    if (!before && !after) continue;
    if (
      before &&
      after &&
      before.normalized === after.normalized &&
      !before.conflict &&
      !after.conflict
    )
      continue;
    const uncertain =
      before?.conflict ||
      after?.conflict ||
      ((!before || !after) && !completeReplacement);
    const kind = uncertain
      ? "Uncertain"
      : !before
        ? "Added"
        : !after
          ? "Removed"
          : "Modified";
    let explanation =
      kind === "Uncertain"
        ? "A missing or conflicting field is not proof of an administrative change. Verify both notices."
        : kind === "Modified"
          ? "The extracted wording changed. Legal or administrative meaning requires human verification."
          : `Field ${kind.toLowerCase()} in the user-confirmed complete replacement.`;
    if (
      kind === "Modified" &&
      field === "submissionDeadline" &&
      /^\d{4}-\d{2}-\d{2}$/.test(before!.normalized) &&
      /^\d{4}-\d{2}-\d{2}$/.test(after!.normalized)
    ) {
      const days =
        (Date.parse(after!.normalized) - Date.parse(before!.normalized)) /
        86400000;
      explanation = `Deadline ${days >= 0 ? "extended" : "shortened"} by ${Math.abs(days)} days (date only; verify time and timezone).`;
    }
    if (kind === "Modified" && field === "experienceRequirements") {
      const a = /^(\d+) years?$/.exec(before!.normalized),
        b = /^(\d+) years?$/.exec(after!.normalized);
      if (a && b) {
        const delta = +b[1] - +a[1];
        explanation = `Experience requirement ${delta >= 0 ? "increased" : "decreased"} by ${Math.abs(delta)} year${Math.abs(delta) === 1 ? "" : "s"}.`;
      }
    }
    changes.push({ field, kind, before, after, explanation });
  }
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    original,
    revised,
    originalFields,
    revisedFields,
    changes,
    completeReplacement,
  };
}
export function makeDocument(text = "", title = "Untitled notice"): Document {
  return {
    id: crypto.randomUUID(),
    title,
    authority: "",
    url: "",
    pages: [{ text }],
    kind: "text",
    edited: false,
  };
}
export const originalDemo =
  "FICTIONAL DEMONSTRATION — not a government record\nTender title: Road maintenance equipment procurement\nTender ID: DEMO-2026-014\nAuthority: Delta Civic Works (fictional)\nPublication date: October 20, 2026\nSubmission deadline: November 10, 2026\nEstimated budget: BDT 2,500,000\nCurrency: BDT\nEligibility: Registered equipment suppliers\nExperience requirement: two years\nTechnical requirements: Supply two road compactors\nSecurity deposit: BDT 50,000\nPayment terms: Within 30 days of acceptance";
export const revisedDemo = originalDemo
  .replace("November 10", "November 17")
  .replace("two years", "three years");
