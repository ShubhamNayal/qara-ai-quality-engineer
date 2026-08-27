import type { RiskLevel } from "./risk-assessor.js";

export type RiskDecision =
  | "SAFE_TO_PROCEED"
  | "TEST_BEFORE_RELEASE"
  | "BLOCK_RELEASE";

export function getRiskDecision(
  riskLevel: RiskLevel,
): RiskDecision {
  switch (riskLevel) {
    case "LOW":
      return "SAFE_TO_PROCEED";

    case "MEDIUM":
      return "TEST_BEFORE_RELEASE";

    case "HIGH":
      return "TEST_BEFORE_RELEASE";

    case "CRITICAL":
      return "BLOCK_RELEASE";
  }
}
