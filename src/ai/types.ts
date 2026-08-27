export interface AIAnalysisRisk {
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reason: string;
}

export interface AIAnalysis {
  summary: string;
  risks: AIAnalysisRisk[];
  recommendedTests: string[];
}
