import { describe, expect, it } from "vitest";

import { formatPrComment } from "../pr-comment.js";
import type { QARAResult } from "../../analysis/final-result.js";
import type { RecommendedTest } from "../../analysis/schema.js";

function productResult(
  recommendedTests: RecommendedTest[] = [
    {
      area: "Refunds",
      priority: "HIGH",
      scenario: "Refund a partially captured payment",
      expectedBehavior:
        "The remaining authorized amount is released.",
    },
  ],
): QARAResult {
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
      recommendedTests,
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
    const pendingState: RecommendedTest[] = [
      {
        area: "Refunds",
        priority: "HIGH",
        scenario: "Refund a partially captured payment",
        expectedBehavior:
          "The remaining authorized amount is released.",
      },
    ];

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
      pendingState,
      newlySatisfiedCount: 0,
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
      pendingState: [],
    });

    expect(comment).toContain("changes QARA itself, not a product");
    expect(comment).not.toContain("Additional tests to add");
  });

  it("shows the reconciled pending list, not the raw AI recommendation list", () => {
    const freshFromAi: RecommendedTest[] = [
      {
        area: "Refunds",
        priority: "HIGH",
        scenario: "This should never be shown",
        expectedBehavior: "n/a",
      },
    ];

    const pendingState: RecommendedTest[] = [
      {
        area: "Refunds",
        priority: "MEDIUM",
        scenario: "Reject a refund larger than the original charge",
        expectedBehavior: "The refund request is rejected.",
      },
    ];

    const comment = formatPrComment({
      kind: "product",
      result: productResult(freshFromAi),
      services: ["payments"],
      affectedAreas: ["Payments"],
      existingTests: [],
      pendingState,
      newlySatisfiedCount: 0,
    });

    expect(comment).toContain(
      "Reject a refund larger than the original charge",
    );
    expect(comment).not.toContain("This should never be shown");
  });

  it("notes how many previously recommended tests were just satisfied", () => {
    const comment = formatPrComment({
      kind: "product",
      result: productResult([]),
      services: ["payments"],
      affectedAreas: ["Payments"],
      existingTests: [],
      pendingState: [
        {
          area: "Refunds",
          priority: "LOW",
          scenario: "Still outstanding",
          expectedBehavior: "n/a",
        },
      ],
      newlySatisfiedCount: 2,
    });

    expect(comment).toContain(
      "✅ 2 previously recommended tests added in this push.",
    );
    expect(comment).toContain("Still outstanding");
  });

  it("embeds a hidden, decodable state block with the pending recommendations", () => {
    const pendingState: RecommendedTest[] = [
      {
        area: "Refunds",
        priority: "LOW",
        scenario: "Still outstanding",
        expectedBehavior: "n/a",
      },
    ];

    const comment = formatPrComment({
      kind: "product",
      result: productResult([]),
      services: [],
      affectedAreas: [],
      existingTests: [],
      pendingState,
      newlySatisfiedCount: 0,
    });

    const match = /<!-- qara-state:([A-Za-z0-9+/=]*)\s*-->/u.exec(comment);

    expect(match).not.toBeNull();

    const decoded = JSON.parse(
      Buffer.from(match![1]!, "base64").toString("utf8"),
    );

    expect(decoded).toEqual(pendingState);
  });

  it("embeds an (empty) state block even for non-product comment kinds", () => {
    const comment = formatPrComment({
      kind: "no-changes",
      pendingState: [],
    });

    expect(comment).toMatch(/<!-- qara-state:[A-Za-z0-9+/=]*\s*-->/u);
  });
});
