import type { Document } from "./engine";
export async function readPdf(
  file: File,
  options: { ocr?: boolean; progress?: (message: string) => void } = {},
): Promise<Document["pages"]> {
  if (
    file.type !== "application/pdf" ||
    !file.name.toLowerCase().endsWith(".pdf")
  )
    throw new Error("Choose a PDF with application/pdf MIME type.");
  if (file.size > 10 * 1024 * 1024) throw new Error("PDF limit is 10 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
    throw new Error("Invalid PDF signature.");
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({ data: bytes, useSystemFonts: true });
  let ocrWorker:
    Awaited<ReturnType<typeof import("./ocr").createLocalOcr>> | undefined;
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 100) throw new Error("PDF limit is 100 pages.");
    const pages: Document["pages"] = [];
    let total = 0;
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      let text = "",
        lastY: number | undefined;
      for (const item of content.items) {
        if (!("str" in item)) continue;
        const y = item.transform[5];
        if (
          lastY !== undefined &&
          Math.abs(lastY - y) > 2 &&
          !text.endsWith("\n")
        )
          text += "\n";
        text += item.str + (item.hasEOL ? "\n" : " ");
        lastY = y;
      }
      let ocrMeta: { ocr?: boolean; confidence?: number } = {};
      if (!text.trim() && options.ocr) {
        if (pdf.numPages > 10)
          throw new Error("Local OCR is limited to 10 PDF pages per upload.");
        if (!ocrWorker)
          ocrWorker = await (
            await import("./ocr")
          ).createLocalOcr(options.progress ?? (() => {}));
        const viewport = page.getViewport({ scale: 1.75 });
        if (viewport.width * viewport.height > 12000000)
          throw new Error("Page is too large to rasterize safely.");
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, viewport }).promise;
        const result = await ocrWorker.recognize(canvas);
        text = result.data.text;
        ocrMeta = { ocr: true, confidence: result.data.confidence };
        canvas.width = 0;
        canvas.height = 0;
      }
      total += text.length;
      if (total > 150000)
        throw new Error("Extracted text exceeds 150,000 characters.");
      pages.push({ page: n, text: text.trim(), ...ocrMeta });
    }
    if (!pages.some((p) => p.text.trim()))
      throw new Error(
        "No readable text found. Enable local OCR before uploading scanned PDFs, or paste independently verified text instead.",
      );
    return pages;
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException")
      throw new Error("Password-protected PDF. Upload an unlocked copy.");
    throw error;
  } finally {
    await ocrWorker?.terminate();
    await task.destroy();
  }
}
