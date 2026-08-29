
import { describe, expect, it } from "vitest";

import { getRiskDecision } from "../risk-decision.js";

describe("Risk Decision", () => {
  it("recommends routine testing for low-risk changes", () => {
    expect(getRiskDecision("LOW")).toBe(
      "ROUTINE_TESTING",
    );
  });

  it("recommends testing for medium-risk changes", () => {
    expect(getRiskDecision("MEDIUM")).toBe(
      "TESTING_RECOMMENDED",
    );
  });

  it("requires testing for high-risk changes", () => {
    expect(getRiskDecision("HIGH")).toBe(
      "MUST_TEST",
    );
  });

  it("requires testing before release for critical-risk changes", () => {
    expect(getRiskDecision("CRITICAL")).toBe(
      "MUST_TEST_BEFORE_RELEASE",
    );
  });
});

