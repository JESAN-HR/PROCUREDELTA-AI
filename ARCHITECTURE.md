# Architecture

Next.js App Router, strict TypeScript, React, native accessible controls and a local navy/emerald design system. No mandatory service credentials, database or external model.

## Document pipeline

- `pdf.ts` extracts PDF text in the browser. Page numbers identify real pages; PDF.js drawing order and line positions determine extracted text ordering. Complex layouts can still need correction.
- `ocr.ts` optionally renders image-only pages and runs Tesseract locally with same-origin English/Bangla worker and language assets. Setup downloads language data only; no source document leaves the browser. OCR confidence measures recognition, not factual truth. Editing clears page/OCR metadata.
- `engine.ts` handles schemas, labeled input, normalization, report snapshots and single-document briefs.
- `intelligence.ts` adds English prose patterns, Bengali labels/digits, clause attribution and amendment resolution. Referenced tables or explicit replacements must match an old value. Explicit certification deletion and comparable-contract addition have separate handling. Quoted arbitrary-clause replacements are matched to original quotations. Unsupported operative wording is queued for review.
- Date and cutoff-time changes are separate. Financial amounts retain currencies. Contract qualification amounts are not treated as procurement budgets.
- Complete replacements can classify missing fields as removals. Partial amendments retain prior context, and unchanged-terms statements suppress false removals. This is not a complete legal consolidation engine. Ambiguous or mismatched clauses require review.

## Evidence and persistence

Evidence retains exact source substrings, document identity, real page when available, and a detected clause reference. An effective-fields view combines resolved updates with labeled original context. Original, revised and instruction evidence remain distinguishable. Browser storage keeps snapshots using the existing versioned key; new fields are optional so prior reports remain readable. Model output is transient and separate.

`reports.ts` groups records by procurement identifier, searches structured values, and creates escaped standalone HTML only after a user review acknowledgement. That acknowledgement does not authenticate the original source. There is no shared hosted database or automatic public publication. Successive amendments can each be compared to the original, but are not automatically merged into a consolidated legal instrument.

## Optional inference

`api/ai/route.ts` supports a fixed-loopback Ollama endpoint or Gemini. Both require explicit server configuration; neither is enabled by default. Requests are size-bounded, same-origin and use a per-process ten-second throttle. The latter is not durable multi-instance abuse prevention. Zod validates outputs and verbatim checks reject unmatched evidence. Document instructions are treated as untrusted data. Quote matching cannot establish semantic correctness.

## Extension points

A durable authenticated repository can replace localStorage; publication, access control and audit trails should precede shared deployment. General table reconstruction, cross-page clause linkage, broader Bangla NLP and benchmarked semantic inference remain future work rather than claimed capabilities.
