import { qaAnalysisSchema } from "./analysis/schema.js";

const exampleAnalysis = {
  riskLevel: "HIGH",
  summary: "Bulk contact import introduces data integrity risks.",
  risks: [
    {
      title: "Duplicate contacts",
      severity: "HIGH",
      reason: "The import process may create duplicate records.",
    },
  ],
  recommendedTests: [
    "Import duplicate contacts",
    "Import malformed CSV",
    "Import an unauthorized request",
  ],
};

const result = qaAnalysisSchema.safeParse(exampleAnalysis);

if (result.success) {
  console.log("QA analysis is valid.");
  console.log(result.data);
} else {
  console.error("QA analysis is invalid.");
  console.error(result.error.issues);
}