import { describe, expect, it } from "vitest";

import { getGitDiff } from "../git-diff.js";

describe("Git Diff Input", () => {
  it("returns the current repository diff", async () => {
    const diff = await getGitDiff("HEAD");

    expect(typeof diff).toBe("string");
  });
});
