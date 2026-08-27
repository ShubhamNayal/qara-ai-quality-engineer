import { anthropic } from "../ai/client.js";
import { buildQAAnalysisPrompt } from "../ai/prompts.js";
import { parseAIAnalysis } from "../ai/parser.js";

import { evaluateAnalysis } from "./evaluator.js";
import { buildFinalResult } from "./final-result.js";
import { checkRiskConsistency } from "./risk-consistency.js";
import { assessRisk } from "./risk-assessor.js";

export async function analyzeChange(change: string) {
  const riskAssessment = assessRisk(change);

  const prompt = buildQAAnalysisPrompt(
    change,
    riskAssessment,
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = response.content.find(
    (block) => block.type === "text",
  );

  if (!textBlock) {
    throw new Error("Claude returned no text response.");
  }

  const aiAnalysis = parseAIAnalysis(textBlock.text);

  const consistency = checkRiskConsistency(
    riskAssessment.riskLevel,
    aiAnalysis.riskLevel,
  );

  const evaluation = evaluateAnalysis(aiAnalysis);

  return buildFinalResult(
    riskAssessment,
    aiAnalysis,
    consistency,
    evaluation,
  );
}