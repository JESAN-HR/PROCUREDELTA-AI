from pathlib import Path
p=Path('src/lib/intelligence.ts');s=p.read_text(encoding='utf-8').replace('        if (before.normalized === after.normalized) continue;\n','');needle='        set({\n          field,\n          kind: "Modified",';s=s.replace(needle,'''        if(before.normalized===after.normalized){
          const index=changes.findIndex(c=>c.field===field);if(index>=0)changes.splice(index,1);
          effectiveFields.fields[field]=after;matched=true;continue;
        }
'''+needle);p.write_text(s,encoding='utf-8')
