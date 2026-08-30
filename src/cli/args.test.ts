import { describe, expect, it } from "vitest";

import { parseArgs } from "./args.js";

describe("CLI Arguments", () => {
  it("uses HEAD as the default base", () => {
    expect(parseArgs([])).toEqual({
      base: "HEAD",
      json: false,
      markdown: false,
      noFail: false,
    });
  });

  it("accepts a custom Git base", () => {
    expect(
      parseArgs(["--base", "origin/main"]),
    ).toEqual({
      base: "origin/main",
      json: false,
      markdown: false,
      noFail: false,
    });
  });

  it("accepts JSON output", () => {
    expect(parseArgs(["--json"])).toEqual({
      base: "HEAD",
      json: true,
      markdown: false,
      noFail: false,
    });
  });

  it("accepts base and JSON together", () => {
    expect(
      parseArgs([
        "--base",
        "origin/main",
        "--json",
      ]),
    ).toEqual({
      base: "origin/main",
      json: true,
      markdown: false,
      noFail: false,
    });
  });

  it("rejects an unknown argument", () => {
    expect(() =>
      parseArgs(["--something"]),
    ).toThrow("Unknown argument: --something");
  });

  it("rejects a missing base value", () => {
    expect(() =>
      parseArgs(["--base"]),
    ).toThrow("--base requires a Git reference.");
  });

  it("accepts a previous-state-file path", () => {
    expect(
      parseArgs(["--previous-state-file", "qara-previous-state.json"]),
    ).toEqual({
      base: "HEAD",
      json: false,
      markdown: false,
      noFail: false,
      previousStateFile: "qara-previous-state.json",
    });
  });

  it("rejects a missing previous-state-file value", () => {
    expect(() =>
      parseArgs(["--previous-state-file"]),
    ).toThrow("--previous-state-file requires a path.");
  });

  it("accepts markdown comment-bot flags", () => {
    expect(
      parseArgs([
        "--markdown",
        "--no-fail",
        "--comment-file",
        "qara-comment.md",
      ]),
    ).toEqual({
      base: "HEAD",
      json: false,
      markdown: true,
      noFail: true,
      commentFile: "qara-comment.md",
    });
  });
});
