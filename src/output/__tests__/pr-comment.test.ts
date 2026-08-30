import { describe, expect, it } from "vitest";

import { formatPrComment } from "../pr-comment.js";
import type { QARAResult } from "../../analysis/final-result.js";

function productResult(): QARAResult {
  return {
    riskAssessment: {
      classification: {
        profiles: [],
        categories: [],
        riskScore: 85,
      },
      signals: ["financial-operation"],
      riskScore: 85,
      riskLevel: "CRITICAL",
      decision: "MUST_TEST_BEFORE_RELEASE",
      reasons: [],
    },
    aiAnalysis: {
      isQaraChange: false,
      riskLevel: "CRITICAL",
      summary:
        "This pull request changes refund handling in payments.",
      risks: [],
      recommendedTests: [
        {
          area: "Refunds",
          priority: "HIGH",
          scenario: "Refund a partially captured payment",
          expectedBehavior:
            "The remaining authorized amount is released.",
        },
      ],
    },
    consistency: {
      consistent: true,
      difference: 0,
      message: "consistent",
    },
    evaluation: {
      passed: true,
      score: 100,
      issues: [],
    },
    finalDecision: "MUST_TEST_BEFORE_RELEASE",
    services: ["payments"],
    affectedAreas: ["Payments", "Financial operations"],
    existingTests: [
      {
        file: "src/payments/refund.test.ts",
        cases: ["refunds a successful charge"],
      },
    ],
  };
}

describe("PR comment", () => {
  it("lists services, affected areas, current tests, and extra tests", () => {
    const comment = formatPrComment({
      kind: "product",
      result: productResult(),
      services: ["payments"],
      affectedAreas: ["Payments", "Financial operations"],
      existingTests: [
        {
          file: "src/payments/refund.test.ts",
          cases: ["refunds a successful charge"],
        },
      ],
    });

    expect(comment).toContain("<!-- qara-qa-bot -->");
    expect(comment).toContain("This PR contains changes on");
    expect(comment).toContain("**payments**");
    expect(comment).toContain("Affected areas");
    expect(comment).toContain("**Financial operations**");
    expect(comment).toContain("Current tests considered");
    expect(comment).toContain("src/payments/refund.test.ts");
    expect(comment).toContain("refunds a successful charge");
    expect(comment).toContain("Additional tests to add");
    expect(comment).toContain(
      "Apart from the current test cases, you should add:",
    );
    expect(comment).toContain(
      "Refund a partially captured payment",
    );
  });

  it("skips product recommendations for QARA-internal changes", () => {
    const comment = formatPrComment({
      kind: "qara-internal",
      summary: "This change modifies QARA itself.",
    });

    expect(comment).toContain("changes QARA itself, not a product");
    expect(comment).not.toContain("Additional tests to add");
  });
});
