# Evaluation scope — October 23, 2026

## Controlled messy-document comparison

Inputs: `public/fixtures/messy-original-tender.pdf` (two pages) and `messy-amendment-notice.pdf` (one-page partial amendment). These documents were authored before this engine upgrade and are explicitly fictional. They contain wrapped prose, tables, repeated page furniture and multiple dates/amounts. Expectations were recorded when the files were created.

| Expected material change                                  | Browser-path result                                       |
| --------------------------------------------------------- | --------------------------------------------------------- |
| Deadline 10 → 17 November 2026                            | Identified; 7-day extension                               |
| Experience 2 → 3 years                                    | Identified; 1-year increase                               |
| Security BDT 50,000 → 75,000                              | Identified; BDT 25,000 increase                           |
| Delivery 45 → 60 calendar days                            | Identified and linked to clause B.3                       |
| Comparable contract of at least BDT 1,000,000             | Identified as an added qualification, not a budget change |
| ISO 9001 requirement removed                              | Identified from explicit deletion instruction             |
| Budget BDT 2,500,000 and payment within 30 days unchanged | Retained; no false material change                        |

For these six annotated changes: six detected, zero extra material findings. This is a controlled regression result, not a representative accuracy score. The engine was developed against this fixture; it is not a held-out benchmark.

The first browser run missed delivery because the PDF text stream placed a clause label on the same line as its content, while a different extractor had put it on a separate line. The clause attribution bug was fixed; the exact PDF.js-extracted pages are retained in `tests/fixtures/messy-pdfjs.json`. Both source extraction and comparison are exercised in Playwright, not merely by loading expected outputs.

## Other cases

Unit tests cover a different currency/date replacement, old-value mismatch, unrelated tender identifiers, conflicting fields, time-only change, arbitrary quoted clause replacement, Bengali labels/digits, exact evidence, review-gated HTML escaping and AI output rejection. A generated image-only PDF exercises actual Tesseract OCR in Chromium with external requests blocked. The OCR fixture is clear English print; noisy scans and Bangla recognition need a broader corpus.

## Public-source check

A short excerpt from the [MHA/NATGRID corrigendum, page 2](https://www.mha.gov.in/sites/default/files/Tender_Corrigendum1_13022019.pdf), accessed October 23, 2026, is used as an abstention test: an existing form is replaced by a revised format. The engine queues that wording for human review rather than inventing a structured numeric change. The full original tender was not paired or evaluated. This is not evidence of reliable handling of that entire procurement.

## Remaining evaluation work

A substantial independently annotated set of real original/amendment pairs, varied agencies, tables, scans, Bangla documents and clause styles is still needed. No broad precision/recall number, legal accuracy claim, model quality score, or source-authenticity claim is made. Optional Gemini/Ollama inference was not run. Human review remains essential.
