import { anthropic } from "../ai/client.js";
import { buildQAAnalysisPrompt } from "../ai/prompts.js";
import { parseAIAnalysis } from "../ai/parser.js";
import type { ExistingTest } from "../input/existing-tests.js";

import { detectAffectedAreas } from "./affected-areas.js";
import { evaluateAnalysis } from "./evaluator.js";
import { buildFinalResult } from "./final-result.js";
import { checkRiskConsistency } from "./risk-consistency.js";
import { assessRisk } from "./risk-assessor.js";
import { detectServices } from "../input/service-detector.js";

export interface AnalyzeChangeOptions {
  files?: string[];
  existingTests?: ExistingTest[];
}

export async function analyzeChange(
  change: string,
  options: AnalyzeChangeOptions = {},
) {
  const files = options.files ?? [];
  const existingTests = options.existingTests ?? [];
  const riskAssessment = assessRisk(change);

  const prompt = buildQAAnalysisPrompt(
    change,
    riskAssessment,
    existingTests,
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4000,
    thinking:{
        type:"disabled"
    },
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });
    // console.log("\nCLAUDE RAW RESPONSE:\n");
    // console.log(JSON.stringify(response, null, 2));

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
    {
      services: detectServices(files),
      affectedAreas: detectAffectedAreas(
        riskAssessment.classification,
      ),
      existingTests,
    },
  );
}