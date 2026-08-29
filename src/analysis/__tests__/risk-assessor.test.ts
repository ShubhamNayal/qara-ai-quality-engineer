import { describe, expect, it } from "vitest";

import { assessRisk } from "../risk-assessor.js";

describe("Risk Assessor", () => {
  it("calculates risk using the feature profile", () => {
    const change = `
      Add a new payment endpoint.
    `;

    const result = assessRisk(change);

    expect(result.classification.riskScore).toBe(85);
    expect(result.riskScore).toBeGreaterThan(85);
  });

  it("combines multiple risk signals", () => {
    const change = `
      Add a payment refund endpoint that creates
      new transaction records.
    `;

    const result = assessRisk(change);

    expect(result.signals).toContain(
      "financial-operation",
    );

    expect(result.signals).toContain(
      "write-operation",
    );

    expect(result.riskScore).toBe(100);
  });

  it("returns zero for an unknown change", () => {
    const change = `
      Change the company logo.
    `;

    const result = assessRisk(change);

    expect(result.classification.riskScore).toBe(0);
    expect(result.riskScore).toBe(0);
    expect(result.signals).toHaveLength(0);
  });

  it("detects multiple feature profiles", () => {
    const change = `
      Add OAuth authentication to the payment refund flow.
    `;

    const result = assessRisk(change);

    const featureTypes =
      result.classification.profiles.map(
        (profile) => profile.featureType,
      );

    expect(featureTypes).toContain("payment");
    expect(featureTypes).toContain("authentication");
  });

  it("blocks critical-risk changes", () => {
    const change = `
      Add a payment refund endpoint that creates
      new transaction records.
    `;

    const result = assessRisk(change);

    expect(result.riskLevel).toBe("CRITICAL");
    expect(result.decision).toBe("MUST_TEST_BEFORE_RELEASE");
  });

  it("allows low-risk changes to proceed", () => {
    const change = `
      Update the company logo.
    `;

    const result = assessRisk(change);

    expect(result.riskLevel).toBe("LOW");
    expect(result.decision).toBe("ROUTINE_TESTING");
  });
});
