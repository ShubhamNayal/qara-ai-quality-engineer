import { describe, expect, it } from "vitest";

import { checkRiskConsistency } from "../risk-consistency.js";

describe("Risk Consistency", () => {
  it("accepts matching risk levels", () => {
    const result = checkRiskConsistency("HIGH", "HIGH");

    expect(result.consistent).toBe(true);
    expect(result.difference).toBe(0);
  });

  it("accepts AI risk one level higher", () => {
    const result = checkRiskConsistency("HIGH", "CRITICAL");

    expect(result.consistent).toBe(true);
  });

  it("accepts AI risk one level lower", () => {
    const result = checkRiskConsistency("HIGH", "MEDIUM");

    expect(result.consistent).toBe(true);
  });

  it("rejects significant AI underestimation", () => {
    const result = checkRiskConsistency("CRITICAL", "LOW");

    expect(result.consistent).toBe(false);
    expect(result.difference).toBe(-3);
  });
});
