import type { ExistingTest } from "../input/existing-tests.js";
import type { QARAResult } from "../analysis/final-result.js";

export const PR_COMMENT_MARKER = "<!-- qara-qa-bot -->";

export type PrCommentInput =
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
    };

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

function formatRecommendedTests(result: QARAResult): string {
  const tests = result.aiAnalysis.recommendedTests;

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

export function formatPrComment(input: PrCommentInput): string {
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
Apart from the current test cases, you should add:

${formatRecommendedTests(input.result)}
`;
}
