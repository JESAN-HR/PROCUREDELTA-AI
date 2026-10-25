import {chromium,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:3000/analyze');
await page.getByLabel('Original PDF').setInputFiles('public/fixtures/messy-original-tender.pdf');await expect(page.getByRole('textbox',{name:'Original text'})).toHaveValue(/two/);
await page.getByLabel('Revised PDF').setInputFiles('public/fixtures/messy-amendment-notice.pdf');await expect(page.getByRole('textbox',{name:'Revised text'})).toHaveValue(/75,000/);
await page.getByRole('button',{name:'Analyze changes',exact:true}).click();await page.waitForURL('**/comparison');
const r=await page.evaluate(()=>JSON.parse(globalThis.localStorage.getItem('procuredelta.v1')).reports[0]);
writeFileSync('tmp/messy-result.json',JSON.stringify(r,null,2));
writeFileSync('tests/fixtures/messy-pdfjs.json',JSON.stringify({original:r.original.pages,revised:r.revised.pages},null,2));
await page.screenshot({path:'artifacts/messy-report.png',fullPage:true,caret:'initial'});
console.log(JSON.stringify({fields:r.originalFields.fields.deliveryPeriod,unresolved:r.unresolved,changes:r.changes.map(c=>[c.field,c.kind])}));await browser.close();

