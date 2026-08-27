import {
  riskSignals,
  type RiskSignal,
} from "./risk-signals.js";

export function detectRiskSignals(
  change: string,
): RiskSignal[] {
  const normalizedChange = change.toLowerCase();

  return riskSignals.filter((signal) =>
    signal.keywords.some((keyword) =>
      normalizedChange.includes(keyword),
    ),
  );
}
