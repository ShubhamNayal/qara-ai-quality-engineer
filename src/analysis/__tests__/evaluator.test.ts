
import { describe, expect, it } from "vitest";
import {
  evaluateAnalysis,
  type QAAnalysis,
} from "../evaluator.js";

describe("QA Analysis Evaluator", () => {
  it("passes a strong QA analysis", () => {
    const analysis: QAAnalysis = {
      riskLevel: "HIGH",

      summary:
        "Bulk contact import introduces data integrity and authorization risks.",

      risks: [
        {
          title: "Duplicate contacts",
          severity: "HIGH",
          reason:
            "Existing contacts may be duplicated during bulk import.",
        },
        {
          title: "Unauthorized import",
          severity: "CRITICAL",
          reason:
            "Unauthorized users could create large amounts of data.",
        },
      ],

      recommendedTests: [
        "Import duplicate contacts",
        "Import malformed CSV",
        "Test unauthorized access",
      ],
    };

    const result = evaluateAnalysis(analysis);

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
  });

  it("passes LOW risk analysis even when no risks are identified", () => {
    const analysis: QAAnalysis = {
      riskLevel: "LOW",

      summary: "The feature appears straightforward.",

      risks: [],

      recommendedTests: [],
    };

    const result = evaluateAnalysis(analysis);

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
  });

  it("fails HIGH risk analysis when no tests are recommended", () => {
    const analysis: QAAnalysis = {
      riskLevel: "HIGH",

      summary: "The feature has significant risks.",

      risks: [
        {
          title: "Data corruption",
          severity: "HIGH",
          reason:
            "Invalid imports could corrupt contact data.",
        },
      ],

      recommendedTests: [],
    };

    const result = evaluateAnalysis(analysis);

    expect(result.passed).toBe(false);
    expect(result.issues).toContain(
  "HIGH risk should recommend at least 2 regression test(s), but 0 were recommended.",
);
  });

  it("detects inconsistent overall risk", () => {
    const analysis: QAAnalysis = {
      riskLevel: "CRITICAL",

      summary: "The feature has serious risks.",

      risks: [
        {
          title: "Minor formatting issue",
          severity: "LOW",
          reason: "Formatting could be incorrect.",
        },
      ],

      recommendedTests: ["Test formatting"],
    };

    const result = evaluateAnalysis(analysis);

    expect(result.passed).toBe(false);

    expect(result.issues).toContain(
      "CRITICAL overall risk has no HIGH or CRITICAL risk identified.",
    );
  });
  it("passes QARA-internal changes without requiring regression tests", () => {
  const analysis: QAAnalysis = {
    isQaraChange: true,

    riskLevel: "CRITICAL",

    summary:
      "The change modifies QARA's own analysis infrastructure.",

    risks: [
      {
        title: "QARA-internal change",
        severity: "CRITICAL",
        reason:
          "The supplied change modifies QARA itself rather than an external product.",
      },
    ],

    recommendedTests: [],
  };

  const result = evaluateAnalysis(analysis);

  expect(result.passed).toBe(true);
  expect(result.score).toBe(100);
  expect(result.issues).toHaveLength(0);
});
});
