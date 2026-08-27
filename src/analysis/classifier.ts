import {
  riskProfiles,
  type RiskCategory,
  type RiskProfile,
} from "./risk-profile.js";

export interface ClassificationResult {
  profiles: RiskProfile[];
  categories: RiskCategory[];
    riskScore: number;
}

export function classifyChange(
  change: string,
): ClassificationResult {
  const normalizedChange = change.toLowerCase();

  const profiles = riskProfiles.filter((profile) =>
    profile.keywords.some((keyword) =>
      normalizedChange.includes(keyword),
    ),
  );

  const categories = [
    ...new Set(
      profiles.flatMap((profile) => profile.categories),
    ),
  ];
  const riskScore = profiles.length===0?0:
            Math.min(100,Math.max(...profiles.map((profile) => profile.baseRiskScore)));

  return {
    profiles,
    categories,
    riskScore,
  };
}