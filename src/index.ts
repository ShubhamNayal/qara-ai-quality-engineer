import "dotenv/config";

import { analyzeChange } from "./analysis/analyzer.js";
import { getGitDiff } from "./input/git-diff.js";
import { extractChange } from "./input/change-extractor.js";
import { formatChangeForAnalysis } from "./input/change-formatter.js";
import { getExitCode } from "./cli/exit-code.js";
import { parseArgs } from "./cli/args.js";

const options = parseArgs(process.argv.slice(2));

const diff = await getGitDiff(options.base);
const extractedChange = extractChange(diff);
const change = formatChangeForAnalysis(extractedChange);

if (!change) {
  if (options.json) {
    console.log(
      JSON.stringify(
        {
          status: "NO_CHANGES",
          message: "No Git changes detected.",
        },
        null,
        2,
      ),
    );
  } else {
    console.log("No Git changes detected.");
  }

  process.exit(0);
}

if (!options.json) {
  console.log("\nQARA analyzing Git changes...\n");
}

const analysis = await analyzeChange(change);

if (options.json) {
  console.log(
    JSON.stringify(analysis, null, 2),
  );
} else {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    `QARA — RELEASE RISK: ${analysis.riskAssessment.riskLevel}`,
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log(`\nDecision: ${analysis.finalDecision}`);
  console.log(
    `Risk Score: ${analysis.riskAssessment.riskScore}/100`,
  );

  console.log("\nWHY?");

  if (analysis.riskAssessment.reasons.length === 0) {
    console.log("• No specific risk signals detected.");
  } else {
    for (const reason of analysis.riskAssessment.reasons) {
      console.log(
        `• ${reason.description} (+${reason.score})`,
      );
    }
  }

  console.log("\nAI SUMMARY");
  console.log(analysis.aiAnalysis.summary);

  console.log("\nRISKS");

  if (analysis.aiAnalysis.risks.length === 0) {
    console.log("No significant risks identified.");
  } else {
    analysis.aiAnalysis.risks.forEach((risk, index) => {
      console.log(`\n${index + 1}. ${risk.title}`);
      console.log(`   Severity: ${risk.severity}`);
      console.log(`   ${risk.reason}`);
    });
  }

  console.log("\nRECOMMENDED QA TESTS");

  if (analysis.aiAnalysis.recommendedTests.length === 0) {
    console.log("No additional QA tests recommended.");
  } else {
    analysis.aiAnalysis.recommendedTests.forEach(
      (test, index) => {
        console.log(
          `\n${index + 1}. [${test.priority}] ${test.area}`,
        );
        console.log(`   Scenario: ${test.scenario}`);
        console.log(
          `   Expected: ${test.expectedBehavior}`,
        );
      },
    );
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    `Deterministic Risk: ${analysis.riskAssessment.riskLevel}`,
  );
  console.log(
    `AI Risk:            ${analysis.aiAnalysis.riskLevel}`,
  );
  console.log(
    `Consistency:        ${
      analysis.consistency.consistent
        ? "PASS"
        : "FAIL"
    }`,
  );
  console.log(
    `Final Decision:     ${analysis.finalDecision}`,
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

const exitCode = getExitCode(
  analysis.finalDecision,
);

process.exit(exitCode);
