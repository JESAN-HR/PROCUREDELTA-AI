import { PDFDocument, StandardFonts } from "pdf-lib";
import { writeFileSync } from "node:fs";
import { originalDemo } from "../src/lib/engine.ts";
const original = originalDemo.replace("—", "-");
const revised = original
  .replace("November 10", "November 17")
  .replace("two years", "three years");
for (const [name, text] of [
  ["original", original],
  ["revised", revised],
]) {
  writeFileSync(`public/fixtures/${name}.txt`, text);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText(text, { x: 40, y: 790, size: 11, lineHeight: 23, font });
  writeFileSync(`public/fixtures/${name}.pdf`, await pdf.save());
}
writeFileSync("public/fixtures/unchanged.txt", original);
writeFileSync(
  "public/fixtures/missing-date.txt",
  "Tender title: Fictional equipment\nExperience: two years",
);
writeFileSync(
  "public/fixtures/conflicting.txt",
  "Submission deadline: November 10, 2026\nSubmission deadline: November 12, 2026",
);
writeFileSync(
  "public/fixtures/invalid.pdf",
  "This is intentionally not a PDF.",
);
const blank = await PDFDocument.create();
blank.addPage();
writeFileSync("public/fixtures/no-text.pdf", await blank.save());
