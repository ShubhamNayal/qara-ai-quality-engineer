
import { z } from "zod";

export const riskLevelSchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const riskSchema = z.object({
  title: z.string(),
  severity: riskLevelSchema,
  reason: z.string(),
});

export const recommendedTestSchema = z.object({
  area: z.string(),
  priority: riskLevelSchema,
  scenario: z.string(),
  expectedBehavior: z.string(),
});

export const qaAnalysisSchema = z.object({
  isQaraChange: z.boolean(),
  riskLevel: riskLevelSchema,
  summary: z.string(),
  risks: z.array(riskSchema).max(5),
  recommendedTests: z.array(recommendedTestSchema).max(8),
});

export type QAAnalysis = z.infer<typeof qaAnalysisSchema>;

export type RecommendedTest = z.infer<typeof recommendedTestSchema>;
