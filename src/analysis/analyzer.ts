import { anthropic } from "../ai/client.js";
import { qaAnalysisSchema } from "./schema.js";

export async function analyzeChange(change: string) {
  const response = await anthropic.messages.create({
   model: "claude-sonnet-5",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
      content: `Analyze the following software change from a QA perspective.

Identify:
1. Potential product risks
2. Severity of each risk
3. Why each risk matters
4. Tests that should be executed

Return ONLY valid JSON matching this exact structure:

{
  "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
  "summary": "string",
  "risks": [
    {
      "title": "string",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "reason": "string"
    }
  ],
  "recommendedTests": ["string"]
}

Do not include markdown fences or any text outside the JSON.

Software change:

${change}`,
      },
    ],
  });

  const textBlock = response.content.find(
    (block) => block.type === "text",
  );

  if (!textBlock) {
    throw new Error("Claude returned no text response.");
  }

  const parsed = JSON.parse(textBlock.text);

  return qaAnalysisSchema.parse(parsed);
}