# One-minute demonstration

0–10 seconds: Open /analyze. Explain that the prototype compares tender notices locally with no API key. Click Load demo documents; point out the fictional labels.

10–25 seconds: Show the original and revised notice text. Click Analyze changes. The actual engine discovers the deadline moving from November 10 to November 17, 2026 and experience moving from two to three years.

25–40 seconds: Point out the seven-day extension and one-year increase. Expand Inspect source evidence. Explain that pasted text has no fabricated page references. For page evidence, upload public/fixtures/original.pdf and revised.pdf instead.

40–50 seconds: Open the Evidence library, then Overview. The counts reflect the report just saved, not invented activity.

50–60 seconds: Return to Comparison and use Print / PDF. Close by explaining the distinction between local extraction and optional AI interpretation, and that official documents remain authoritative.

## Longer walkthrough

Review missing-field warnings and the complete-replacement checkbox. Try a partial amendment with only a deadline: other fields become uncertain. Try conflicting.txt. Correct inputs, rerun, search History, inspect source documents, delete a document and verify that its linked reports disappear. Show Security & privacy and clear local data after the demonstration. Optional AI is not required for the pitch.

## Updated messy-document demonstration

1. Open New analysis and upload `public/fixtures/messy-original-tender.pdf` and `public/fixtures/messy-amendment-notice.pdf`.
2. Leave complete replacement unchecked and analyze.
3. Show six material findings, expand the delivery clause and certification deletion instructions, and show the unchanged budget/payment context.
4. Mark the report reviewed only after inspecting the evidence; download the standalone HTML copy.
5. In History, expand the procurement timeline and demonstrate comparison with another amendment against the original.

For a single-document brief, choose that analysis mode and upload only the original. For OCR, prepare assets once with `npm run setup:ocr`, enable the checkbox, and upload `public/fixtures/scanned-fictional.pdf`. Explain that OCR, deterministic comparison and optional model interpretation are distinct operations. Do not claim that the small synthetic evaluation proves broad real-world accuracy.
