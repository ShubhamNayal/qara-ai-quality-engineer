import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";

import { recommendedTestSchema, type RecommendedTest } from "./schema.js";

/**
 * QARA has no database. The list of recommendations still pending for a
 * PR is persisted by embedding it, base64-encoded, in a hidden HTML
 * comment inside the QARA PR comment itself — the one artifact that
 * already survives between CI runs for that PR. See scripts/fetch-pr-state.mjs,
 * which reads it back out before the next analysis run.
 *
 * Keep this marker in sync with the regex in scripts/fetch-pr-state.mjs.
 */
const STATE_MARKER_PREFIX = "<!-- qara-state:";
const STATE_MARKER_SUFFIX = " -->";

export function encodePendingState(tests: RecommendedTest[]): string {
  const payload = Buffer.from(JSON.stringify(tests), "utf8").toString(
    "base64",
  );

  return `${STATE_MARKER_PREFIX}${payload}${STATE_MARKER_SUFFIX}`;
}

/**
 * Loads the previously-pending recommendation list from the JSON file
 * written by scripts/fetch-pr-state.mjs. Missing file, missing path, or
 * invalid/corrupted content all fall back to an empty list rather than
 * failing the run — losing pending-test memory is far cheaper than
 * breaking the bot.
 */
export function loadPreviousPending(
  filePath?: string,
): RecommendedTest[] {
  if (!filePath || !existsSync(filePath)) {
    return [];
  }

  try {
    const raw: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    const parsed = z.array(recommendedTestSchema).safeParse(raw);

    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}
