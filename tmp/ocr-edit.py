from pathlib import Path
p=Path('src/lib/engine.ts');s=p.read_text(encoding='utf-8').replace('  text: z.string(),','  text: z.string(),\n  ocr: z.boolean().optional(),\n  confidence: z.number().min(0).max(100).optional(),',1);p.write_text(s,encoding='utf-8')
p=Path('src/lib/pdf.ts');s=p.read_text(encoding='utf-8').replace('export async function readPdf(file: File)', 'export async function readPdf(file: File, options: {ocr?:boolean; progress?:(message:string)=>void} = {})');s=s.replace('  try {\n    const pdf', '  let ocrWorker: Awaited<ReturnType<typeof import("./ocr").createLocalOcr>> | undefined;\n  try {\n    const pdf',1)
s=s.replace('      total += text.length;', '''      let ocrMeta: {ocr?:boolean;confidence?:number}={};
      if(!text.trim() && options.ocr){
        if(pdf.numPages>10)throw new Error('Local OCR is limited to 10 PDF pages per upload.');
        if(!ocrWorker)ocrWorker=await (await import('./ocr')).createLocalOcr(options.progress??(()=>{}));
        const viewport=page.getViewport({scale:1.75});
        if(viewport.width*viewport.height>12000000)throw new Error('Page is too large to rasterize safely.');
        const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;
        await page.render({canvas,viewport}).promise;
        const result=await ocrWorker.recognize(canvas);
        text=result.data.text;ocrMeta={ocr:true,confidence:result.data.confidence};
        canvas.width=0;canvas.height=0;
      }
      total += text.length;''')
s=s.replace('pages.push({ page: n, text: text.trim() });','pages.push({ page: n, text: text.trim(),...ocrMeta });')
s=s.replace('Scanned PDFs need OCR, which is not included. Paste independently verified text instead.','Enable local OCR before uploading scanned PDFs, or paste independently verified text instead.')
s=s.replace('    await task.destroy();','    await ocrWorker?.terminate();\n    await task.destroy();')
p.write_text(s,encoding='utf-8')
p=Path('src/lib/intelligence.ts');s=p.read_text(encoding='utf-8').replace('  const labeled = new Set(Object.keys(result.fields));','  const labeled = new Set(Object.keys(result.fields));\n  if(doc.pages.some(p=>p.ocr))result.extractionWarnings.push("OCR-derived text: page locations identify scanned pages; verify every recognized value against the image. OCR confidence is not fact confidence.");');p.write_text(s,encoding='utf-8')
p=Path('package.json');import json;d=json.loads(p.read_text());d['scripts']['setup:ocr']='node scripts/prepare-ocr.mjs';p.write_text(json.dumps(d,indent=2)+'\n')
p=Path('.gitignore');p.write_text(p.read_text()+'\npublic/ocr/\n')
p=Path('.prettierignore');p.write_text(p.read_text()+'\npublic/ocr\n')
p=Path('eslint.config.mjs');s=p.read_text().replace('"public/pdf.worker.min.mjs",','"public/pdf.worker.min.mjs",\n      "public/ocr/**",');p.write_text(s)
