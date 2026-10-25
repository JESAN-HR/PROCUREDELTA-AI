# Actual validation results

Updated October 25, 2026. Results below were observed during this upgrade on Windows with Node.js 24.22.0, Next.js 16.4.2, PDF.js 6.4.299, Vitest 5.0.5 and Playwright Chromium. They are recorded runs, not a guarantee for every environment or document.

| Command | Observed result |
| --- | --- |
| npm run lint | Passed after fixing a browser-global reference in the diagnostic script |
| npm run typecheck | Passed |
| npm test | 27 tests passed across 3 files |
| npm run test:e2e | 10 tests passed in 22.7 seconds |
| npm run build | Passed; ten public routes and optional AI API generated |
| npm audit --cache .npm-cache | 0 known vulnerabilities reported |
| npm run setup:ocr | Installed local English/Bangla recognition assets |
| node scripts/check-messy.mjs | Six expected findings, no unresolved findings in the controlled fictional pair |
| node scripts/visual-check.mjs | Desktop/mobile screenshots captured; no page or console errors |

The first production build compiled but Windows sandbox permissions blocked a generated route directory. Rerunning with approved filesystem access succeeded.

## What was exercised

Unit coverage includes normalization, dates, experience, missing/conflicting values, explicit additions/removals, partial amendments, old-value mismatch, mismatched tender identifiers, time-only amendments, quoted replacements, Bengali labels/digits, exact evidence, persistence, input validation, AI output validation, and HTML export escaping/review requirements.

Browser coverage includes all ten public routes, actual PDF extraction and page citations, demo analysis, correction, history, deletion, invalid PDF errors, no-key AI behavior, mobile layout, processing without external requests, six messy-PDF changes, reviewed HTML download, single-notice briefs, Bangla headings and timeline search. A real Tesseract OCR test recognized a generated image-only English PDF with external requests blocked. OCR assets must first be installed using npm run setup:ocr to reproduce this test.

Editing PDF text clears page citations because edited text is no longer the original page extraction.

The messy pair correctly identifies deadline, experience, security deposit, delivery, certification removal and comparable-contract addition, while retaining unchanged budget/payment context. See EVALUATION.md for the fixture-specific evaluation and its limits.

## Boundaries

- Optional Gemini and Ollama adapters were implemented, but live model inference was not run. Schema and quotation-validation tests do not establish model accuracy.
- OCR was verified on clear English print. No broad noisy-scan or Bangla OCR accuracy claim is made.
- The parser was developed against the fictional messy pair; this is not an independent real-world accuracy benchmark.
- Bangla field headings and limited labeled extraction work; full document translation is not implemented.
- No public deployment, multi-user database, source-authenticity verification or cumulative amendment consolidation was tested or claimed.
- Password-protected PDF handling exists but was not exercised with an encrypted fixture. Physical printing was not automated.

## Reproduce

Run npm install, npm run setup:ocr, and npx playwright install chromium. Run npm run lint, npm run typecheck, npm test and npm run build. Start npm run dev, then run npm run test:e2e in a second terminal. The browser tests expect http://127.0.0.1:3000.

Screenshots are in artifacts/analyzer-desktop.png, artifacts/report-desktop.png, artifacts/analyzer-mobile.png and artifacts/messy-report.png. Full local Windows/Ubuntu setup and user instructions are in README.md.
