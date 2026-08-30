import type { AIAnalysis } from "../ai/types.js";
import type { ExistingTest } from "../input/existing-tests.js";
import type { RiskAssessment } from "./risk-assessor.js";
import type { RiskConsistencyResult } from "./risk-consistency.js";
import type { EvaluationResult } from "./evaluator.js";
import type { RiskDecision } from "./risk-decision.js";

export interface ProductContext {
  services: string[];
  affectedAreas: string[];
  existingTests: ExistingTest[];
}

export interface QARAResult {
  riskAssessment: RiskAssessment;
  aiAnalysis: AIAnalysis;
  consistency: RiskConsistencyResult;
  evaluation: EvaluationResult;
  finalDecision: RiskDecision;
  services: string[];
  affectedAreas: string[];
  existingTests: ExistingTest[];
}

export function buildFinalResult(
  riskAssessment: RiskAssessment,
  aiAnalysis: AIAnalysis,
  consistency: RiskConsistencyResult,
  evaluation: EvaluationResult,
  productContext: ProductContext = {
    services: [],
    affectedAreas: [],
    existingTests: [],
  },
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
    services: productContext.services,
    affectedAreas: productContext.affectedAreas,
    existingTests: productContext.existingTests,
  };
}
