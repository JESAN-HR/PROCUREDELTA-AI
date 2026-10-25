import { z } from "zod";
import { documentSchema, labels, type Document, type Report } from "./engine";
export type Store = {
  documents: Document[];
  reports: Report[];
  activeId?: string;
};
export const emptyStore: Store = { documents: [], reports: [] };
const fieldSchema = z.enum(
  Object.keys(labels) as [keyof typeof labels, ...(keyof typeof labels)[]],
);
const evidenceSchema = z.object({
  documentId: z.string(),
  quote: z.string(),
  page: z.number().int().positive().optional(),
  clause: z.string().optional(),
});
const factSchema = z.object({
  value: z.string(),
  normalized: z.string(),
  evidence: z.array(evidenceSchema),
  conflict: z.boolean(),
});
const extractionSchema = z.object({
  fields: z.partialRecord(fieldSchema, factSchema),
  extractionWarnings: z.array(z.string()),
  reviewPassages: z.array(evidenceSchema).optional(),
});
const reportSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  original: documentSchema,
  revised: documentSchema,
  originalFields: extractionSchema,
  revisedFields: extractionSchema,
  changes: z.array(
    z.object({
      field: fieldSchema,
      kind: z.enum(["Added", "Removed", "Modified", "Uncertain"]),
      before: factSchema.optional(),
      after: factSchema.optional(),
      explanation: z.string(),
      instruction: factSchema.optional(),
      method: z.string().optional(),
    }),
  ),
  completeReplacement: z.boolean(),
  mode: z.enum(["brief", "comparison"]).optional(),
  effectiveFields: extractionSchema.optional(),
  carriedFields: z.array(fieldSchema).optional(),
  unresolved: z.array(z.string()).optional(),
  reviewed: z.boolean().optional(),
});
const schema = z.object({
  documents: z.array(documentSchema),
  reports: z.array(reportSchema),
  activeId: z.string().optional(),
});
export function readStore(storage: Pick<Storage, "getItem">): Store {
  const raw = storage.getItem("procuredelta.v1");
  if (!raw) return emptyStore;
  const parsed = schema.safeParse(JSON.parse(raw));
  if (!parsed.success)
    throw new Error("Saved data is invalid. Clear local data to reset.");
  return parsed.data;
}
export function writeStore(storage: Pick<Storage, "setItem">, value: Store) {
  storage.setItem("procuredelta.v1", JSON.stringify(schema.parse(value)));
}
