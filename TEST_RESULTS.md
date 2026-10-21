# Actual validation results

Verified October 21, 2026, on Windows with Node.js 24.22.0, Next.js 16.4.2, PDF.js 6.4.299, Vitest 5.0.5, and Playwright Chromium.

| Check                         | Actual result                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| npm run lint                  | Passed; no warnings or errors                                                                               |
| npm run typecheck             | Passed                                                                                                      |
| npm test                      | 12 tests passed                                                                                             |
| npm run test:e2e              | 7 tests passed in 17.0 seconds                                                                              |
| npm run build                 | Passed; all ten public routes generated plus the optional API route                                         |
| npm audit --cache .npm-cache  | 0 known vulnerabilities                                                                                     |
| node scripts/fixtures.mjs     | Generated fictional original/revised PDFs and text, unchanged/missing/conflicting/invalid/textless fixtures |
| node scripts/visual-check.mjs | Desktop analyzer, report, and mobile screenshots captured; no browser page errors                           |
| HTTP localhost response       | 200                                                                                                         |

## Coverage

Unit tests verify date and numeric normalization, seven-day deadline and one-year experience deltas, unchanged input, partial-amendment uncertainty, confirmed replacement additions/removals, unknowns, conflicting values, exact quotation and page integrity, empty input, unsafe URL schemes, persistence, corrupt storage, and invalid/oversized PDF input.

Browser tests visit all ten routes; run the fictional demo; inspect exact evidence; reload saved reports; correct inputs; search history; delete documents and related reports; extract actual PDFs with page references; reject invalid PDFs; return an honest 503 from the unconfigured AI endpoint; verify a 390px mobile viewport; explain textless PDF/OCR limitations; and confirm that PDF processing and comparison make no external requests. Editing extracted PDF text is verified to remove page citations.

## Fixes made during verification

The initial PDF.js API option had been removed and was corrected. Initial dependency advisories were resolved by upgrading PDF.js/Vitest and replacing the Next-specific lint dependency chain with direct lint plugins. Browser tests initially had ambiguous selectors for repeated citations and the Next route announcer; selectors were narrowed and the entire suite passed. Lint's browser-hydration rule has one documented, narrowly scoped exemption for loading localStorage after server rendering.

## Verification boundaries

No real Gemini request was made; no key was provided or needed. Live cloud structured output, semantic quality, and Bangla output are not verified. No OCR, public hosting, authenticated multi-user service, or official-source verification is claimed. Password-protected PDFs have explicit error handling but were not exercised with an encrypted fixture. Print controls and print styles are implemented; physical printing and individual browser print-dialog settings were not automated.

Screenshots: artifacts/analyzer-desktop.png, artifacts/report-desktop.png, artifacts/analyzer-mobile.png.

## Commands executed

Dependency setup: npm install; patched PDF.js/Vitest installation; direct ESLint plugin and Prettier installation; npm uninstall eslint-config-next; node scripts/copy-worker.mjs; npx playwright install chromium.

Verification: node scripts/fixtures.mjs; npm run lint; npm run typecheck; npm test; npm run build; npm run dev; npm run test:e2e; node scripts/visual-check.mjs; npm audit --cache .npm-cache; HTTP localhost request. Source formatted with npx prettier --write.

The sandbox initially blocked npm registry access and the Vitest bundler's ancestor-directory resolution. These commands were rerun with approved access. Final tests passed outside that restriction. An offline npm audit was not used as security evidence; the final online audit above was used.
