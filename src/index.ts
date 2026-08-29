
import "dotenv/config";

import { analyzeChange } from "./analysis/analyzer.js";
import { getGitDiff } from "./input/git-diff.js";
import { extractChange } from "./input/change-extractor.js";
import { formatChangeForAnalysis } from "./input/change-formatter.js";

const diff = await getGitDiff("HEAD");
const extractedChange = extractChange(diff);
const change = formatChangeForAnalysis(extractedChange);

if (!change) {
  console.log("No Git changes detected.");
  process.exit(0);
}

console.log("\nQARA analyzing Git changes...\n");

const analysis = await analyzeChange(change);

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`QARA — RELEASE RISK: ${analysis.riskAssessment.riskLevel}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log(`\nDecision: ${analysis.finalDecision}`);
console.log(`Risk Score: ${analysis.riskAssessment.riskScore}/100`);

console.log("\nWHY?");
for (const reason of analysis.riskAssessment.reasons) {
  console.log(`• ${reason.description} (+${reason.score})`);
}

console.log("\nAI SUMMARY");
console.log(analysis.aiAnalysis.summary);

console.log("\nRISKS");

analysis.aiAnalysis.risks.forEach((risk, index) => {
  console.log(`\n${index + 1}. ${risk.title}`);
  console.log(`   Severity: ${risk.severity}`);
  console.log(`   ${risk.reason}`);
});

console.log("\nRECOMMENDED QA TESTS");

analysis.aiAnalysis.recommendedTests.forEach((test, index) => {
  console.log(`\n${index + 1}. [${test.priority}] ${test.area}`);
  console.log(`   Scenario: ${test.scenario}`);
  console.log(`   Expected: ${test.expectedBehavior}`);
});

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`Deterministic Risk: ${analysis.riskAssessment.riskLevel}`);
console.log(`AI Risk:            ${analysis.aiAnalysis.riskLevel}`);
console.log(
  `Consistency:        ${analysis.consistency.consistent ? "PASS" : "FAIL"}`,
);
console.log(`Final Decision:     ${analysis.finalDecision}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

