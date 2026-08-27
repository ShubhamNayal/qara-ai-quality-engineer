import { describe, expect, it } from "vitest";

import { buildFinalResult } from "../final-result.js";

describe("Final QARA Result", () => {
  const baseRiskAssessment = {
    classification: {
      profiles: [],
      categories: [],
      riskScore: 20,
    },
    signals: [],
    riskScore: 20,
    riskLevel: "LOW" as const,
    decision: "SAFE_TO_PROCEED" as const,
    reasons: [],
  };

  const baseAIAnalysis = {
    riskLevel: "LOW" as const,
    summary: "Low-risk change.",
    risks: [
      {
        title: "Minor UI change",
        severity: "LOW" as const,
        reason: "Limited product impact.",
      },
    ],
    recommendedTests: ["Verify the UI change."],
  };

  const passingEvaluation = {
    passed: true,
    score: 100,
    issues: [],
  };

  it("allows a clean low-risk change", () => {
    const result = buildFinalResult(
      baseRiskAssessment,
      baseAIAnalysis,
      {
        consistent: true,
        difference: 0,
        message: "Risk levels are consistent.",
      },
      passingEvaluation,
    );

    expect(result.finalDecision).toBe(
      "SAFE_TO_PROCEED",
    );
  });

  it("blocks critical-risk changes", () => {
    const result = buildFinalResult(
      {
        ...baseRiskAssessment,
        riskLevel: "CRITICAL",
        decision: "BLOCK_RELEASE",
      },
      {
        ...baseAIAnalysis,
        riskLevel: "CRITICAL",
      },
      {
        consistent: true,
        difference: 0,
        message: "Risk levels are consistent.",
      },
      passingEvaluation,
    );

    expect(result.finalDecision).toBe(
      "BLOCK_RELEASE",
    );
  });

  it("blocks significant AI risk underestimation", () => {
    const result = buildFinalResult(
      {
        ...baseRiskAssessment,
        riskLevel: "CRITICAL",
        decision: "BLOCK_RELEASE",
      },
      {
        ...baseAIAnalysis,
        riskLevel: "LOW",
      },
      {
        consistent: false,
        difference: -3,
        message: "AI significantly underestimated risk.",
      },
      passingEvaluation,
    );

    expect(result.finalDecision).toBe(
      "BLOCK_RELEASE",
    );
  });

  it("requires testing when evaluation fails", () => {
    const result = buildFinalResult(
      baseRiskAssessment,
      baseAIAnalysis,
      {
        consistent: true,
        difference: 0,
        message: "Risk levels are consistent.",
      },
      {
        passed: false,
        score: 75,
        issues: ["No tests were recommended."],
      },
    );

    expect(result.finalDecision).toBe(
      "TEST_BEFORE_RELEASE",
    );
  });
});
