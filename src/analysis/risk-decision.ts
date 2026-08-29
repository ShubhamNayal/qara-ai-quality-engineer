import type { RiskLevel } from "./risk-assessor.js";

export type RiskDecision =
  | "ROUTINE_TESTING"
  | "TESTING_RECOMMENDED"
  | "MUST_TEST"
  | "MUST_TEST_BEFORE_RELEASE";

export function getRiskDecision(
  riskLevel: RiskLevel,
): RiskDecision {
  switch (riskLevel) {
    case "LOW":
      return "ROUTINE_TESTING";

    case "MEDIUM":
      return "TESTING_RECOMMENDED";

    case "HIGH":
      return "MUST_TEST";

    case "CRITICAL":
      return "MUST_TEST_BEFORE_RELEASE";
  }
}
