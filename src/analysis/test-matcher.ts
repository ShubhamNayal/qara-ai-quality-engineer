import type { ExistingTest } from "../input/existing-tests.js";
import type { RecommendedTest } from "./schema.js";

/**
 * Deterministic (non-AI) similarity heuristic used to decide whether a
 * previously recommended test has effectively been added by the developer,
 * and whether a freshly-generated recommendation duplicates one that is
 * already pending/satisfied. Deliberately simple and predictable rather
 * than exhaustive — see README for the trade-offs.
 */

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for",
  "with", "is", "are", "was", "were", "be", "been", "being", "this",
  "that", "these", "those", "it", "its", "as", "at", "by", "from",
  "should", "shall", "will", "when", "then", "not", "no", "test",
  "tests", "testcase", "testcases", "verify", "verifies", "verified",
  "ensure", "ensures", "check", "checks", "case", "cases",
]);

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.length > 4 && word.endsWith("es") && !word.endsWith("ss")) {
    return word.slice(0, -2);
  }

  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }

  return word;
}

export function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gu, " ")
    .split(/\s+/u)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .map(stem);
}

/**
 * Sørensen–Dice coefficient over the normalized token sets of two strings.
 * 1.0 means identical token sets, 0.0 means no overlap at all.
 */
export function tokenOverlapScore(a: string, b: string): number {
  const tokensA = new Set(normalizeTokens(a));
  const tokensB = new Set(normalizeTokens(b));

  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection += 1;
    }
  }

  return (2 * intersection) / (tokensA.size + tokensB.size);
}

export const SATISFACTION_THRESHOLD = 0.35;

function recommendationText(test: RecommendedTest): string {
  return `${test.area} ${test.scenario} ${test.expectedBehavior}`;
}

/**
 * Has this recommended test effectively been added, based on the test
 * case titles QARA can currently see in the repository (which includes
 * anything the developer just pushed)?
 */
export function isRecommendationSatisfied(
  recommendation: RecommendedTest,
  existingTests: ExistingTest[],
  threshold = SATISFACTION_THRESHOLD,
): boolean {
  const recommendationTokens = recommendationText(recommendation);

  return existingTests.some((test) =>
    test.cases.some(
      (testCase) =>
        tokenOverlapScore(recommendationTokens, testCase) >= threshold,
    ),
  );
}

/**
 * Does `candidate` describe essentially the same test as something already
 * in `against`? Used to stop a fresh AI pass from re-adding (possibly
 * reworded) a recommendation that is already pending or was already
 * satisfied earlier in the PR.
 */
export function isDuplicateRecommendation(
  candidate: RecommendedTest,
  against: RecommendedTest[],
  threshold = SATISFACTION_THRESHOLD,
): boolean {
  const candidateText = recommendationText(candidate);

  return against.some(
    (existing) =>
      tokenOverlapScore(candidateText, recommendationText(existing)) >=
      threshold,
  );
}
