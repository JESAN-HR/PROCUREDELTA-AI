# AI usage and zero-cost contract

## Default: no model

PDF.js extraction, label recognition, date arithmetic, field comparisons, word diffs, and local storage are genuine deterministic processing. They are not AI inference. There are no fabricated model responses. The product name describes an extensible document-intelligence platform; default mode clearly identifies local rules.

## Optional Gemini

Only activate for fictional or non-sensitive test documents and only on a project with no billing attached and an available model free tier. The app cannot determine the billing status of your Google project. Do not attach billing or enable a paid tier. No paid fallback or automatic retry is implemented.

Set server-only values in .env.local:

```
ENABLE_CLOUD_AI=true
GEMINI_API_KEY=your_free_tier_key
GEMINI_MODEL=your_current_free_tier_model_id
```

No model ID is hard-coded because availability and free-tier eligibility change. A key alone does not enable AI. The UI requires a separate consent checkbox before sending both documents. Never use NEXT_PUBLIC_ for secrets.

The endpoint asks for structured fields, plain-language nuanced comparisons, exact original/revised quotes, and explicit uncertainty. Schema and quote validation reject malformed/unmatched output. Uploaded commands are treated as untrusted data. Quotes matching text do not prove that an interpretation is true, complete, or free of prompt injection. A person must verify it.

Gemini API reference: https://ai.google.dev/gemini-api/docs/structured-output
Free-tier eligibility and limits must be checked in the operator's Google project. The app does not create projects, request payment information, or activate billing.

No live cloud request was made during development. Real provider inference is unverified without a free-tier key. Bangla generation and local neural inference are not implemented.
