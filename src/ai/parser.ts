import { qaAnalysisSchema } from "../analysis/schema.js";

function extractJSON(text: string): string {
  const trimmed = text.trim();

  // Normal case: Claude returned pure JSON.
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  // Handle Markdown code fences.
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (
    withoutFences.startsWith("{") &&
    withoutFences.endsWith("}")
  ) {
    return withoutFences;
  }

  // Handle explanatory text surrounding the JSON.
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");

  if (start !== -1 && end > start) {
    return withoutFences.slice(start, end + 1);
  }

  throw new Error(
    "Claude returned invalid JSON. The AI response could not be parsed.",
  );
}

export function parseAIAnalysis(text: string) {
  let parsed: unknown;

  try {
    const json = extractJSON(text);
    parsed = JSON.parse(json);
  } catch {
    throw new Error(
      "Claude returned invalid JSON. The AI response could not be parsed.",
    );
  }
// console.log("PARSED CLAUDE JSON:");
// console.log(JSON.stringify(parsed, null, 2));
  const result = qaAnalysisSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(
      `Claude returned an invalid QA analysis: ${result.error.message}`,
    );
  }

  return result.data;
}
