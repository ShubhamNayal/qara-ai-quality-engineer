import "dotenv/config";
import { writeFileSync } from "node:fs";

import { getGitDiff } from "./input/git-diff.js";
import { extractChange } from "./input/change-extractor.js";
import { formatChangeForAnalysis } from "./input/change-formatter.js";
import { findExistingTests } from "./input/existing-tests.js";
import { getExitCode } from "./cli/exit-code.js";
import { parseArgs, type CLIOptions } from "./cli/args.js";
import { stripComments } from "./analysis/code-sanitizer.js";
import {
  formatPrComment,
  type PrCommentInput,
} from "./output/pr-comment.js";
import type { QARAResult } from "./analysis/final-result.js";

const options = parseArgs(process.argv.slice(2));

function printHumanAnalysis(analysis: QARAResult): void {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log(
    `QARA — RELEASE RISK: ${analysis.riskAssessment.riskLevel}`,
  );

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log(`\nDecision: ${analysis.finalDecision}`);

  console.log(
    `Risk Score: ${analysis.riskAssessment.riskScore}/100`,
  );

  if (analysis.services.length > 0) {
    console.log(
      `\nServices: ${analysis.services.join(", ")}`,
    );
  }

  if (analysis.affectedAreas.length > 0) {
    console.log(
      `Affected areas: ${analysis.affectedAreas.join(", ")}`,
    );
  }

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

  console.log("\nCURRENT TESTS");

  if (analysis.existingTests.length === 0) {
    console.log("No existing tests found next to the changed files.");
  } else {
    for (const test of analysis.existingTests) {
      console.log(`• ${test.file}`);
    }
  }

  console.log("\nADDITIONAL QA TESTS TO ADD");

  if (analysis.aiAnalysis.recommendedTests.length === 0) {
    console.log("No additional QA tests recommended.");
  } else {
    analysis.aiAnalysis.recommendedTests.forEach(
      (test, index) => {
        console.log(
          `\n${index + 1}. [${test.priority}] ${test.area}`,
        );

        console.log(
          `   Scenario: ${test.scenario}`,
        );

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

function finish(
  options: CLIOptions,
  commentInput: PrCommentInput,
  analysis?: QARAResult,
  decision?: QARAResult["finalDecision"],
): never {
  const comment = formatPrComment(commentInput);

  if (options.commentFile) {
    writeFileSync(options.commentFile, comment);
  }

  if (options.markdown) {
    console.log(comment);
  } else if (options.json) {
    if (analysis) {
      console.log(JSON.stringify(analysis, null, 2));
    } else {
      console.log(
        JSON.stringify(
          {
            status: commentInput.kind.toUpperCase().replaceAll("-", "_"),
            comment,
          },
          null,
          2,
        ),
      );
    }
  } else if (analysis) {
    console.log("\nQARA analyzing Git changes...\n");
    printHumanAnalysis(analysis);
  } else {
    console.log(comment.replace("<!-- qara-qa-bot -->\n", "").trim());
  }

  process.exit(
    getExitCode(decision ?? "ROUTINE_TESTING", options.noFail),
  );
}

try {
  const diff = await getGitDiff(options.base);
  const extractedChange = extractChange(diff);

  const meaningfulAddedLines = stripComments(
    extractedChange.addedLines.join("\n"),
  ).trim();

  const meaningfulRemovedLines = stripComments(
    extractedChange.removedLines.join("\n"),
  ).trim();

  if (!meaningfulAddedLines && !meaningfulRemovedLines) {
    finish(options, { kind: "no-meaningful-changes" });
  }

  const change = formatChangeForAnalysis(extractedChange);

  if (!change) {
    finish(options, { kind: "no-changes" });
  }

  const existingTests = findExistingTests(extractedChange.files);

  const { analyzeChange } = await import("./analysis/analyzer.js");

  const analysis = await analyzeChange(change, {
    files: extractedChange.files,
    existingTests,
  });

  if (analysis.aiAnalysis.isQaraChange) {
    finish(
      options,
      {
        kind: "qara-internal",
        summary: analysis.aiAnalysis.summary,
      },
      analysis,
      analysis.finalDecision,
    );
  }

  finish(
    options,
    {
      kind: "product",
      result: analysis,
      services: analysis.services,
      affectedAreas: analysis.affectedAreas,
      existingTests: analysis.existingTests,
    },
    analysis,
    analysis.finalDecision,
  );
} catch (error) {
  const message =
    error instanceof Error ? error.message : String(error);

  if (options.noFail) {
    finish(options, { kind: "error", message });
  }

  throw error;
}
