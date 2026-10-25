# Limitations

- Independent prototype: not an official service, a legal opinion, or a misconduct detector.
- Prose and amendment processing uses conservative language patterns, not a general language model. Recognized English forms, scalar amendment tables, explicit instructions, and Bengali labeled fields are supported; arbitrary layouts/terminology can be missed.
- The messy synthetic PDF pair now resolves six expected material changes through the real browser PDF path. This does not establish broad accuracy on government tenders. The evaluation corpus remains small; see EVALUATION.md.
- PDF text ordering can be wrong in complex tables or columns. Clause references are detected from nearby headings and may require human correction. General geometric table reconstruction and cross-page clause stitching are not implemented.
- OCR is optional and local after setup. It handles image-only PDF pages, not every broken text layer. Ten-page and raster-size limits apply. English OCR is tested on one generated scan; broad scan and Bangla OCR accuracy are unverified. Always compare recognized text against the original image.
- Editing PDF or OCR text clears page attribution. Source quotations are exact relative to extracted text, not proof that extraction is correct or that the uploaded notice is authentic.
- Missing values are not removals without a complete replacement or explicit deletion. An unchanged-terms statement supplies context but cannot resolve every ambiguous clause. Unclassified operative passages are surfaced for review.
- Dates are conservatively normalized. Time changes are separate; time zones, calendar conventions, currency conversion and ambiguous numeric dates need review. Amount patterns are not comprehensive across international numbering conventions.
- Timelines group by identifiers; grouping does not authenticate relatedness. Repeated analyses count as separate records. Successive partial amendments are not automatically consolidated.
- Bangla field headings, labeled extraction, digits, and optional OCR assets are present. Full bilingual UI, general Bangla prose understanding, and evaluated Bangla model explanations are not claimed.
- Optional Gemini and Ollama inference adapters are implemented but no live inference was run during this update. No model is installed. Grounding tests check schema/quote validation, not model reasoning quality or complete prompt-injection immunity.
- LocalStorage is unencrypted, quota-limited and browser-origin-specific. No cross-device sync or JSON restore workflow exists. Original PDF binaries are not archived.
- Public HTML export requires a human review acknowledgement and includes source text. It does not publish automatically, create shared URLs, or constitute independent source verification.
- No automatic government scraping, external integrations, paid tiers or public deployment were enabled. Keep optional inference disabled on a public deployment until durable access/abuse controls are added.
