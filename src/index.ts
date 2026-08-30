import "dotenv/config";
import { writeFileSync } from "node:fs";

import { getGitDiff } from "./input/git-diff.js";
import { extractChange } from "./input/change-extractor.js";
import { formatChangeForAnalysis } from "./input/change-formatter.js";
import { findExistingTests } from "./input/existing-tests.js";
import { getExitCode } from "./cli/exit-code.js";
import { parseArgs, type CLIOptions } from "./cli/args.js";
import { stripComments } from "./analysis/code-sanitizer.js";
import { loadPreviousPending } from "./analysis/recommendation-state.js";
import { reconcileRecommendations } from "./analysis/recommendation-reconciler.js";
import {
  formatPrComment,
  type PrCommentInput,
} from "./output/pr-comment.js";
import type { QARAResult } from "./analysis/final-result.js";

const options = parseArgs(process.argv.slice(2));
const previousPending = loadPreviousPending(options.previousStateFile);

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

function stripBotMarkers(comment: string): string {
  return comment
    .replace("<!-- qara-qa-bot -->\n", "")
    .replace(/<!-- qara-state:[A-Za-z0-9+/=]*\s*-->\n?/u, "")
    .trim();
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
    console.log(stripBotMarkers(comment));
  }

  process.exit(
    getExitCode(decision ?? "ROUTINE_TESTING", options.noFail),
  );
}

try {
  const diff = await getGitDiff(options.base);
  const extractedChange = extractChange(diff);
  const existingTests = findExistingTests(extractedChange.files);

  const meaningfulAddedLines = stripComments(
    extractedChange.addedLines.join("\n"),
  ).trim();

  const meaningfulRemovedLines = stripComments(
    extractedChange.removedLines.join("\n"),
  ).trim();

  if (!meaningfulAddedLines && !meaningfulRemovedLines) {
    const { pending } = reconcileRecommendations(
      previousPending,
      [],
      existingTests,
    );

    finish(options, {
      kind: "no-meaningful-changes",
      pendingState: pending,
    });
  }

  const change = formatChangeForAnalysis(extractedChange);

  if (!change) {
    const { pending } = reconcileRecommendations(
      previousPending,
      [],
      existingTests,
    );

    finish(options, { kind: "no-changes", pendingState: pending });
  }

  const { analyzeChange } = await import("./analysis/analyzer.js");

  const analysis = await analyzeChange(change, {
    files: extractedChange.files,
    existingTests,
  });

  if (analysis.aiAnalysis.isQaraChange) {
    const { pending } = reconcileRecommendations(
      previousPending,
      [],
      existingTests,
    );

    finish(
      options,
      {
        kind: "qara-internal",
        summary: analysis.aiAnalysis.summary,
        pendingState: pending,
      },
      analysis,
      analysis.finalDecision,
    );
  }

  const { pending, satisfiedCount } = reconcileRecommendations(
    previousPending,
    analysis.aiAnalysis.recommendedTests,
    existingTests,
  );

  finish(
    options,
    {
      kind: "product",
      result: analysis,
      services: analysis.services,
      affectedAreas: analysis.affectedAreas,
      existingTests: analysis.existingTests,
      pendingState: pending,
      newlySatisfiedCount: satisfiedCount,
    },
    analysis,
    analysis.finalDecision,
  );
} catch (error) {
  const message =
    error instanceof Error ? error.message : String(error);

  if (options.noFail) {
    finish(options, {
      kind: "error",
      message,
      pendingState: previousPending,
    });
  }

  throw error;
}
