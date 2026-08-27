import {describe, it, expect} from "vitest";
import {z} from "zod";
import { qaAnalysisSchema } from "../schema.js";

describe("Qa analysis schema", () => {
    it("accepts a valid qa analysis",() => {
        const analysis ={
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
        "Import duplicate contacts",
        "Import malformed CSV",
        "Import an unauthorized request",
      ],
    };

    const result = qaAnalysisSchema.safeParse(analysis);

    expect(result.success).toBe(true);
  });
  it("rejects an invalid risk level", () => {
  const analysis = {
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
    riskLevel: "HIGH",

    risks: [],

    recommendedTests: [],
  };

  const result = qaAnalysisSchema.safeParse(analysis);

  expect(result.success).toBe(false);
});
it("rejects a risk with an invalid severity", () => {
  const analysis = {
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
});