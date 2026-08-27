import { describe, expect, it } from "vitest";

import { getRiskDecision } from "../risk-decision.js";

describe("Risk Decision", () => {
  it("allows low-risk changes to proceed", () => {
    expect(getRiskDecision("LOW")).toBe(
      "SAFE_TO_PROCEED",
    );
  });

  it("requires testing for medium-risk changes", () => {
    expect(getRiskDecision("MEDIUM")).toBe(
      "TEST_BEFORE_RELEASE",
    );
  });

  it("requires testing for high-risk changes", () => {
    expect(getRiskDecision("HIGH")).toBe(
      "TEST_BEFORE_RELEASE",
    );
  });

  it("blocks critical-risk changes", () => {
    expect(getRiskDecision("CRITICAL")).toBe(
      "BLOCK_RELEASE",
    );
  });
});
