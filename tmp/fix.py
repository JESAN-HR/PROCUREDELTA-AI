from pathlib import Path
p=Path('src/lib/intelligence.ts');s=p.read_text(encoding='utf-8').replace("[0-9০-৯][0-9০-৯,]*", "[0-9০-৯]+(?:,[0-9০-৯]{3})*")
s=s.replace('const changes = [...initial],','const changes = initial.filter(c => complete || c.field !== "publicationDate"),')
p.write_text(s,encoding='utf-8')
p=Path('src/lib/storage.ts');s=p.read_text(encoding='utf-8').replace('  page: z.number().int().positive().optional(),','  page: z.number().int().positive().optional(),\n  clause: z.string().optional(),').replace('      explanation: z.string(),','      explanation: z.string(),\n      instruction: factSchema.optional(),\n      method: z.string().optional(),').replace('  completeReplacement: z.boolean(),','  completeReplacement: z.boolean(),\n  mode: z.enum(["brief", "comparison"]).optional(),\n  effectiveFields: extractionSchema.optional(),\n  carriedFields: z.array(fieldSchema).optional(),\n  unresolved: z.array(z.string()).optional(),\n  reviewed: z.boolean().optional(),')
p.write_text(s,encoding='utf-8')
