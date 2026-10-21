# Architecture

Next.js App Router, strict TypeScript, React, accessible native controls, Lucide icons, and a custom CSS design system. No external fonts or imagery. Styling uses reusable tokens and components rather than Tailwind/shadcn dependencies.

## Data path

1. A browser File is validated for PDF MIME, extension, signature, and 10 MB size.
2. PDF.js runs using a locally served worker; at most 100 pages and 150,000 extracted characters are accepted. Line breaks are reconstructed using PDF text positions. Actual page indices are retained. Empty scanned files and password errors fail visibly.
3. Pasted or user-corrected text has no page attribution. All quotations retain original extracted whitespace. User metadata does not become a document fact.
4. Zod validates input. English label: value rules detect 14 field types. Conflicting matches retain evidence and become uncertain. Unknowns remain absent.
5. Conservative normalization handles named English dates, valid ISO dates, simple experience number words, and thousands separators. Unclear numeric dates remain literal.
6. Both-sided differences are reported as wording changes. One-sided fields are uncertain unless the user explicitly confirms a full replacement. Simple date and experience deltas get deterministic explanations. A word diff covers text beyond recognized fields.
7. A report snapshots both documents, extracted facts, evidence, context, and changes. LocalStorage persists versioned records; failures are visible. Document deletion removes related snapshots.

## Boundaries

Core computation has no server dependency beyond serving the app. The optional /api/ai route uses a server-only Gemini key and explicit user consent. AI output never mutates deterministic facts. Zod checks output structure; exact substring checks reject unsupported quotes. This does not establish semantic entailment.

## Future extension

The readStore/writeStore boundary can become an asynchronous repository backed by IndexedDB or authenticated Postgres/Supabase. Authentication, cross-device synchronization, ingestion queues, OCR, and shared reports are not implemented. The present ten routes share a workspace component to keep the prototype coherent.
