from pathlib import Path
p=Path('README.md');s=p.read_text(encoding='utf-8');s=s.replace('## Contents','''## Updated document-intelligence workflow

The analyzer now supports **single-notice briefs**, English prose and wrapped requirements, clause-linked amendment tables, explicit replacements/deletions/additions, and inherited original conditions. It also detects submission-time changes separately from dates. It remains conservative pattern-assisted processing, not unrestricted language understanding.

Try `public/fixtures/messy-original-tender.pdf` with `public/fixtures/messy-amendment-notice.pdf`, leaving complete replacement unchecked. The browser-tested report identifies six material changes: deadline, experience, security, delivery, a new contract qualification, and removed certification. Budget and payment terms stay unchanged. See [EVALUATION.md](EVALUATION.md) for the measured scope and remaining gaps.

Choose **Single notice brief** in Analysis mode when you have no amendment. History now includes procurement timelines grouped by extracted identifiers, search includes recognized field values, and **Compare another amendment with original** loads the original for another comparison. Timelines are not automatic consolidation of successive amendments.

The brief has a **বাংলা শিরোনাম** toggle for Bengali field headings. Bengali labeled text and digits are supported. This is not full-interface translation or general Bangla NLP. A configured model can optionally be asked for Bangla explanations; that quality is not yet evaluated.

### Optional local OCR setup

For scanned/image-only PDFs, run once while online:

```bash
npm run setup:ocr
```

On PowerShell use `npm.cmd run setup:ocr`. This downloads open-source English and Bangla recognition data and copies local worker files. Documents are not uploaded. On this development machine the assets have already been prepared; new installations need this step. Enable **local English + Bangla OCR** in the upload panel before uploading. OCR runs only on pages without extractable text, supports at most 10 pages, and records recognition confidence and page origin. Review every OCR result. Text-based PDFs still support 100 pages.

After setup, OCR uses same-origin assets and can operate without an external service. Language data comes from [Tesseract tessdata_fast](https://github.com/tesseract-ocr/tessdata_fast); generated `public/ocr` assets are ignored by Git. On a fresh deployment run this setup as part of installation if OCR is desired. The English scanned fixture was browser-tested; general Bangla OCR accuracy was not evaluated.

### Reviewed public copies

In a report, inspect evidence and the human-review queue, mark **I reviewed the source evidence**, then download the standalone public HTML report. This file includes source quotations and can be opened without this application or hosted by you. It does not publish automatically and is not a shared hosted database. Human review is recorded as your acknowledgement, not official authentication.

## Contents''',1)
s=s.replace('OCR is not implemented; provide independently verified text instead','Enable optional local OCR after `npm run setup:ocr`, or provide independently verified text')
s=s.replace('Local extraction works best with **one English `label: value` field per line**.','Local extraction supports selected English prose, clause references, and amendment tables as well as **English `label: value` fields**. Explicit labels remain useful when preparing manually verified text.')
s=s.replace('Because this demo loads text, citations correctly say there is no page citation.','Because this demo loads text, citations correctly say there is no page citation. To challenge the engine, use the messy PDF pair described above.')
s=s.replace('**There is currently no JSON import/restore button.**','**There is currently no JSON import/restore button.**')
s=s.replace('## Optional Gemini AI','''## Optional Gemini AI

Alternatively, an optional **local Ollama adapter** is implemented. Install Ollama and a suitable local model separately, then configure:

```dotenv
AI_PROVIDER=ollama
ENABLE_LOCAL_AI=true
LOCAL_AI_MODEL=your_installed_model_name
ENABLE_CLOUD_AI=false
```

Restart the app server. The adapter calls `http://127.0.0.1:11434/api/generate` on the **application server**. On local Windows/Ubuntu this is your computer. Vercel cannot reach Ollama on your personal PC through that loopback address. No model download is automatic; model memory/disk requirements vary. See [Ollama structured outputs](https://docs.ollama.com/capabilities/structured-outputs). No real model run was performed during this update; schema and evidence-rejection behavior are tested, not inference quality.

Model output appears in separate interpretation cards and is not merged into the deterministic report or silently treated as verified facts. The model section detects whether a provider is configured. English/Bangla explanation selection applies to this optional model request.
''',1)
s=s.replace('**Optional AI interpretation**','**Optional model interpretation**').replace('**Request optional AI analysis**','**Generate grounded interpretation**')
s=s.replace('OCR is not included. Obtain a text-based version or paste independently verified text.','Run `npm run setup:ocr`, enable OCR, and re-upload (up to 10 pages). Otherwise obtain a text-based version or paste verified text.')
s=s.replace('| `npm run dev`','| `npm run setup:ocr` | Install local English/Bangla OCR assets once; needs internet for language downloads. |\n| `npm run dev`',1)
s=s.replace('The recorded build verification passed 12 unit tests, 7 browser tests, lint, typecheck, and production build on Windows.','The initial build passed 12 unit tests and 7 browser tests. Updated validation and the messy/OCR evaluation are recorded in TEST_RESULTS.md and EVALUATION.md.')
p.write_text(s,encoding='utf-8')
