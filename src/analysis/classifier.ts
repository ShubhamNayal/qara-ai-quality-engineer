import {
  riskProfiles,
  type RiskProfile,
} from "./risk-profile.js";

export function classifyChange(
  change: string,
): RiskProfile | undefined {
  const normalizedChange = change.toLowerCase();

  return riskProfiles.find((profile) =>
    profile.keywords.some((keyword) =>
      normalizedChange.includes(keyword),
    ),
  );
}