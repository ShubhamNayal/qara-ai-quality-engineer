import type { ExistingTest } from "../input/existing-tests.js";
import type { RecommendedTest } from "./schema.js";
import {
  isDuplicateRecommendation,
  isRecommendationSatisfied,
} from "./test-matcher.js";

export interface ReconciliationResult {
  /** The recommendation list QARA should now show/persist for this PR. */
  pending: RecommendedTest[];
  /** How many previously-pending recommendations were just satisfied. */
  satisfiedCount: number;
}

/**
 * Combines the recommendations still outstanding from earlier pushes with
 * whatever a fresh analysis pass produced, so that:
 *
 *  - a recommendation the developer has already added a matching test for
 *    is dropped, and never comes back;
 *  - every recommendation still outstanding keeps its exact original
 *    wording — it is never rewritten or reworded between pushes;
 *  - genuinely new recommendations (for new risk introduced later in the
 *    PR) can still be appended, but only if they aren't just a reworded
 *    duplicate of something already pending or already satisfied.
 */
export function reconcileRecommendations(
  previousPending: RecommendedTest[],
  freshRecommendedTests: RecommendedTest[],
  existingTests: ExistingTest[],
): ReconciliationResult {
  const stillPending = previousPending.filter(
    (test) => !isRecommendationSatisfied(test, existingTests),
  );

  const satisfiedCount = previousPending.length - stillPending.length;

  const genuinelyNew = freshRecommendedTests.filter(
    (test) =>
      !isDuplicateRecommendation(test, stillPending) &&
      !isDuplicateRecommendation(test, previousPending),
  );

  return {
    pending: [...stillPending, ...genuinelyNew],
    satisfiedCount,
  };
}
