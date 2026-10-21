# Limitations

- Prototype, not an official government service, legal advice, or misconduct detector.
- Local field extraction supports English label: value lines; it is not robust general NLP. Unlabeled prose, tables, multi-column PDFs, wrapped continuation clauses, Bangla, and unusual labels may need correction or full-text review.
- PDF text ordering depends on source encoding. Page references identify the extraction page, not semantic accuracy. Correcting any PDF text clears all page citations for that document.
- Scanned PDFs need external OCR. No OCR or fake OCR result is supplied. Password-protected PDFs must be unlocked separately.
- Date normalization is date-only and conservative; time zones, times, and ambiguous numeric formats are not inferred. Budget normalization does not convert currencies or units.
- Repeated conflicting field labels are flagged. Conflicts expressed in prose can escape the label parser.
- Added/removed means a recognized field differs between user-confirmed complete versions, not proven legal change. Partial amendments leave absent fields uncertain.
- Storage is local, unencrypted, quota-limited, and tied to this browser/origin. No accounts, shared URLs, sync, or automatic backups. JSON export contains source text.
- Optional cloud AI is unavailable by default and was not tested against a real model. Matching quotes do not establish entailment. Only fictional/non-sensitive input is permitted for optional free-tier requests.
- No automatic source URL verification, scraping, government endorsements, fabricated statistics, or public deployment.
- Local server and assets are needed. No service-worker/PWA installation is included.
- Public multi-user deployments should keep AI disabled until authentication, durable abuse controls, and operational review are added.
