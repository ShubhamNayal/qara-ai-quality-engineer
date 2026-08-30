import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  encodePendingState,
  loadPreviousPending,
} from "../recommendation-state.js";
import type { RecommendedTest } from "../schema.js";

const dirs: string[] = [];

function tempFile(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), "qara-state-"));
  dirs.push(dir);
  return join(dir, name);
}

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("encodePendingState", () => {
  it("round-trips through base64 JSON inside an HTML comment", () => {
    const tests: RecommendedTest[] = [
      {
        area: "Refunds",
        priority: "HIGH",
        scenario: "Refund a partially captured payment",
        expectedBehavior: "The remaining authorized amount is released.",
      },
    ];

    const encoded = encodePendingState(tests);

    expect(encoded).toMatch(/^<!-- qara-state:[A-Za-z0-9+/=]+ -->$/u);

    const match = /^<!-- qara-state:([A-Za-z0-9+/=]+) -->$/u.exec(encoded);
    const decoded = JSON.parse(
      Buffer.from(match![1]!, "base64").toString("utf8"),
    );

    expect(decoded).toEqual(tests);
  });
});

describe("loadPreviousPending", () => {
  it("returns an empty list when no path is given", () => {
    expect(loadPreviousPending(undefined)).toEqual([]);
  });

  it("returns an empty list when the file does not exist", () => {
    expect(loadPreviousPending("/nonexistent/path.json")).toEqual([]);
  });

  it("loads a valid JSON array of recommended tests", () => {
    const tests: RecommendedTest[] = [
      {
        area: "Refunds",
        priority: "LOW",
        scenario: "Still outstanding",
        expectedBehavior: "n/a",
      },
    ];

    const path = tempFile("state.json");
    writeFileSync(path, JSON.stringify(tests));

    expect(loadPreviousPending(path)).toEqual(tests);
  });

  it("falls back to an empty list for malformed JSON", () => {
    const path = tempFile("state.json");
    writeFileSync(path, "{ not valid json");

    expect(loadPreviousPending(path)).toEqual([]);
  });

  it("falls back to an empty list when the JSON does not match the schema", () => {
    const path = tempFile("state.json");
    writeFileSync(path, JSON.stringify([{ nope: true }]));

    expect(loadPreviousPending(path)).toEqual([]);
  });
});
