import type { ExistingTest } from "../input/existing-tests.js";
import type { QARAResult } from "../analysis/final-result.js";
import type { RecommendedTest } from "../analysis/schema.js";
import { encodePendingState } from "../analysis/recommendation-state.js";

export const PR_COMMENT_MARKER = "<!-- qara-qa-bot -->";

export type PrCommentInput = {
  /**
   * The recommendation list QARA should keep tracking for this PR after
   * this run — already reconciled against what the developer has added
   * so far. Persisted (hidden) in every comment variant so it survives
   * to the next push, even for kinds that don't display it.
   */
  pendingState: RecommendedTest[];
} & (
  | {
      kind: "no-changes";
    }
  | {
      kind: "no-meaningful-changes";
    }
  | {
      kind: "error";
      message: string;
    }
  | {
      kind: "qara-internal";
      summary: string;
    }
  | {
      kind: "product";
      result: QARAResult;
      services: string[];
      affectedAreas: string[];
      existingTests: ExistingTest[];
      /** How many previously-pending recommendations this push satisfied. */
      newlySatisfiedCount: number;
    }
);

function bulletList(items: string[]): string {
  return items.map((item) => `- **${item}**`).join("\n");
}

function formatExistingTests(tests: ExistingTest[]): string {
  if (tests.length === 0) {
    return "_No existing tests were found next to the changed files._";
  }

  return tests
    .map((test) => {
      if (test.cases.length === 0) {
        return `- \`${test.file}\``;
      }

      const cases = test.cases
        .map((testCase) => `\`${testCase}\``)
        .join("; ");

      return `- \`${test.file}\` — ${cases}`;
    })
    .join("\n");
}

function formatRecommendedTests(tests: RecommendedTest[]): string {
  if (tests.length === 0) {
    return "Existing coverage looks sufficient for this change. No additional regression tests recommended.";
  }

  return tests
    .map((test, index) => {
      return [
        `${index + 1}. **[${test.priority}] ${test.area}** — ${test.scenario}`,
        `   - Expected: ${test.expectedBehavior}`,
      ].join("\n");
    })
    .join("\n\n");
}

function buildCommentBody(input: PrCommentInput): string {
  if (input.kind === "no-changes") {
    return `${PR_COMMENT_MARKER}
## QARA QA Review

No Git changes were detected in this pull request.
`;
  }

  if (input.kind === "no-meaningful-changes") {
    return `${PR_COMMENT_MARKER}
## QARA QA Review

No meaningful product code changes were detected. Comment-only or formatting-only diffs do not need extra QA coverage.
`;
  }

  if (input.kind === "error") {
    return `${PR_COMMENT_MARKER}
## QARA QA Review

QARA could not finish analysis for this pull request.

\`${input.message}\`
`;
  }

  if (input.kind === "qara-internal") {
    return `${PR_COMMENT_MARKER}
## QARA QA Review

Skipped: this pull request changes QARA itself, not a product.

${input.summary}

QARA comments on product PRs with affected services, areas, and additional tests to add.
`;
  }

  const services =
    input.services.length > 0
      ? bulletList(input.services)
      : "- _Could not map changed files to named services._";

  const affectedAreas =
    input.affectedAreas.length > 0
      ? bulletList(input.affectedAreas)
      : "- _No high-risk product areas matched this change._";

  const satisfiedNote =
    input.newlySatisfiedCount > 0
      ? `✅ ${input.newlySatisfiedCount} previously recommended test${
          input.newlySatisfiedCount === 1 ? "" : "s"
        } added in this push.\n\n`
      : "";

  return `${PR_COMMENT_MARKER}
## QARA QA Review

${input.result.aiAnalysis.summary}

### This PR contains changes on
${services}

### Affected areas
${affectedAreas}

### Current tests considered
${formatExistingTests(input.existingTests)}

### Additional tests to add
${satisfiedNote}Apart from the current test cases, you should add:

${formatRecommendedTests(input.pendingState)}
`;
}

export function formatPrComment(input: PrCommentInput): string {
  const body = buildCommentBody(input);

  return `${body}\n${encodePendingState(input.pendingState)}\n`;
}
