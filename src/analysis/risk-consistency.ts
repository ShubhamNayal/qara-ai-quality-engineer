import type { RiskLevel } from "./risk-assessor.js";

export interface RiskConsistencyResult {
  consistent: boolean;
  difference: number;
  message: string;
}

const riskRank: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export function checkRiskConsistency(
  deterministicRisk: RiskLevel,
  aiRisk: RiskLevel,
): RiskConsistencyResult {
  const difference =
    riskRank[aiRisk] - riskRank[deterministicRisk];

  if (difference < -1) {
    return {
      consistent: false,
      difference,
      message:
        `AI risk level ${aiRisk} significantly underestimates ` +
        `deterministic risk level ${deterministicRisk}.`,
    };
  }

  return {
    consistent: true,
    difference,
    message:
      `AI risk level ${aiRisk} is consistent with ` +
      `deterministic risk level ${deterministicRisk}.`,
  };
}
