import { describe, it, expect } from "vitest";
import { qaAnalysisSchema } from "../schema.js";

describe("Qa analysis schema", () => {
it("accepts a valid qa analysis", () => {
const analysis = {
isQaraChange: false,

  riskLevel: "HIGH",

  summary:
    "Bulk contact import introduces data integrity and authorization risks.",

  risks: [
    {
      title: "Duplicate contacts",
      severity: "HIGH",
      reason:
        "Bulk imports may create duplicate contact records.",
    },
  ],

  recommendedTests: [
    {
      area: "Data integrity",
      priority: "HIGH",
      scenario: "Import duplicate contacts",
      expectedBehavior:
        "Duplicate contacts are detected or handled according to the product rules.",
    },
    {
      area: "Validation",
      priority: "HIGH",
      scenario: "Import malformed CSV",
      expectedBehavior:
        "Invalid CSV data is rejected with a clear validation error.",
    },
  ],
};

const result = qaAnalysisSchema.safeParse(analysis);

expect(result.success).toBe(true);


});

it("rejects an invalid risk level", () => {
const analysis = {
isQaraChange: false,

  riskLevel: "SUPER_HIGH",

  summary: "Something is risky.",

  risks: [],

  recommendedTests: [],
};

const result = qaAnalysisSchema.safeParse(analysis);

expect(result.success).toBe(false);

});

it("rejects an analysis with no summary", () => {
const analysis = {
isQaraChange: false,


  riskLevel: "HIGH",

  risks: [],

  recommendedTests: [],
};

const result = qaAnalysisSchema.safeParse(analysis);

expect(result.success).toBe(false);


});

it("rejects a risk with an invalid severity", () => {
const analysis = {
isQaraChange: false,


  riskLevel: "HIGH",

  summary: "Potential issue detected.",

  risks: [
    {
      title: "Data corruption",
      severity: "EXTREME",
      reason: "Could corrupt customer data.",
    },
  ],

  recommendedTests: [],
};

const result = qaAnalysisSchema.safeParse(analysis);

expect(result.success).toBe(false);

});

it("rejects more than 5 risks", () => {
const analysis = {
isQaraChange: false,

  riskLevel: "HIGH",

  summary: "Multiple risks detected.",

  risks: Array.from({ length: 6 }, (_, index) => ({
    title: `Risk ${index + 1}`,
    severity: "HIGH",
    reason: "Potential issue.",
  })),

  recommendedTests: [],
};

const result = qaAnalysisSchema.safeParse(analysis);

expect(result.success).toBe(false);

});

it("rejects more than 8 recommended tests", () => {
const analysis = {
isQaraChange: false,

  riskLevel: "HIGH",

  summary: "Multiple tests recommended.",

  risks: [],

  recommendedTests: Array.from({ length: 9 }, (_, index) => ({
    area: "Validation",
    priority: "HIGH",
    scenario: `Test scenario ${index + 1}`,
    expectedBehavior: "Expected behavior.",
  })),
};

const result = qaAnalysisSchema.safeParse(analysis);

expect(result.success).toBe(false);

});
});
