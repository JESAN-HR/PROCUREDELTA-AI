# AI, OCR and zero-cost operation

## Default local processing

PDF.js extracts text. Tesseract optionally recognizes text from scanned pages. English prose/label rules, Bengali labels, numeric normalization, clause matching, amendment resolution, word diffs and local storage are deterministic processing. They are not LLM inference. No model response is fabricated.

Run `npm run setup:ocr` once online to download English/Bangla traineddata and prepare local assets. Later OCR requests use only your application origin. No uploaded documents are sent with the language downloads. Assets are optional and ignored by Git; fresh installs/deployments must run setup to enable OCR. Tesseract language data is Apache-2.0 licensed: https://github.com/tesseract-ocr/tessdata_fast.

## Local model adapter

Install Ollama and an appropriate local model yourself, considering available memory and disk. Configure server-only `.env.local` values:

```dotenv
AI_PROVIDER=ollama
ENABLE_LOCAL_AI=true
LOCAL_AI_MODEL=your_installed_model_name
ENABLE_CLOUD_AI=false
```

The app calls the fixed endpoint `http://127.0.0.1:11434/api/generate` with structured-output schema and streaming disabled. The endpoint is relative to the application server, not the browser. No model installation or inference was performed in this build. The adapter follows the [Ollama generate API](https://docs.ollama.com/api/generate) and [structured-output contract](https://docs.ollama.com/capabilities/structured-outputs).

## Optional Gemini free tier

Use only an eligible model in a project without billing attached. The app cannot verify your billing status. Do not activate a paid tier.

```dotenv
AI_PROVIDER=gemini
ENABLE_CLOUD_AI=true
GEMINI_API_KEY=your_free_tier_key
GEMINI_MODEL=your_current_free_tier_model_id
ENABLE_LOCAL_AI=false
```

Restart after changes. Never use NEXT_PUBLIC_ for credentials. The UI requires consent and fictional/non-sensitive test input. Gemini sends documents to Google; no paid fallback or automatic retry exists. [Gemini structured-output documentation](https://ai.google.dev/gemini-api/docs/structured-output).

## Grounding and disclosure

Both adapters request structured fields and English/Bangla explanations. Zod rejects malformed results; every fact value must occur inside a quote and every quote must match its source text. Interpretation cards remain separate from deterministic facts. Matching text does not establish entailment, authenticity or legal meaning.

Requests have byte/text limits, same-origin validation, timeout and a per-process throttle. This is not production authentication or distributed abuse control. Uploaded instructions are explicitly untrusted; this reduces but does not eliminate prompt-injection risk. No genuine model inference or translation quality was verified. Unit tests use explicitly artificial model-output objects solely to test acceptance/rejection behavior.
