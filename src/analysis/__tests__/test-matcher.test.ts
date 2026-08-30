import { describe, expect, it } from "vitest";

import {
  isDuplicateRecommendation,
  isRecommendationSatisfied,
  tokenOverlapScore,
} from "../test-matcher.js";
import type { RecommendedTest } from "../schema.js";

function recommendation(
  overrides: Partial<RecommendedTest> = {},
): RecommendedTest {
  return {
    area: "Refunds",
    priority: "HIGH",
    scenario: "Refund a partially captured payment",
    expectedBehavior: "The remaining authorized amount is released.",
    ...overrides,
  };
}

describe("tokenOverlapScore", () => {
  it("scores identical text as fully overlapping", () => {
    expect(
      tokenOverlapScore("Refund a captured payment", "Refund a captured payment"),
    ).toBe(1);
  });

  it("scores completely unrelated text as zero", () => {
    expect(
      tokenOverlapScore(
        "Refund a partially captured payment",
        "Render the settings dropdown menu",
      ),
    ).toBe(0);
  });

  it("is tolerant of plurals via light stemming", () => {
    expect(tokenOverlapScore("Refunds payments", "Refund payment")).toBe(1);
  });
});

describe("isRecommendationSatisfied", () => {
  it("is satisfied when a nearby test case closely matches the scenario", () => {
    const test = recommendation();

    const satisfied = isRecommendationSatisfied(test, [
      {
        file: "src/payments/refund.test.ts",
        cases: ["refunds a partially captured payment correctly"],
      },
    ]);

    expect(satisfied).toBe(true);
  });

  it("is not satisfied when no existing test case relates to the scenario", () => {
    const test = recommendation();

    const satisfied = isRecommendationSatisfied(test, [
      {
        file: "src/settings/theme.test.ts",
        cases: ["renders the dark mode toggle"],
      },
    ]);

    expect(satisfied).toBe(false);
  });

  it("is not satisfied when there are no existing tests at all", () => {
    expect(isRecommendationSatisfied(recommendation(), [])).toBe(false);
  });
});

describe("isDuplicateRecommendation", () => {
  it("flags a reworded duplicate of an existing recommendation", () => {
    const candidate = recommendation({
      scenario: "Partially captured payments should be refundable",
    });

    expect(isDuplicateRecommendation(candidate, [recommendation()])).toBe(
      true,
    );
  });

  it("does not flag an unrelated recommendation as a duplicate", () => {
    const candidate = recommendation({
      area: "Checkout",
      scenario: "Apply a discount code at checkout",
      expectedBehavior: "The order total reflects the discount.",
    });

    expect(isDuplicateRecommendation(candidate, [recommendation()])).toBe(
      false,
    );
  });
});
