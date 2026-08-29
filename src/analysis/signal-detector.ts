import {
  riskSignals,
  type RiskSignal,
} from "./risk-signals.js";

function matchesKeyword(
  text: string,
  keyword: string,
): boolean {
  const escapedKeyword = keyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  const pattern = new RegExp(
    `\\b${escapedKeyword}\\b`,
    "i",
  );

  return pattern.test(text);
}

export function detectRiskSignals(
  change: string,
): RiskSignal[] {
  return riskSignals.filter((signal) =>
    signal.keywords.some((keyword) =>
      matchesKeyword(change, keyword),
    ),
  );
}