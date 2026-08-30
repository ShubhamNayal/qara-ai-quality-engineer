import type { RiskDecision } from "../analysis/risk-decision.js";

export function getExitCode(
  decision: RiskDecision,
  noFail = false,
): number {
  if (noFail) {
    return 0;
  }

  switch (decision) {
    case "ROUTINE_TESTING":
      return 0;

    case "TESTING_RECOMMENDED":
      return 0;

    case "MUST_TEST":
      return 1;

    case "MUST_TEST_BEFORE_RELEASE":
      return 1;
  }
}
