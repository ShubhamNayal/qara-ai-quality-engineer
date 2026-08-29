import { describe, expect, it } from "vitest";

import { buildFinalResult } from "../final-result.js";
import type { RiskAssessment } from "../risk-assessor.js";
import type { AIAnalysis } from "../../ai/types.js";
import type { RiskConsistencyResult } from "../risk-consistency.js";
import type { EvaluationResult } from "../evaluator.js";

describe("Final Result", () => {
  const riskAssessment = {
    classification: {
      profiles: [],
      categories: [],
      riskScore: 0,
    },
    signals: [],
    riskScore: 10,
    riskLevel: "LOW",
    decision: "SAFE_TO_PROCEED",
    reasons: [],
  } as RiskAssessment;

  const aiAnalysis = {} as AIAnalysis;

  const consistency = {
    consistent: true,
    reasons: [],
  } as RiskConsistencyResult;

  const evaluation = {
    passed: true,
    score: 100,
    issues: [],
  } as EvaluationResult;

  it("returns the risk assessment decision", () => {
    const result = buildFinalResult(
      riskAssessment,
      aiAnalysis,
      consistency,
      evaluation,
    );

    expect(result.finalDecision).toBe("SAFE_TO_PROCEED");
  });

  it("preserves the assessment and analysis data", () => {
    const result = buildFinalResult(
      riskAssessment,
      aiAnalysis,
      consistency,
      evaluation,
    );

    expect(result.riskAssessment).toBe(riskAssessment);
    expect(result.aiAnalysis).toBe(aiAnalysis);
    expect(result.consistency).toBe(consistency);
    expect(result.evaluation).toBe(evaluation);
  });
});
