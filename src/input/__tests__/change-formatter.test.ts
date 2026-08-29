import { describe, expect, it } from "vitest";

import { formatChangeForAnalysis } from "../change-formatter.js";

describe("Change Formatter", () => {
  it("includes changed files", () => {
    const result = formatChangeForAnalysis({
      files: ["src/auth.ts"],
      addedLines: ["return true;"],
      removedLines: [],
      contextLines: [],
    });

    expect(result).toContain("Files changed:");
    expect(result).toContain("- src/auth.ts");
  });

  it("includes added lines", () => {
    const result = formatChangeForAnalysis({
      files: [],
      addedLines: ["const enabled = true;"],
      removedLines: [],
      contextLines: [],
    });

    expect(result).toContain("Added lines:");
    expect(result).toContain("const enabled = true;");
  });

  it("includes removed lines", () => {
    const result = formatChangeForAnalysis({
      files: [],
      addedLines: [],
      removedLines: ["if (user.isAdmin) {"],
      contextLines: [],
    });

    expect(result).toContain("Removed lines:");
    expect(result).toContain(
      "if (user.isAdmin) {",
    );
  });

  it("includes context lines", () => {
    const result = formatChangeForAnalysis({
      files: [],
      addedLines: [],
      removedLines: [],
      contextLines: ["const user = getUser();"],
    });

    expect(result).toContain("Context:");
    expect(result).toContain(
      "const user = getUser();",
    );
  });

  it("does not create empty sections", () => {
    const result = formatChangeForAnalysis({
      files: [],
      addedLines: ["const x = 1;"],
      removedLines: [],
      contextLines: [],
    });

    expect(result).not.toContain("Removed lines:");
    expect(result).not.toContain("Context:");
  });
});
