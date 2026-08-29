import type { AIAnalysis } from "../ai/types.js";
import type { RiskAssessment } from "./risk-assessor.js";
import type { RiskConsistencyResult } from "./risk-consistency.js";
import type { EvaluationResult } from "./evaluator.js";
import type { RiskDecision } from "./risk-decision.js";

export interface QARAResult {
  riskAssessment: RiskAssessment;
  aiAnalysis: AIAnalysis;
  consistency: RiskConsistencyResult;
  evaluation: EvaluationResult;
  finalDecision: RiskDecision;
}

export function buildFinalResult(
  riskAssessment: RiskAssessment,
  aiAnalysis: AIAnalysis,
  consistency: RiskConsistencyResult,
  evaluation: EvaluationResult,
): QARAResult {
  let finalDecision = riskAssessment.decision;

  // Critical changes must always be tested before release.
  if (riskAssessment.riskLevel === "CRITICAL") {
    finalDecision = "MUST_TEST_BEFORE_RELEASE";
  }

  // If deterministic and AI risk assessments disagree,
  // require additional testing.
  if (!consistency.consistent) {
    finalDecision = "MUST_TEST";
  }

  // A failed AI analysis evaluation requires testing.
  if (!evaluation.passed) {
    finalDecision = "MUST_TEST";
  }

  // Critical risk is the strongest release gate and must
  // remain the final decision.
  if (riskAssessment.riskLevel === "CRITICAL") {
    finalDecision = "MUST_TEST_BEFORE_RELEASE";
  }

  return {
    riskAssessment,
    aiAnalysis,
    consistency,
    evaluation,
    finalDecision,
  };
}
