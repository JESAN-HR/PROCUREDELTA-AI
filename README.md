# ProcureDelta AI

**Making Public Procurement Understandable.**

Compare an original tender with a revised notice, see what changed, and inspect the source text behind each finding. Built as an independent civic transparency prototype for International AI Builders Congress 2026 / Zero to Launch / CivicSphere AI. This is not an official government service.

**The default installation is free and needs no API key, account, database, credit card, or billing activation.** PDF extraction and rule-based comparison run locally in your browser. Optional cloud AI is disabled by default.

## Contents

- [Before you begin](#before-you-begin)
- [First-time setup on Windows](#first-time-setup-on-windows)
- [First-time setup on Ubuntu Linux](#first-time-setup-on-ubuntu-linux)
- [Starting, stopping, and restarting](#starting-stopping-and-restarting)
- [Your first analysis: try the fictional demo](#your-first-analysis-try-the-fictional-demo)
- [Analyzing your own documents](#analyzing-your-own-documents)
- [Reading and verifying a report](#reading-and-verifying-a-report)
- [Guide to every screen](#guide-to-every-screen)
- [Saving, exporting, and deleting your work](#saving-exporting-and-deleting-your-work)
- [Optional Gemini AI](#optional-gemini-ai)
- [Troubleshooting](#troubleshooting)
- [Developer commands and tests](#developer-commands-and-tests)
- [Project structure and further documentation](#project-structure-and-further-documentation)

## Before you begin

You need:

- A Windows PC or Ubuntu Linux computer with a modern browser.
- **Node.js 24.x with npm.** The project was tested with Node.js 24.22.0 on Windows. Use the Node 24 release line for these instructions. The Ubuntu instructions are provided for setup but have not been executed in an Ubuntu environment during this build.
- The complete project folder, including `package.json`, `package-lock.json`, `src`, `scripts`, and `public`.
- Internet access to install Node.js and project dependencies the first time.

You do **not** need Python, Docker, a database server, a paid AI subscription, or a separate backend installation.

If someone shares the project as a ZIP, extract it before running commands. Keep `package-lock.json`; it records the dependency versions. Do not copy `node_modules` or `.next` from a different operating system—install and build on the destination computer instead. If you already have this project open locally, use that existing folder.

The instructions below run a local web server. Keep its terminal open while using the app. You open the software through your browser, not by double-clicking a source file.

## First-time setup on Windows

### 1. Install Node.js

Open the [official Node.js download page](https://nodejs.org/en/download), select Node.js **24.x**, Windows, and the installer matching your computer (usually x64). Run the `.msi` installer, keep npm enabled, and allow it to add Node.js to PATH. Reopen your terminal after installation.

### 2. Open the project in PowerShell

Open Windows Terminal or PowerShell. Change to the folder that contains `package.json`.

For the original project location on this computer:

```powershell
cd "C:\Users\jesan\OneDrive\Desktop\procuredelta-ai"
```

On another PC, replace that path with your own extracted project location, for example:

```powershell
cd "C:\Projects\procuredelta-ai"
```

Run **one** of those `cd` commands, according to where your folder actually is. You can also open the folder in File Explorer, right-click an empty area, and choose **Open in Terminal**.

### 3. Check Node.js and install dependencies

Run these commands one at a time:

```powershell
node --version
npm.cmd --version
Get-Item package.json
npm.cmd ci
```

`node --version` should report `v24...`. `npm.cmd ci` installs the versions in the lockfile and prepares the local PDF worker. Wait for it to finish successfully. Installation may take several minutes.

These examples use `npm.cmd` because some PowerShell configurations block the `npm.ps1` script. This avoids changing your execution policy. An ordinary `npm` command also works when your terminal permits it.

### 4. Start the app

```powershell
npm.cmd run dev
```

Wait for the terminal to show that the server is ready, then open:

**[http://127.0.0.1:3000](http://127.0.0.1:3000)**

The first page can take a little longer to compile. You should see the ProcureDelta landing page and navigation. No sign-in or environment file is required. Continue to [Your first analysis](#your-first-analysis-try-the-fictional-demo).

## First-time setup on Ubuntu Linux

These instructions use Bash and install Node.js for your own user account through nvm. If Node.js 24 and npm already work in your terminal, skip to step 3.

### 1. Install download tools and nvm

Open Terminal and run:

```bash
sudo apt update
sudo apt install -y curl ca-certificates
```

Install nvm using its versioned installer:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh -o /tmp/procuredelta-nvm-install.sh
bash /tmp/procuredelta-nvm-install.sh
source ~/.bashrc
```

The downloaded file is a shell installer; you can inspect it before running it. These steps follow the [official nvm installation documentation](https://github.com/nvm-sh/nvm#installing-and-updating). If your shell is not Bash, follow that documentation's shell-specific initialization instructions.

### 2. Install and select Node.js 24

```bash
nvm install 24
nvm use 24
node --version
npm --version
```

`node --version` should report `v24...`. In a new terminal, run `nvm use 24` again if a different Node version is selected. Use nvm's Node installation rather than relying on an older distribution-provided Node version.

### 3. Open the project folder

Extract or copy the project into a folder owned by your user. For example, if you placed it under `~/Projects`:

```bash
cd ~/Projects/procuredelta-ai
ls package.json package-lock.json
```

Replace the path if your folder is elsewhere, such as `~/Downloads/procuredelta-ai`. If `ls` says the files do not exist, locate the actual folder before continuing; some ZIPs contain an additional nested directory.

### 4. Install and run

```bash
npm ci
npm run dev
```

Run these commands as your normal user, **without `sudo`**. Wait for the server to become ready, then open [http://127.0.0.1:3000](http://127.0.0.1:3000) in the browser on the same computer.

No `.env.local` file is needed for the default workflow. Continue below to try the software.

## Starting, stopping, and restarting

### Everyday development mode

After the first installation, open a terminal in the project folder and run:

```bash
npm run dev
```

On Windows PowerShell, use `npm.cmd run dev` if needed. You do not need to run `npm ci` every time. Run it after receiving changes to the lockfile or when installing on a new computer.

To stop the server, focus its terminal and press **Ctrl+C**. Restart it with the same command. Saved analyses remain in your browser, but unfinished input on the analysis screen is not a saved draft and can be lost on refresh or navigation.

### Local production mode

For a compiled local demonstration, stop the development server first, then run:

```bash
npm run build
npm start
```

Use `npm.cmd` instead of `npm` in PowerShell if necessary. The build must complete successfully before `npm start`. After the first build, future starts can use `npm start` alone until application code changes; rebuild after code changes.

### What “local” and “offline” mean

The server binds to `127.0.0.1`, so this setup is for the same computer. It does not publish a public website or automatically make the app available to your phone.

After dependencies are installed and the local server/assets are available, the core document workflow needs no external API or internet connection. The server must still be running. The app is not an installable offline PWA. Optional Gemini requires internet access.

Always return to the same browser profile and URL. `localhost`, `127.0.0.1`, different ports, and different browsers have separate saved workspaces.

## Your first analysis: try the fictional demo

This is the easiest way to learn the software in about one minute.

1. Open the app and select **New analysis** from the navigation, or **Compare documents** on the landing page.
2. Click **Load demo documents**. Both panels fill with explicitly fictional notices. This replaces any text currently entered in those panels.
3. Read the original and revised text. The original deadline is November 10, 2026, and the experience requirement is two years. The revision uses November 17 and three years.
4. Click **Analyze changes**. The local engine performs the comparison and saves a report.
5. On the report, find **Deadline extended by 7 days** and **Experience requirement increased by 1 year**.
6. Expand **Inspect source evidence** on a finding. Check the exact quoted words. Because this demo loads text, citations correctly say there is no page citation.
7. Open **Overview** to see metrics derived from your saved report. Open **Report history** to reopen it.

To try PDF extraction instead, start another analysis and browse to `public/fixtures/original.pdf` and `public/fixtures/revised.pdf` in the project folder. The findings should include real **Page 1** evidence. The fixture files are fictional, not government records.

## Analyzing your own documents

### 1. Choose the two versions

Use the initial tender in **Original document** and its amendment or replacement in **Revised document**. Compare notices for the same procurement and verify that you have selected the correct versions. The app does not establish that two uploaded notices are legally related.

### 2. Upload PDFs or paste text

In each panel, either drag a PDF onto the upload area, click to browse for a PDF, or paste directly into the text box. You can mix PDF input on one side with pasted text on the other. Text files are not uploaded through the PDF picker; open the text file yourself and paste its contents.

Input limits:

| Input                  | Supported limit or behavior                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| PDF type               | Text-based `.pdf` with `application/pdf` MIME type and valid PDF signature |
| PDF size               | Up to 10 MB per file                                                       |
| PDF length             | Up to 100 pages per file                                                   |
| Text                   | Up to 150,000 characters per document; cannot be empty                     |
| Scanned/image-only PDF | OCR is not implemented; provide independently verified text instead        |
| Password-protected PDF | Upload an unlocked copy that you are authorized to use                     |

Read the text box after extraction. PDF layouts, tables, and line wrapping can affect the extracted reading order.

### 3. Add optional metadata

- **Document title:** keep the supplied/default title or enter a useful name for history and evidence.
- **Issuing authority:** optional user-entered context.
- **Source URL:** an optional HTTP or HTTPS link to the public notice.

These entries do not become extracted document facts. A source URL is user-provided and unverified; the app does not fetch it, scrape the site, or import a PDF from the link.

### 4. Review and correct the text

Fix extraction mistakes in the text box before comparing. Corrections are user edits, not verification by the software. Editing extracted PDF text clears its page citations because the edited text may no longer match the original page. The report keeps a warning about that correction.

Local extraction works best with **one English `label: value` field per line**. Here is a fictional example with the supported fields:

```text
Tender title: Road maintenance equipment procurement
Tender ID: DEMO-2026-014
Authority: Delta Civic Works (fictional)
Publication date: October 20, 2026
Submission deadline: November 10, 2026
Estimated budget: BDT 2,500,000
Currency: BDT
Eligibility: Registered equipment suppliers
Experience requirement: two years
Technical requirements: Supply two road compactors
Security deposit: BDT 50,000
Payment terms: Within 30 days of acceptance
Document references: Fictional procurement schedule A
```

This is a format example, not a reason to invent missing facts or rewrite a notice's meaning. Unlabeled prose, Bangla, wrapped clauses, and complex tables may not produce structured fields. Review the full text difference even when few fields are recognized.

### 5. Choose whether the revision is a complete replacement

Check **Both documents are complete versions, and the revised notice replaces the original** only when that statement is true.

- For two complete versions, a recognized field appearing or disappearing can be classified as **Added** or **Removed**.
- For a short amendment mentioning only a deadline, leave the checkbox unchecked. Missing eligibility or budget text is **Uncertain**, not proof that the requirement was removed.

The demo checks this option because its two fictional notices are complete versions. Reconsider the setting when using your own documents.

### 6. Analyze

Click **Analyze changes** and wait for the progress message. On success, the app opens the comparison report and saves the report and its source documents in this browser. If an error appears, correct the indicated input and retry. **Clear** on an input panel resets that panel; it does not delete older saved reports.

## Reading and verifying a report

### Change transparency report

Each finding shows the field, original value, revised value, classification, and a rule-based explanation.

| Classification | How to interpret it                                                                  |
| -------------- | ------------------------------------------------------------------------------------ |
| Modified       | Recognized values or wording differ; verify the administrative meaning yourself.     |
| Added          | A field appears in a user-confirmed complete replacement.                            |
| Removed        | A field is absent from a user-confirmed complete replacement.                        |
| Uncertain      | Missing context or conflicting recognized values prevent a confident classification. |

Date calculations use confidently parsed dates, not inferred times or time zones. A change in wording is not automatically a legal change. No findings does not certify that the notices are identical.

### Inspect source evidence

Expand **Inspect source evidence** beneath a finding. Compare the exact excerpts and document identities. Unedited PDF text can include real page locations; pasted/corrected text has no invented page number. Open the original official document separately when verifying context.

### Procurement brief

Review the recognized fields from the revised notice. Expand a field to see its source evidence. **Unknown / not identified** means the parser did not identify it, not necessarily that the official notice lacks the information. For a partial amendment, consult the original notice for unchanged conditions.

### Full text difference

Read the complete word-level comparison, including text the field parser did not recognize. Added text is highlighted in green and removed text is struck through. These are text changes, not findings of wrongdoing or certified legal conclusions.

### Correct inputs and rerun

Click **Correct inputs** to bring the report's two source texts back into the analyzer. Make the needed corrections and analyze again. The new analysis creates another saved report; the earlier report remains a historical snapshot. Delete obsolete reports manually if appropriate.

## Guide to every screen

| Screen             | URL             | What you can do                                                                                                                                                                                  |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home               | `/`             | Read the product overview and start a comparison.                                                                                                                                                |
| New analysis       | `/analyze`      | Load the demo, upload/paste notices, review text, and compare.                                                                                                                                   |
| Comparison         | `/comparison`   | Review the selected report, brief, word diff, evidence, exports, and optional AI action.                                                                                                         |
| Documents          | `/documents`    | Search saved sources, expand their text, inspect source links, or delete a document and linked reports. **Add documents** opens the analyzer; documents are saved after a successful comparison. |
| Report history     | `/history`      | Search saved comparisons by document title, reopen a report, or delete a report.                                                                                                                 |
| Overview           | `/dashboard`    | See actual counts, category breakdowns, and saved reports. Repeated analyses count as separate comparisons.                                                                                      |
| Evidence library   | `/evidence`     | Inspect the selected report's findings with source evidence expanded. Select a different report from history first to change this view.                                                          |
| Architecture       | `/architecture` | Understand the implemented processing and storage boundaries.                                                                                                                                    |
| Security & privacy | `/security`     | Read privacy and responsible-use details or clear the local workspace.                                                                                                                           |
| Documentation      | `/docs`         | Read the in-app usage guide and demo steps.                                                                                                                                                      |

Use the appearance button near the top right to switch light/dark appearance. On a small screen, the navigation rows scroll horizontally. Empty report screens are expected until you complete your first comparison.

## Saving, exporting, and deleting your work

### Where reports are saved

Successful comparisons save automatically in browser `localStorage`. There is no account, cloud sync, database, or automatic backup. Use the same browser profile and origin to return to your reports. Private/incognito sessions may lose data when closed, and clearing site data removes saved work.

Storage is not encrypted by the app. Other people who can use the same browser profile may be able to read the documents. Source PDF binaries are not archived; saved records contain extracted text, metadata, and analysis snapshots. Keep your original files separately.

### Print or save as PDF

Open a report and click **Print / PDF**. The app expands evidence for printing. In your browser's print dialog, choose a printer or **Save as PDF** (the wording may vary by browser), review the preview, and save. This produces a report, not a copy of the uploaded original PDF.

### Export JSON

Click **JSON** in the report header to download the structured report, including source text and evidence. Store or share the download appropriately. **There is currently no JSON import/restore button.** Export preserves information for outside use, but does not provide one-click workspace restoration.

### Delete a report or document

- **Report history:** use the trash button beside a report. This removes the report; its separately saved source documents remain in Documents.
- **Documents:** expand a document and choose **Delete document and linked reports**. All reports involving that document are removed too.
- **Security & privacy:** choose **Clear all local data** and confirm to remove the complete workspace.

Individual report/document deletions take effect immediately. There is no undo. Export anything you need before deletion. Removing saved reports also changes the dashboard metrics.

## Optional Gemini AI

**Skip this section for normal use.** The default workflow already performs real document extraction and comparison. It does not run a local neural model or fabricate AI responses.

For an operator who already has an eligible Gemini free-tier project **without billing**, optional setup is:

1. Copy `.env.example` to `.env.local` in the project root. Do this only if `.env.local` does not already contain configuration you need.

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   Ubuntu:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with a text editor:

   ```dotenv
   ENABLE_CLOUD_AI=true
   GEMINI_API_KEY=your_free_tier_key
   GEMINI_MODEL=your_current_free_tier_model_id
   ```

3. Restart the server. For production mode, rebuild and restart.
4. Open a comparison and find **Optional AI interpretation**. Only for fictional or non-sensitive test documents, confirm the consent checkbox and click **Request optional AI analysis**.

This sends both document texts to Google; they do not remain local for that request. The optional endpoint accepts at most 50,000 combined text characters. Keys stay server-side: never prefix them with `NEXT_PUBLIC_` or include them in source control.

The app cannot verify your Google project's billing status. Do not enable billing or a paid tier. There is no paid fallback or automatic provider retry. If a free model/key is unavailable, leave AI disabled and use local processing. Live model inference has not been verified in this build. Read [AI_USAGE.md](AI_USAGE.md) for details.

## Troubleshooting

| Problem                                          | What to do                                                                                                                                                                         |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node` or `npm` is not recognized on Windows     | Install Node.js, close and reopen the terminal, and check `node --version`. Confirm the installer added Node to PATH.                                                              |
| PowerShell says `npm.ps1` cannot be loaded       | Use `npm.cmd ci` and `npm.cmd run dev`; no execution-policy change is needed.                                                                                                      |
| `nvm: command not found` on Ubuntu               | Reopen Bash or run `source ~/.bashrc`. Revisit the official nvm installation instructions if your shell differs.                                                                   |
| Unsupported Node version                         | Select Node 24 with `nvm use 24` on Ubuntu, or install Node 24 on Windows, then rerun `npm ci`.                                                                                    |
| `package.json` cannot be found / `ENOENT`        | The terminal is in the wrong directory. Change to the extracted project root and check for `package.json`.                                                                         |
| Dependency download, proxy, or certificate error | Confirm internet access and your network's proxy/certificate configuration, then retry `npm ci`. Do not disable certificate checks.                                                |
| Permission error on Ubuntu                       | Use a user-owned project folder and nvm's Node installation; do not run the project with `sudo`.                                                                                   |
| Locked files or `EPERM` on Windows               | Stop any server using the folder. If cloud-sync/file locking continues, copy the source to a normal local folder such as `C:\Projects\procuredelta-ai` and run `npm.cmd ci` there. |
| Browser cannot connect                           | Keep the terminal/server running, check for startup errors, and use the Local URL printed there. Do not open the app as a `file://` page.                                          |
| Port 3000 is already in use                      | Stop the other local server you started, or use the alternative-port command below. A different port has a different saved workspace.                                              |
| `npm start` cannot find a production build       | Run `npm run build` successfully first, or use `npm run dev` for development.                                                                                                      |
| PDF worker failed to load                        | Stop the server, run `node scripts/copy-worker.mjs`, restart, and refresh. If dependencies are missing, run `npm ci` first.                                                        |
| Invalid PDF signature, MIME, or parsing error    | Use a real text-based PDF exported as `.pdf`; renaming a different file to `.pdf` does not convert it. Otherwise paste verified text.                                              |
| No readable text / scanned PDF                   | OCR is not included. Obtain a text-based version or paste independently verified text.                                                                                             |
| Password-protected PDF                           | Obtain an authorized unlocked copy before uploading.                                                                                                                               |
| File/page/text limit exceeded                    | Use shorter complete versions or relevant extracts. For extracts, leave the complete-replacement checkbox unchecked and verify context separately.                                 |
| No fields or few changes detected                | Check English labels, line breaks, and extracted ordering. Review the full text diff; the parser does not understand all prose or layouts.                                         |
| Missing information shows as uncertain           | This is deliberate for partial amendments. Only confirm complete replacement when factually correct.                                                                               |
| History appears empty                            | Return to the same browser, profile, hostname, protocol, and port. Check whether private mode or site-data clearing removed the records.                                           |
| Storage unavailable, full, or invalid            | Export readable reports, delete unneeded items, and allow site storage. Clearing all local data resets the workspace but permanently deletes saved records.                        |
| Optional AI is not configured / quota exceeded   | Continue with local processing. If you intend to enable AI, check the three server variables and free-tier availability without enabling billing.                                  |

To use another local port:

```bash
npm run dev -- --port 3001
```

Windows PowerShell: `npm.cmd run dev -- --port 3001`. Open [http://127.0.0.1:3001](http://127.0.0.1:3001). Return to the original port to see its previous saved workspace.

## Developer commands and tests

These checks are optional for ordinary users. Run them from the project root. In PowerShell, replace `npm`/`npx` with `npm.cmd`/`npx.cmd` if required.

| Command                         | Purpose                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `npm ci`                        | Install lockfile dependencies and prepare the PDF worker.                          |
| `npm run dev`                   | Start the development server.                                                      |
| `npm run build`                 | Compile the production application.                                                |
| `npm start`                     | Serve the existing production build.                                               |
| `npm run lint`                  | Check code quality and accessibility rules.                                        |
| `npm run typecheck`             | Check strict TypeScript types.                                                     |
| `npm test`                      | Run deterministic processing and persistence unit tests.                           |
| `node scripts/fixtures.mjs`     | Regenerate fictional PDF/text and negative test fixtures.                          |
| `npm run test:e2e`              | Run Playwright browser tests.                                                      |
| `node scripts/visual-check.mjs` | Capture screenshots; requires the app running on port 3000 and Chromium installed. |
| `npm audit`                     | Check current dependency advisories; requires network access.                      |

Before running browser tests, install the test browser:

Windows:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Ubuntu:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

The Ubuntu browser-dependency installation may request administrator access for system packages. Browser tests use `http://127.0.0.1:3000` and start the development server automatically if it is not already running. Do not point tests at a different application on that port.

The recorded build verification passed 12 unit tests, 7 browser tests, lint, typecheck, and production build on Windows. These are historical results, not a claim that tests were run on your machine. See [TEST_RESULTS.md](TEST_RESULTS.md) for exact scope and limitations.

## Project structure and further documentation

```text
procuredelta-ai/
├── src/
│   ├── app/                  # Public routes, styling, server AI endpoint
│   ├── components/           # Shared workspace and screen interfaces
│   └── lib/                  # Extraction, normalization, comparison, PDF, storage
├── public/fixtures/          # Fictional PDFs/text and negative test inputs
├── scripts/                  # Worker setup, fixtures, visual checks
├── tests/
│   ├── engine.test.ts        # Unit tests
│   └── browser/              # Playwright end-to-end tests
├── package.json              # Commands and dependencies
├── package-lock.json         # Locked dependency versions
├── .env.example              # Optional cloud configuration example
└── README.md                 # This setup and user guide
```

- [ARCHITECTURE.md](ARCHITECTURE.md): implemented system and extension points.
- [AI_USAGE.md](AI_USAGE.md): deterministic processing versus optional inference.
- [LIMITATIONS.md](LIMITATIONS.md): unsupported cases and reliability boundaries.
- [TEST_RESULTS.md](TEST_RESULTS.md): checks actually run and observed results.
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md): one-minute presentation and longer walkthrough.
- [DEPLOYMENT.md](DEPLOYMENT.md): local production operation and self-hosting notes.

Official procurement documents remain authoritative. Use this tool to locate and explain differences for human review, not to certify compliance, legal meaning, fraud, or corruption.
