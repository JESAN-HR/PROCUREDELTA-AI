/** Conservative, evidence-preserving language patterns. No model responses are simulated. */
import {
  normalize,
  type Document,
  type Extraction,
  type Fact,
  type Field,
  type Change,
  type Evidence,
} from "./engine";
const month =
  "(?:January|February|March|April|May|June|July|August|September|October|November|December)";
const date = `(?:\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\s+${month}\\s+\\d{4}|${month}\\s+\\d{1,2},?\\s+\\d{4})`;
const amount =
  "(?:BDT|USD|EUR|GBP|Tk\\.?|৳|\\$)\\s*[0-9০-৯]+(?:,[0-9০-৯]{3})*(?:\\.\\d{1,2})?";
const years =
  "(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten)(?:\\s*\\(\\d+\\))?\\s+years?";
const englishDigits = (value: string) =>
  value.replace(/[০-৯]/g, (c) => String("০১২৩৪৫৬৭৮৯".indexOf(c)));
function canonical(field: Field, value: string) {
  const clean = englishDigits(value).replace(/\s+/g, " ").trim();
  if (field === "submissionTime")
    return clean.toLowerCase().replace(/\s*hours$/, "");
  if (field === "experienceRequirements") {
    const n = /\((\d+)\)/.exec(clean);
    if (n) return `${n[1]} years`;
  }
  return normalize(field, clean);
}
function fact(
  doc: Document,
  page: Document["pages"][number],
  value: string,
  quote: string,
  offset = 0,
): Fact {
  const preceding = page.text.slice(0, offset);
  const refs = [
    ...preceding.matchAll(/(?:^|\n)\s*([A-Z]\.\d+|\d+\.)[ \t]*(?=\s|$)/g),
  ];
  const clause = refs.at(-1)?.[1];
  return {
    value: value.trim(),
    normalized: "",
    conflict: false,
    evidence: [
      {
        documentId: doc.id,
        quote,
        ...(page.page ? { page: page.page } : {}),
        ...(clause ? { clause } : {}),
      },
    ],
  };
}
function add(result: Extraction, field: Field, candidate: Fact) {
  candidate.normalized = canonical(field, candidate.value);
  const prior = result.fields[field];
  if (!prior) {
    result.fields[field] = candidate;
    return;
  }
  if (prior.normalized === candidate.normalized) {
    if (!prior.evidence.some((e) => e.quote === candidate.evidence[0].quote))
      prior.evidence.push(...candidate.evidence);
    return;
  }
  prior.conflict = true;
  prior.value += " | " + candidate.value;
  prior.evidence.push(...candidate.evidence);
  result.extractionWarnings.push(
    `Multiple possible ${field} values; inspect source context.`,
  );
}
const prosePatterns: Partial<Record<Field, RegExp[]>> = {
  tenderIdentifier: [
    /\b(?:procurement\s+reference|tender\s+(?:reference|no\.?|number)|reference)\s*[:#]?\s*([A-Z][A-Z0-9]*(?:[-/][A-Z0-9]+){2,})/gi,
  ],
  tenderTitle: [
    /((?:Supply,?\s+(?:delivery\s+and\s+commissioning\s+of|and\s+delivery\s+of)|Procurement\s+of|Construction\s+of)\s+[^\n.]{5,150})/gi,
  ],
  publicationDate: [
    new RegExp(
      `(?:notice\\s+(?:circulated|published)|published|issued)\\s+(?:on\\s+)?(${date})`,
      "gi",
    ),
  ],
  submissionDeadline: [
    new RegExp(
      `(?:no\\s+later\\s+than|closing(?:\\s+date)?|deadline(?:\\s+for\\s+submission)?|must\\s+be\\s+(?:received|submitted)\\s+by|last\\s+date\\s+(?:of|for)\\s+submission)[^.;]{0,100}?(${date})`,
      "gi",
    ),
  ],
  submissionTime: [
    /(?:no\s+later\s+than|closing\s+time|deadline)[^.;]{0,30}?((?:[01]?\d|2[0-3]):[0-5]\d(?:\s*(?:AM|PM|hours))?)/gi,
  ],
  estimatedBudget: [
    new RegExp(
      `(?:indicative\\s+allocation|estimated\\s+(?:budget|cost|value)|budget)[^.;]{0,80}?(${amount})`,
      "gi",
    ),
  ],
  securityDeposit: [
    new RegExp(
      `(?:bid\\s+security|security\\s+deposit|earnest\\s+money)[^.;]{0,65}?(${amount})`,
      "gi",
    ),
  ],
  experienceRequirements: [
    new RegExp(
      `(?:demonstrate|minimum|at\\s+least|not\\s+less\\s+than|experience(?:\\s+of)?)[^.;]{0,60}?(${years})(?=[^.;]{0,75}(?:experience|supply|suppl)|[.\\n]|$)`,
      "gi",
    ),
  ],
  deliveryPeriod: [
    /\b(?:complete\s+delivery|delivery\s+(?:period|shall|must|within)|deliver\s+(?:the\s+goods\s+)?within)[^.;]{0,60}?(\d+\s+(?:calendar\s+|working\s+)?days)/gi,
  ],
  paymentTerms: [
    /(Payment\s+(?:will|shall|must)\s+be\s+made\s+within\s+\d+\s+days[^.]*\.)/gi,
  ],
  certificationRequirements: [
    /(ISO\s+\d+(?:\s+certificate|\s+certification)?)/gi,
  ],
  comparableContract: [
    /(At\s+least\s+one\s+completed\s+comparable\s+supply\s+contract[^.]*?acceptance\s+certificate)/gi,
  ],
  eligibilityRequirements: [/(Suppliers\s+must\s+hold[^.]+\.)/gi],
};
export function enrichExtraction(
  doc: Document,
  result: Extraction,
): Extraction {
  const labeled = new Set(Object.keys(result.fields));
  if (doc.pages.some((p) => p.ocr))
    result.extractionWarnings.push(
      "OCR-derived text: page locations identify scanned pages; verify every recognized value against the image. OCR confidence is not fact confidence.",
    );
  for (const page of doc.pages) {
    for (const [key, patterns] of Object.entries(prosePatterns)) {
      const field = key as Field;
      if (labeled.has(field)) continue;
      for (const re of patterns) {
        re.lastIndex = 0;
        for (const m of page.text.matchAll(re)) {
          if (
            field === "certificationRequirements" &&
            result.fields[field]?.normalized === canonical(field, m[1])
          )
            continue;
          add(result, field, fact(doc, page, m[1], m[0], m.index));
        }
      }
    }
    // Bengali labels retain verbatim quotations; numeric normalization does not translate prose.
    const bangla: Partial<Record<Field, string>> = {
      tenderTitle: "দরপত্রের নাম",
      tenderIdentifier: "দরপত্র নম্বর",
      procuringAuthority: "ক্রয়কারী সংস্থা",
      submissionDeadline: "দাখিলের শেষ তারিখ",
      estimatedBudget: "প্রাক্কলিত মূল্য",
      securityDeposit: "দরপত্র জামানত",
      experienceRequirements: "অভিজ্ঞতা",
      deliveryPeriod: "সরবরাহের সময়",
    };
    for (const [key, label] of Object.entries(bangla)) {
      for (const m of page.text.matchAll(
        new RegExp(`${label}\\s*[:：]\\s*([^\\n]+)`, "g"),
      ))
        add(result, key as Field, fact(doc, page, m[1], m[0], m.index));
    }
  }
  result.extractionWarnings = result.extractionWarnings.filter(
    (w) => !(w.startsWith("No labeled") && Object.keys(result.fields).length),
  );
  if (result.fields.submissionDeadline)
    result.extractionWarnings = result.extractionWarnings.filter(
      (w) => w !== "Submission deadline was not identified.",
    );
  result.extractionWarnings.push(
    "Pattern-assisted extraction is not a legal interpretation. Unrecognized clauses may contain additional conditions.",
  );
  result.reviewPassages = [];
  for (const page of doc.pages)
    for (const m of page.text.matchAll(
      /[^\n.!?]*(?:stands?\s+replaced|exempt(?:ed|ion)?|instead\s+of|treated\s+as\+?\s*addition)[^\n.!?]*/gi,
    )) {
      result.reviewPassages.push({
        documentId: doc.id,
        quote: m[0],
        ...(page.page ? { page: page.page } : {}),
      });
    }
  result.extractionWarnings = [...new Set(result.extractionWarnings)];
  return result;
}
function values(field: Field, text: string): string[] {
  let pattern: RegExp;
  if (field === "submissionDeadline" || field === "publicationDate")
    pattern = new RegExp(date, "gi");
  else if (field === "submissionTime")
    pattern = /(?:[01]?\d|2[0-3]):[0-5]\d(?:\s*(?:AM|PM|hours))?/gi;
  else if (["estimatedBudget", "securityDeposit"].includes(field))
    pattern = new RegExp(amount, "gi");
  else if (field === "experienceRequirements")
    pattern = new RegExp(years, "gi");
  else if (field === "deliveryPeriod")
    pattern = /\d+\s+(?:calendar\s+|working\s+)?days/gi;
  else return [];
  return [...text.matchAll(pattern)].map((m) => m[0]);
}
export function explanationFor(
  field: Field,
  before: Fact,
  after: Fact,
  fallback: string,
) {
  if (
    field === "submissionDeadline" &&
    /^\d{4}-\d{2}-\d{2}$/.test(before.normalized) &&
    /^\d{4}-\d{2}-\d{2}$/.test(after.normalized)
  ) {
    const delta =
      (Date.parse(after.normalized) - Date.parse(before.normalized)) / 86400000;
    return delta
      ? `Deadline ${delta > 0 ? "extended" : "shortened"} by ${Math.abs(delta)} days. Bidders have ${Math.abs(delta)} ${delta > 0 ? "more" : "fewer"} calendar days; verify the stated time and timezone.`
      : "The date is unchanged; review any time or wording difference.";
  }
  if (field === "experienceRequirements") {
    const a = /^(\d+) years?$/.exec(before.normalized),
      b = /^(\d+) years?$/.exec(after.normalized);
    if (a && b) {
      const d = +b[1] - +a[1];
      return `Experience requirement ${d >= 0 ? "increased" : "decreased"} by ${Math.abs(d)} year${Math.abs(d) === 1 ? "" : "s"}.`;
    }
  }
  if (field === "securityDeposit" || field === "estimatedBudget") {
    const parse = (s: string) =>
      /^(bdt|usd|eur|gbp|tk\.?|৳|\$)\s*(\d+(?:\.\d+)?)$/i.exec(s);
    const a = parse(before.normalized),
      b = parse(after.normalized);
    if (a && b && a[1] === b[1])
      return `${field === "securityDeposit" ? "Bid security" : "Stated budget"} ${+b[2] >= +a[2] ? "increased" : "decreased"} by ${a[1].toUpperCase()} ${Math.abs(+b[2] - +a[2]).toLocaleString("en-US")}. ${field === "securityDeposit" ? "This changes the amount bidders must provide as security." : "This is a stated allocation change, not evidence of actual expenditure."}`;
  }
  if (field === "deliveryPeriod")
    return `Delivery window changed from ${before.value} to ${after.value}. Check the trigger date (for example, the purchase order) before calculating a delivery deadline.`;
  return fallback;
}
export function resolveAmendments(
  original: Document,
  revised: Document,
  a: Extraction,
  b: Extraction,
  initial: Change[],
  complete: boolean,
) {
  const text = revised.pages.map((p) => p.text).join("\n");
  const effectiveFields: Extraction = {
    fields: { ...(complete ? b.fields : a.fields) },
    extractionWarnings: [],
  };
  const changes = initial.filter(
      (c) => complete || c.field !== "publicationDate",
    ),
    unresolved: string[] = [],
    carriedFields: Field[] = [];
  const idA = a.fields.tenderIdentifier,
    idB = b.fields.tenderIdentifier;
  if (idA && idB && idA.normalized !== idB.normalized) {
    unresolved.push(
      "Tender identifiers differ. These documents may concern different procurements; all findings need verification.",
    );
  }
  const set = (change: Change) => {
    const index = changes.findIndex((c) => c.field === change.field);
    if (index >= 0) changes.splice(index, 1);
    changes.push(change);
    if (change.kind === "Removed") delete effectiveFields.fields[change.field];
    else if (change.after && change.kind !== "Uncertain")
      effectiveFields.fields[change.field] = change.after;
  };
  const scalars: Field[] = [
    "submissionDeadline",
    "submissionTime",
    "experienceRequirements",
    "securityDeposit",
    "estimatedBudget",
    "deliveryPeriod",
  ];
  for (const page of revised.pages) {
    // Table reference cells delimit rows even when PDF extraction introduces line breaks inside cells.
    const refs = [
      ...page.text.matchAll(
        /Page\s+\d+,?\s*(?:clause\s+)?(?:[A-Z]\.\d+|\d+)(?!\d)/gi,
      ),
    ];
    const regions = refs.map((m, i) => ({
      quote: page.text
        .slice(m.index, refs[i + 1]?.index ?? page.text.length)
        .split(/ADDITIONAL\s+INSTRUCTIONS/i)[0],
      offset: m.index!,
      table: true,
    }));
    // Explicit in-prose replacements, also useful without clause references.
    for (const m of page.text.matchAll(
      /(?:\breplace\b|\bsubstitute\b|(?:deadline|closing\s+date|bid\s+security|experience|delivery)[^\n.]{0,50}?(?:changed|extended|increased|reduced))[^\n]{0,700}/gi,
    ))
      regions.push({ quote: m[0], offset: m.index!, table: false });
    for (const region of regions) {
      const ref = /(?:clause\s+)?([A-Z]\.\d+)|clause\s+(\d+)/i
        .exec(region.quote)
        ?.slice(1)
        .find(Boolean);
      let matched = false;
      for (const field of scalars) {
        const before = a.fields[field];
        if (!before || before.conflict) continue;
        const vs = values(field, region.quote);
        if (vs.length < 2) continue;
        const oldIndex = vs.findIndex(
          (v) => canonical(field, v) === before.normalized,
        );
        if (oldIndex !== 0) continue;
        // An old-value match alone cannot authorize arbitrary historical dates: require an amendment table or replacement verb.
        if (
          region.table &&
          !/(read\s+instead|operative\s+revision|revised|new\s+(?:wording|value))/i.test(
            page.text,
          )
        )
          continue;
        const value = vs[1];
        const after = fact(revised, page, value, region.quote, region.offset);
        after.normalized = canonical(field, value);
        const fieldClause = before.evidence
          .map((e) => e.clause?.replace(/\.$/, ""))
          .filter(Boolean);
        if (
          ref &&
          fieldClause.length &&
          !fieldClause.includes(ref.replace(/\.$/, ""))
        )
          continue;
        if (before.normalized === after.normalized) {
          const index = changes.findIndex((c) => c.field === field);
          if (index >= 0) changes.splice(index, 1);
          effectiveFields.fields[field] = after;
          matched = true;
          continue;
        }
        set({
          field,
          kind: "Modified",
          before,
          after,
          instruction: after,
          method: ref
            ? `Clause ${ref}: old value matched to original`
            : "Explicit replacement: old value matched to original",
          explanation: explanationFor(
            field,
            before,
            after,
            "An explicit amendment replaces the original condition. Verify the full clause before relying on it.",
          ),
        });
        matched = true;
      }
      if (!matched) {
        for (const field of scalars) {
          if (values(field, region.quote).length >= 2) {
            const c = changes.find((c) => c.field === field);
            if (c) {
              c.kind = "Uncertain";
              c.explanation =
                "The amendment could not be matched to the original old value or clause. Do not apply this change without review.";
            }
          }
        }
        unresolved.push(
          `Unresolved amendment instruction: ${region.quote.slice(0, 160).replace(/\s+/g, " ")}`,
        );
      }
    }
    for (const m of page.text.matchAll(
      /(?:replace|substitute)\s+["“]([^"”]+)["”]\s+(?:with|by)\s+["“]([^"”]+)["”]/gi,
    )) {
      const matches = original.pages.filter((p) => p.text.includes(m[1]));
      const instruction = fact(revised, page, m[0], m[0], m.index);
      const before =
        matches.length === 1
          ? fact(
              original,
              matches[0],
              m[1],
              m[1],
              matches[0].text.indexOf(m[1]),
            )
          : undefined;
      const after = fact(revised, page, m[2], m[0], m.index);
      if (before)
        before.normalized = canonical("otherConditions", before.value);
      after.normalized = canonical("otherConditions", after.value);
      changes.push({
        field: "otherConditions",
        kind: before ? "Modified" : "Uncertain",
        before,
        after,
        instruction,
        method: "Quoted clause replacement",
        explanation: before
          ? "The amendment explicitly replaces the quoted original wording. Review its practical and legal effect in context."
          : "The old quotation was not uniquely located in the original document.",
      });
    }
    const deletion =
      /(?:Delete|Remove)\s+(?:the\s+)?(?:requirement|condition)[^.]*?(ISO\s+\d+)[^.]*\./gi;
    for (const m of page.text.matchAll(deletion)) {
      const before = a.fields.certificationRequirements;
      const instruction = fact(revised, page, m[0], m[0], m.index);
      if (
        before &&
        !before.conflict &&
        before.value.toLowerCase().includes(m[1].toLowerCase())
      )
        set({
          field: "certificationRequirements",
          kind: "Removed",
          before,
          instruction,
          method: "Explicit deletion linked by certification identity",
          explanation: `The amendment explicitly removes the ${m[1]} condition. Other eligibility requirements are not removed by this instruction.`,
        });
      else
        unresolved.push(
          "A certification deletion could not be matched confidently to the original.",
        );
    }
    const addition =
      /(?:Insert|Add)\s+the\s+following\s+condition[^:]*:\s*([^.]*(?:completed|similar|comparable)\s+[^.]*contract[^.]*\.)/gi;
    for (const m of page.text.matchAll(addition)) {
      const after = fact(revised, page, m[1], m[0], m.index);
      after.normalized = canonical("comparableContract", after.value);
      const before = a.fields.comparableContract;
      set({
        field: "comparableContract",
        kind: before ? "Uncertain" : "Added",
        before,
        after,
        instruction: after,
        method: "Explicit addition instruction",
        explanation: before
          ? "An additional contract condition may modify an existing condition; review their relationship."
          : "The amendment adds a comparable-contract qualification. Its contract value is a qualification threshold, not the procurement budget.",
      });
    }
  }
  const unchanged =
    /all\s+(?:other\s+)?(?:provisions|conditions|terms)[^.]{0,90}(?:remain|continue)[^.]{0,25}unchanged|unless\s+(?:expressly\s+)?(?:changed|amended)[^.]{0,100}unchanged/i.test(
      text,
    );
  for (const [key, before] of Object.entries(a.fields)) {
    const field = key as Field;
    const change = changes.find((c) => c.field === field);
    if (!complete && !b.fields[field] && !change?.instruction) {
      carriedFields.push(field);
      if (unchanged) {
        const i = changes.findIndex((c) => c.field === field);
        if (i >= 0) changes.splice(i, 1);
      }
    }
    if (!complete && !change && b.fields[field] && !b.fields[field]!.conflict)
      effectiveFields.fields[field] = b.fields[field];
    if (!before) continue;
  }
  for (const c of changes) {
    if (c.after && c.kind !== "Uncertain")
      effectiveFields.fields[c.field] = c.after;
  }
  if (idA && idB && idA.normalized !== idB.normalized)
    for (const c of changes) c.kind = "Uncertain";
  if (!complete)
    effectiveFields.extractionWarnings.push(
      unchanged
        ? "Unmentioned original conditions are retained under the amendment’s unchanged-terms statement."
        : "Original-only fields are historical context, not confirmed current conditions.",
    );
  if (!Object.keys(a.fields).length || !Object.keys(b.fields).length)
    unresolved.push(
      "Some document content could not be structured. Inspect the full source text.",
    );
  return {
    changes,
    effectiveFields,
    carriedFields,
    unresolved: [...new Set(unresolved)],
  };
}
export function evidenceIsValid(doc: Document, e: Evidence) {
  return (
    e.documentId === doc.id &&
    doc.pages.some(
      (p) =>
        (e.page === undefined || p.page === e.page) && p.text.includes(e.quote),
    )
  );
}
