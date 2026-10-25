from pathlib import Path
p=Path('scripts/prepare-ocr.mjs');s=p.read_text(encoding='utf-8');s='import { Buffer } from "node:buffer";\n'+s;s=s.replace('await fetch(', 'await globalThis.fetch(');p.write_text(s,encoding='utf-8')
p=Path('src/lib/engine.ts');s=p.read_text(encoding='utf-8').replace('  deliveryPeriod: "Delivery period",','  otherConditions: "Other clause changes",\n  deliveryPeriod: "Delivery period",').replace('  deliveryPeriod: /','  otherConditions: /^other conditions\\s*:\\s*(.+)$/i,\n  deliveryPeriod: /');p.write_text(s,encoding='utf-8')
p=Path('src/lib/reports.ts');s=p.read_text(encoding='utf-8').replace('  tenderTitle:', '  otherConditions: "অন্যান্য শর্তের পরিবর্তন",\n  tenderTitle:',1);p.write_text(s,encoding='utf-8')
p=Path('src/components/workspace.tsx');s=p.read_text(encoding='utf-8').replace('key={change.field}', 'key={`${change.field}-${i}`}');p.write_text(s,encoding='utf-8')
