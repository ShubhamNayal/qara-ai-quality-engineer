
import type { z } from "zod";
import { qaAnalysisSchema } from "./schema.js";

export type QAAnalysis = z.infer<typeof qaAnalysisSchema>;

export interface EvaluationResult {
  passed: boolean;
  score: number;
  issues: string[];
}

function getExpectedTestRange(
  riskLevel: QAAnalysis["riskLevel"],
): { min: number; max: number } {
  switch (riskLevel) {
    case "LOW":
      return { min: 0, max: 1 };

    case "MEDIUM":
      return { min: 1, max: 2 };

    case "HIGH":
      return { min: 2, max: 4 };

    case "CRITICAL":
      return { min: 3, max: 5 };
  }
}

export function evaluateAnalysis(
  analysis: QAAnalysis,
): EvaluationResult {
  // QARA analyzes external software only.
  // QARA's own source-code changes must never be evaluated
  // using external-product regression-test requirements.
  if (analysis.isQaraChange) {
    return {
      passed: true,
      score: 100,
      issues: [],
    };
  }

  const issues: string[] = [];

  const { min, max } = getExpectedTestRange(
    analysis.riskLevel,
  );

  const testCount = analysis.recommendedTests.length;

  // Rule 1: A QA analysis should identify at least one risk
  // unless the change genuinely has no meaningful risk.
  if (
    analysis.riskLevel !== "LOW" &&
    analysis.risks.length === 0
  ) {
    issues.push(
      `${analysis.riskLevel} risk analysis identified no meaningful risks.`,
    );
  }

  // Rule 2: Recommended regression tests must be proportional
  // to the actual risk level.
  if (testCount < min) {
    issues.push(
      `${analysis.riskLevel} risk should recommend at least ${min} regression test(s), but ${testCount} were recommended.`,
    );
  }

  if (testCount > max) {
    issues.push(
      `${analysis.riskLevel} risk should recommend no more than ${max} regression test(s), but ${testCount} were recommended.`,
    );
  }

  // Rule 3: HIGH or CRITICAL risk should have a corresponding
  // HIGH or CRITICAL risk entry.
  if (
    (analysis.riskLevel === "HIGH" ||
      analysis.riskLevel === "CRITICAL") &&
    !analysis.risks.some(
      (risk) =>
        risk.severity === "HIGH" ||
        risk.severity === "CRITICAL",
    )
  ) {
    issues.push(
      `${analysis.riskLevel} overall risk has no HIGH or CRITICAL risk identified.`,
    );
  }

  // Rule 4: LOW-risk changes should not produce excessive
  // regression coverage.
  if (
    analysis.riskLevel === "LOW" &&
    testCount > 1
  ) {
    issues.push(
      "LOW risk changes should recommend at most 1 regression test.",
    );
  }

  const score = Math.max(
    0,
    100 - issues.length * 25,
  );

  return {
    passed: issues.length === 0,
    score,
    issues,
  };
}

