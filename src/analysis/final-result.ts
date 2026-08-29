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
  return {
    riskAssessment,
    aiAnalysis,
    consistency,
    evaluation,
    finalDecision: riskAssessment.decision,
  };
}
