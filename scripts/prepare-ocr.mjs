import { Buffer } from "node:buffer";
import { mkdirSync, copyFileSync, readdirSync, writeFileSync } from "node:fs";
mkdirSync("public/ocr/core", { recursive: true });
copyFileSync(
  "node_modules/tesseract.js/dist/worker.min.js",
  "public/ocr/worker.min.js",
);
for (const name of readdirSync("node_modules/tesseract.js-core").filter((n) =>
  n.endsWith(".wasm.js"),
))
  copyFileSync(
    "node_modules/tesseract.js-core/" + name,
    "public/ocr/core/" + name,
  );
for (const lang of ["eng", "ben"]) {
  const response = await globalThis.fetch(
    `https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/${lang}.traineddata`,
  );
  if (!response.ok)
    throw new Error(`Language data download failed (${response.status})`);
  writeFileSync(
    `public/ocr/${lang}.traineddata`,
    Buffer.from(await response.arrayBuffer()),
  );
}
writeFileSync(
  "public/ocr/ready.json",
  JSON.stringify({
    languages: ["eng", "ben"],
    source: "tesseract-ocr/tessdata_fast; Apache-2.0",
    createdAt: new Date().toISOString(),
  }),
);
console.log(
  "Local English and Bangla OCR assets prepared. Uploaded documents are never sent to a third party.",
);
