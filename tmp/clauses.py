from pathlib import Path
p=Path('src/lib/intelligence.ts');s=p.read_text(encoding='utf-8').replace(r'(?:^|\n)\s*([A-Z]\.\d+|\d+\.)\s*(?:\n|[A-Z])',r'(?:^|\n)\s*([A-Z]\.\d+|\d+\.)[ \t]*(?=\s|$)');s=s.replace(r'(?:replace|substitute|(?:deadline',r'(?:\breplace\b|\bsubstitute\b|(?:deadline');p.write_text(s,encoding='utf-8')
p=Path('tests/intelligence.test.ts');s=p.read_text(encoding='utf-8');s=s.replace("import messy from \"./fixtures/messy.json\";", "import messy from \"./fixtures/messy-pdfjs.json\";")
s += '''\nit('handles quoted non-scalar clause replacements',()=>{const r=compare(makeDocument('Equipment must be factory new.'),makeDocument('Replace "Equipment must be factory new." with "Certified refurbished equipment is also permitted."'));expect(r.changes.find(c=>c.field==='otherConditions')?.kind).toBe('Modified');});\n'''
p.write_text(s,encoding='utf-8')
