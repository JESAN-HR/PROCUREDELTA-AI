import { createWorker } from "tesseract.js";
export async function createLocalOcr(progress: (message: string) => void) {
  const status = await fetch("/ocr/ready.json");
  if (!status.ok)
    throw new Error(
      "Local OCR assets are not installed. Run npm run setup:ocr once with internet, then restart. No document is sent externally.",
    );
  progress("Starting local English + Bangla OCR…");
  return createWorker(["eng", "ben"], 1, {
    workerPath: "/ocr/worker.min.js",
    corePath: "/ocr/core",
    langPath: "/ocr",
    gzip: false,
    workerBlobURL: false,
    logger: (m) =>
      progress(
        `Local OCR: ${m.status} ${Math.round((m.progress ?? 0) * 100)}%`,
      ),
  });
}
