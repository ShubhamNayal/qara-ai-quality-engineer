import { describe, expect, it } from "vitest";

import { detectAffectedAreas } from "../affected-areas.js";
import { riskProfiles } from "../risk-profile.js";

describe("Affected areas", () => {
  it("returns human-readable areas from matched profiles", () => {
    const payment = riskProfiles.find(
      (profile) => profile.featureType === "payment",
    );

    if (!payment) {
      throw new Error("payment profile is missing");
    }

    const areas = detectAffectedAreas({
      profiles: [payment],
      categories: payment.categories,
      riskScore: payment.baseRiskScore,
    });

    expect(areas).toContain("Payments");
    expect(areas).toContain("Financial operations");
    expect(areas).toContain("Security");
  });

  it("returns no areas when nothing matched", () => {
    expect(
      detectAffectedAreas({
        profiles: [],
        categories: [],
        riskScore: 0,
      }),
    ).toEqual([]);
  });
});
