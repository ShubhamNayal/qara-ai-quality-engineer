import { describe, expect, it } from "vitest";

import { reconcileRecommendations } from "../recommendation-reconciler.js";
import type { RecommendedTest } from "../schema.js";
import type { ExistingTest } from "../../input/existing-tests.js";

function test(scenario: string, overrides: Partial<RecommendedTest> = {}): RecommendedTest {
  return {
    area: "Refunds",
    priority: "HIGH",
    scenario,
    expectedBehavior: "n/a",
    ...overrides,
  };
}

describe("reconcileRecommendations", () => {
  it("drops a pending recommendation once a matching test case shows up, keeping the rest unchanged", () => {
    const previousPending: RecommendedTest[] = [
      test("Refund a partially captured payment"),
      test("Reject a refund larger than the original charge"),
      test("Reconcile a refund across two currencies"),
      test("Retry a refund after a gateway timeout"),
      test("Cancel a refund that is still pending"),
    ];

    const existingTests: ExistingTest[] = [
      {
        file: "src/payments/refund.test.ts",
        cases: [
          "refunds a partially captured payment",
          "rejects a refund larger than the original charge",
        ],
      },
    ];

    const { pending, satisfiedCount } = reconcileRecommendations(
      previousPending,
      [],
      existingTests,
    );

    expect(satisfiedCount).toBe(2);
    expect(pending).toHaveLength(3);
    expect(pending.map((t) => t.scenario)).toEqual([
      "Reconcile a refund across two currencies",
      "Retry a refund after a gateway timeout",
      "Cancel a refund that is still pending",
    ]);

    // Wording of what remains is untouched.
    expect(pending[0]).toEqual(previousPending[2]);
  });

  it("appends genuinely new recommendations from a fresh analysis pass", () => {
    const previousPending = [test("Refund a partially captured payment")];

    const fresh = [test("Apply a discount code larger than the order total", {
      area: "Checkout",
      expectedBehavior: "The discount is capped at the order total.",
    })];

    const { pending, satisfiedCount } = reconcileRecommendations(
      previousPending,
      fresh,
      [],
    );

    expect(satisfiedCount).toBe(0);
    expect(pending).toHaveLength(2);
    expect(pending).toContainEqual(previousPending[0]);
    expect(pending).toContainEqual(fresh[0]);
  });

  it("does not re-add a fresh recommendation that duplicates one already pending", () => {
    const previousPending = [test("Refund a partially captured payment")];

    const fresh = [
      test("Partially captured payments should be refundable"),
    ];

    const { pending } = reconcileRecommendations(previousPending, fresh, []);

    expect(pending).toHaveLength(1);
    expect(pending[0]).toEqual(previousPending[0]);
  });

  it("does not resurrect a recommendation that was already satisfied, even if the AI suggests it again", () => {
    const previousPending = [test("Refund a partially captured payment")];

    const existingTests: ExistingTest[] = [
      {
        file: "src/payments/refund.test.ts",
        cases: ["refunds a partially captured payment"],
      },
    ];

    const fresh = [test("Refund a partially captured payment")];

    const { pending, satisfiedCount } = reconcileRecommendations(
      previousPending,
      fresh,
      existingTests,
    );

    expect(satisfiedCount).toBe(1);
    expect(pending).toHaveLength(0);
  });

  it("returns an empty pending list when there is nothing previous and nothing fresh", () => {
    expect(reconcileRecommendations([], [], [])).toEqual({
      pending: [],
      satisfiedCount: 0,
    });
  });
});
