
import {
  riskProfiles,
  type RiskCategory,
  type RiskProfile,
} from "./risk-profile.js";

import { stripComments } from "./code-sanitizer.js";

export interface ClassificationResult {
  profiles: RiskProfile[];
  categories: RiskCategory[];
  riskScore: number;
}

function matchesBusinessKeyword(
  text: string,
  keyword: string,
): boolean {
  const escapedKeyword = keyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  // Ignore JavaScript/TypeScript module imports such as:
  // import { foo } from "./foo.js"
  if (
    keyword === "import" &&
    /\bimport\s+(?:type\s+)?(?:\{[^}]*\}|\w+)\s+from\s+["']/.test(
      text,
    )
  ) {
    return false;
  }

  const pattern = new RegExp(
    `\\b${escapedKeyword}\\b`,
    "i",
  );

  return pattern.test(text);
}

export function classifyChange(
  change: string,
): ClassificationResult {
  // Remove comments before performing business-risk classification.
  // This prevents words such as "payment", "refund", or "migration"
  // inside comments from triggering a risk profile.
  const code = stripComments(change);

  const profiles = riskProfiles.filter((profile) =>
    profile.keywords.some((keyword) =>
      matchesBusinessKeyword(code, keyword),
    ),
  );

  const categories = [
    ...new Set(
      profiles.flatMap((profile) => profile.categories),
    ),
  ];

  const riskScore =
    profiles.length === 0
      ? 0
      : Math.min(
          100,
          Math.max(
            ...profiles.map(
              (profile) => profile.baseRiskScore,
            ),
          ),
        );

  return {
    profiles,
    categories,
    riskScore,
  };
}

