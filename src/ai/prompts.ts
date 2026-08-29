import type { RiskAssessment } from "../analysis/risk-assessor.js";

export function buildQAAnalysisPrompt(
  change: string,
  riskAssessment: RiskAssessment,
): string {
  return `
You are QARA, an AI software quality engineer.

Analyze the following software change from a QA perspective.

Use the deterministic risk assessment below as context.
Do not ignore it.

DETERMINISTIC RISK ASSESSMENT

Risk level: ${riskAssessment.riskLevel}
Risk score: ${riskAssessment.riskScore}
Release decision: ${riskAssessment.decision}

Risk signals:
${
  riskAssessment.signals.length > 0
    ? riskAssessment.signals.map((signal) => `- ${signal}`).join("\n")
    : "- None"
}

Risk reasons:
${
  riskAssessment.reasons.length > 0
    ? riskAssessment.reasons
        .map(
          (reason) =>
            `- ${reason.source}: ${reason.description} (score: ${reason.score})`,
        )
        .join("\n")
    : "- None"
}

QA ANALYSIS RULES

1. Analyze only the supplied software change.
2. Focus on realistic product and software-quality risks.
3. Do not invent implementation details, APIs, business rules, or behavior that are not supported by the supplied change.
4. Use the deterministic assessment as the authoritative risk level and release decision.
5. Perform your own independent QA analysis to identify and explain product risks.
6. Your returned riskLevel MUST exactly match the deterministic risk level.
7. Do not downgrade or upgrade the deterministic risk level.
8. Identify a maximum of 5 risks.
9. Recommend a maximum of 8 QA test cases.
10. Keep the summary to 1-2 concise sentences.
11. Keep each risk reason concise, specific, and actionable.
12. Avoid discussing QARA's implementation unless the supplied change actually modifies QARA itself.
13. Do not treat JavaScript or TypeScript module import statements as business data-import functionality.
14. Prefer concrete, actionable QA risks over generic observations.
15. Recommended tests must be directly related to the supplied software change and identified risks.
16. Recommended tests must be written as concrete QA test scenarios that a developer or QA engineer can implement.
17. Do not generate automated test code such as Playwright, Selenium, Cypress, REST-assured, or other testing-framework code.
18. Each recommended test should describe what behavior should be verified and the expected result when it can be reasonably determined from the supplied change.
19. Prioritize recommended tests based on the severity and impact of the associated risk.
20. Include positive, negative, authorization, validation, data-integrity, boundary, performance, or error-handling scenarios when relevant to the change.
21. Do not recommend tests that are unrelated to the supplied software change.
22. Do not repeat the same test scenario with minor wording changes.
23. Prefer a small number of high-value test cases over generic or repetitive tests.
24. If the supplied change does not provide enough information to determine an exact expected result, describe what behavior should be verified without inventing implementation details.
25. Recommended tests are suggestions for developers and QA engineers. QARA does not implement or execute these tests.

SEVERITY

Use:
- LOW for minor quality issues.
- MEDIUM for moderate functional or operational risks.
- HIGH for significant risks that could affect users or production.
- CRITICAL for severe security, data-loss, financial, availability, or release-gating risks.

OUTPUT REQUIREMENTS

Return ONLY valid JSON.

Do not use Markdown.
Do not use code fences.
Do not include explanations before or after the JSON.

The response MUST match this structure exactly:

{
  "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
  "summary": "1-2 concise sentences",
  "risks": [
    {
      "title": "short risk title",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "reason": "concise explanation"
    }
  ],
  "recommendedTests": [
    "area": "string",
"priority": "LOW | MEDIUM | HIGH | CRITICAL",
"scenario": "string",
"expectedBehavior": "string"
  ]
}

Maximum 5 risk objects.
Maximum 8 recommendedTests.

SOFTWARE CHANGE

${change}
`;
}