# Deployment

## Local, zero-cost default

Install Node.js 22.13+ and run npm ci, npm run build, then npm start. Open http://127.0.0.1:3000. No environment file is required. Keep the local server running. The core workflow does not contact third-party services.

## Self-hosting

Use an existing Node-capable machine with npm ci, npm run build, npm start. The start script binds to loopback. To expose deliberately behind your own HTTPS reverse proxy, run npx next start --hostname 0.0.0.0 --port 3000 and configure access controls and TLS. Hosting hardware/bandwidth may have costs; this project does not provision hosting or require purchasing it.

Keep ENABLE_CLOUD_AI unset or false for a public prototype. There are no cloud credentials in the client bundle. Do not put secrets in NEXT_PUBLIC variables, source control, logs, or exported reports.

localStorage is scoped to the origin: changing domain, protocol, or port creates a separate workspace. The app is not backed up or synchronized. Export JSON before changing origins or clearing storage.

No deployed URL has been created or verified. The included server AI route means this setup is a Next.js Node deployment, not a static-export deployment.

## October 23 upgrade: OCR and reviewed sharing

For OCR on a fresh install, run `npm run setup:ocr` before building. On a host with build-time internet access, an install command can be `npm ci && npm run setup:ocr`. OCR uses generated same-origin assets; without them, ordinary text PDFs still work and enabling OCR explains the missing setup. Check hosting asset limits; OCR language/worker assets add tens of megabytes. No account or paid service is required by this setup.

The optional Ollama adapter points to loopback on the application server. It is suitable for a local/self-hosted process where Ollama is running, not a connection from Vercel to a model on your personal PC. Keep both optional model modes disabled unless configured deliberately.

Reviewed HTML downloads can be shared or hosted separately. They contain quotations and user-entered document identities. Export does not automatically publish documents or create a shared public dashboard.
