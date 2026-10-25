import { z } from "zod";
import { labels, type Document } from "./engine";
export const aiOutputSchema = z.object({
  facts: z
    .array(
      z.object({
        field: z.enum(Object.keys(labels) as [string, ...string[]]),
        value: z.string().min(1).max(2000),
        quote: z.string().min(1).max(3000),
        document: z.enum(["original", "revised"]),
      }),
    )
    .max(40),
  interpretations: z
    .array(
      z.object({
        explanation: z.string().max(2000),
        originalQuote: z.string().min(1).max(3000),
        revisedQuote: z.string().min(1).max(3000),
        uncertainty: z.string().min(1).max(1000),
      }),
    )
    .max(20),
});
export type AiOutput = z.infer<typeof aiOutputSchema>;
export function validateAiOutput(
  value: unknown,
  original: Document,
  revised: Document,
) {
  const result = aiOutputSchema.parse(value);
  const text = {
    original: original.pages.map((p) => p.text).join("\n"),
    revised: revised.pages.map((p) => p.text).join("\n"),
  };
  for (const f of result.facts)
    if (!text[f.document].includes(f.quote) || !f.quote.includes(f.value))
      throw new Error(
        "AI fact lacks matching source evidence. Output rejected.",
      );
  for (const i of result.interpretations)
    if (
      !text.original.includes(i.originalQuote) ||
      !text.revised.includes(i.revisedQuote)
    )
      throw new Error(
        "AI interpretation has unmatched evidence. Output rejected.",
      );
  return result;
}
