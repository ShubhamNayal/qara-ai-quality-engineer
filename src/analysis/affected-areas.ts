import type { ClassificationResult } from "./classifier.js";
import type { RiskCategory } from "./risk-profile.js";

const CATEGORY_LABELS: Record<RiskCategory, string> = {
  SECURITY: "Security",
  DATA_INTEGRITY: "Data integrity",
  AUTHORIZATION: "Authorization",
  VALIDATION: "Validation",
  PERFORMANCE: "Performance",
  FINANCIAL: "Financial operations",
  AVAILABILITY: "Availability",
};

const FEATURE_LABELS: Record<string, string> = {
  "data-import": "Data import",
  payment: "Payments",
  authentication: "Authentication",
  authorization: "Authorization",
  "database-change": "Database",
};

function humanizeFeature(featureType: string): string {
  return FEATURE_LABELS[featureType] ?? featureType.replaceAll("-", " ");
}

export function detectAffectedAreas(
  classification: ClassificationResult,
): string[] {
  const areas = new Set<string>();

  for (const profile of classification.profiles) {
    areas.add(humanizeFeature(profile.featureType));

    for (const category of profile.categories) {
      areas.add(CATEGORY_LABELS[category]);
    }
  }

  return [...areas].sort();
}
