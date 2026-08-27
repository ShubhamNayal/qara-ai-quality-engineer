import type { AIAnalysis } from "../ai/types.js";
import type { RiskAssessment } from "./risk-assessor.js";
import type { RiskConsistencyResult } from "./risk-consistency.js";
import type { EvaluationResult } from "./evaluator.js";

export interface QARAResult {
  riskAssessment: RiskAssessment;
  aiAnalysis: AIAnalysis;
  consistency: RiskConsistencyResult;
  evaluation: EvaluationResult;
  finalDecision:
    | "SAFE_TO_PROCEED"
    | "TEST_BEFORE_RELEASE"
    | "BLOCK_RELEASE";
}

export function buildFinalResult(
  riskAssessment: RiskAssessment,
  aiAnalysis: AIAnalysis,
  consistency: RiskConsistencyResult,
  evaluation: EvaluationResult,
): QARAResult {
  let finalDecision = riskAssessment.decision;

  if (!consistency.consistent) {
    finalDecision = "BLOCK_RELEASE";
  }

  if (!evaluation.passed) {
    finalDecision = "TEST_BEFORE_RELEASE";
  }

  if (
    riskAssessment.riskLevel === "CRITICAL"
  ) {
    finalDecision = "BLOCK_RELEASE";
  }

  return {
    riskAssessment,
    aiAnalysis,
    consistency,
    evaluation,
    finalDecision,
  };
}
