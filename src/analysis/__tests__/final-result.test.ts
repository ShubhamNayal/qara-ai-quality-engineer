import { describe, expect, it } from "vitest";

import { buildFinalResult } from "../final-result.js";
import type { RiskAssessment } from "../risk-assessor.js";
import type { AIAnalysis } from "../../ai/types.js";
import type { RiskConsistencyResult } from "../risk-consistency.js";
import type { EvaluationResult } from "../evaluator.js";

describe("Final Result", () => {
  const aiAnalysis = {} as AIAnalysis;

  const baseConsistency = {
    consistent: true,
    reasons: [],
  } as RiskConsistencyResult;

  const passingEvaluation = {
    passed: true,
    score: 100,
    issues: [],
  } as EvaluationResult;

  function createRiskAssessment(
    riskLevel: RiskAssessment["riskLevel"],
    decision: RiskAssessment["decision"],
  ): RiskAssessment {
    return {
      classification: {
        profiles: [],
        categories: [],
        riskScore: 0,
      },
      signals: [],
      riskScore: 10,
      riskLevel,
      decision,
      reasons: [],
    };
  }

  it("preserves the deterministic decision when everything passes", () => {
    const riskAssessment = createRiskAssessment(
      "LOW",
      "ROUTINE_TESTING",
    );

    const result = buildFinalResult(
      riskAssessment,
      aiAnalysis,
      baseConsistency,
      passingEvaluation,
    );

    expect(result.finalDecision).toBe("ROUTINE_TESTING");
  });

  it("requires testing when risk assessments are inconsistent", () => {
    const riskAssessment = createRiskAssessment(
      "LOW",
      "ROUTINE_TESTING",
    );

    const inconsistent = {
      consistent: false,
      reasons: ["Risk levels do not match"],
    } as RiskConsistencyResult;

    const result = buildFinalResult(
      riskAssessment,
      aiAnalysis,
      inconsistent,
      passingEvaluation,
    );

    expect(result.finalDecision).toBe("MUST_TEST");
  });

  it("requires testing when evaluation fails", () => {
    const riskAssessment = createRiskAssessment(
      "LOW",
      "ROUTINE_TESTING",
    );

    const failedEvaluation = {
      passed: false,
      score: 50,
      issues: ["AI analysis quality is insufficient"],
    } as EvaluationResult;

    const result = buildFinalResult(
      riskAssessment,
      aiAnalysis,
      baseConsistency,
      failedEvaluation,
    );

    expect(result.finalDecision).toBe("MUST_TEST");
  });

  it("requires testing before release for critical risk", () => {
    const riskAssessment = createRiskAssessment(
      "CRITICAL",
      "MUST_TEST_BEFORE_RELEASE",
    );

    const result = buildFinalResult(
      riskAssessment,
      aiAnalysis,
      baseConsistency,
      passingEvaluation,
    );

    expect(result.finalDecision).toBe(
      "MUST_TEST_BEFORE_RELEASE",
    );
  });

  it("critical risk overrides a failed evaluation", () => {
    const riskAssessment = createRiskAssessment(
      "CRITICAL",
      "MUST_TEST_BEFORE_RELEASE",
    );

    const failedEvaluation = {
      passed: false,
      score: 20,
      issues: ["Multiple evaluation failures"],
    } as EvaluationResult;

    const result = buildFinalResult(
      riskAssessment,
      aiAnalysis,
      baseConsistency,
      failedEvaluation,
    );

    expect(result.finalDecision).toBe(
      "MUST_TEST_BEFORE_RELEASE",
    );
  });

  it("preserves all analysis data", () => {
    const riskAssessment = createRiskAssessment(
      "LOW",
      "ROUTINE_TESTING",
    );

    const result = buildFinalResult(
      riskAssessment,
      aiAnalysis,
      baseConsistency,
      passingEvaluation,
    );

    expect(result.riskAssessment).toBe(riskAssessment);
    expect(result.aiAnalysis).toBe(aiAnalysis);
    expect(result.consistency).toBe(baseConsistency);
    expect(result.evaluation).toBe(passingEvaluation);
    expect(result.services).toEqual([]);
    expect(result.affectedAreas).toEqual([]);
    expect(result.existingTests).toEqual([]);
  });
});
