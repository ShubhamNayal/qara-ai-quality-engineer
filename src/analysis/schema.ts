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

export const qaAnalysisSchema = z.object({
  riskLevel: riskLevelSchema,
  summary: z.string(),
  risks: z.array(riskSchema),
  recommendedTests: z.array(z.string()),
});

export type QAAnalysis = z.infer<typeof qaAnalysisSchema>;
