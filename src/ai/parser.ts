import { qaAnalysisSchema } from "../analysis/schema.js";

export function parseAIAnalysis(text: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      "Claude returned invalid JSON. The AI response could not be parsed.",
    );
  }

  const result = qaAnalysisSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(
      `Claude returned an invalid QA analysis: ${result.error.message}`,
    );
  }

  return result.data;
}
