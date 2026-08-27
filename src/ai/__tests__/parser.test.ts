import { describe, expect, it } from "vitest";

import { parseAIAnalysis } from "../parser.js";

describe("AI Analysis Parser", () => {
  it("parses a valid Claude response", () => {
    const response = JSON.stringify({
      riskLevel: "HIGH",
      summary: "Bulk import introduces data integrity risks.",
      risks: [
        {
          title: "Duplicate contacts",
          severity: "HIGH",
          reason: "Duplicate records may be created.",
        },
      ],
      recommendedTests: [
        "Import duplicate contacts",
        "Import malformed CSV",
      ],
    });

    const result = parseAIAnalysis(response);

    expect(result.riskLevel).toBe("HIGH");
    expect(result.risks).toHaveLength(1);
    expect(result.recommendedTests).toHaveLength(2);
  });

  it("rejects malformed JSON", () => {
    const response = `{
      "riskLevel": "HIGH",
      "summary": "Incomplete response
    `;

    expect(() => parseAIAnalysis(response)).toThrow(
      "Claude returned invalid JSON.",
    );
  });

  it("rejects structurally invalid JSON", () => {
    const response = JSON.stringify({
      riskLevel: "HIGH",
      summary: "Missing required arrays.",
    });

    expect(() => parseAIAnalysis(response)).toThrow(
      "Claude returned an invalid QA analysis",
    );
  });
});
