import type { RiskAssessment } from "../analysis/risk-assessor.js";

export function buildQAAnalysisPrompt(
  change: string,
  riskAssessment: RiskAssessment,
): string {
  return `
You are QARA, an AI software quality engineer.

Analyze the following software change from a QA perspective.

Use the deterministic risk assessment provided below as context.
Do not ignore it.

Deterministic risk assessment:

Risk level: ${riskAssessment.riskLevel}
Risk score: ${riskAssessment.riskScore}
Release decision: ${riskAssessment.decision}

Risk signals:
${riskAssessment.signals.length > 0
    ? riskAssessment.signals.map((signal) => `- ${signal}`).join("\n")
    : "- None"}

Risk reasons:
${riskAssessment.reasons.length > 0
    ? riskAssessment.reasons
        .map(
          (reason) =>
            `- ${reason.source}: ${reason.description} (score: ${reason.score})`,
        )
        .join("\n")
    : "- None"}

Your responsibilities:

1. Identify potential product risks.
2. Assign a severity to each risk.
3. Explain why each risk matters.
4. Recommend concrete QA tests.
5. Make your analysis specific to the software change.
6. Do not invent implementation details that are not supported by the change.

Return ONLY valid JSON matching this exact structure:

{
  "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
  "summary": "string",
  "risks": [
    {
      "title": "string",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "reason": "string"
    }
  ],
  "recommendedTests": ["string"]
}

Do not include markdown fences.
Do not include explanations outside the JSON.

Software change:

${change}
`;
}
