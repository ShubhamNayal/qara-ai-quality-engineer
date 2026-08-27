import type { z } from "zod";
import { qaAnalysisSchema } from "./schema.js";

export type QAAnalysis = z.infer<typeof qaAnalysisSchema>;

export interface EvaluationResult {
  passed: boolean;
  score: number;
  issues: string[];
}

export function evaluateAnalysis(
  analysis: QAAnalysis,
): EvaluationResult {
  const issues: string[] = [];

  // Rule 1: A QA analysis should identify at least one risk.
  if (analysis.risks.length === 0) {
    issues.push("No risks were identified.");
  }

  // Rule 2: A QA analysis should recommend at least one test.
  if (analysis.recommendedTests.length === 0) {
    issues.push("No tests were recommended.");
  }

  // Rule 3: HIGH or CRITICAL risk should have a corresponding risk entry.
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

  const score = Math.max(0, 100 - issues.length * 25);

  return {
    passed: issues.length === 0,
    score,
    issues,
  };
}