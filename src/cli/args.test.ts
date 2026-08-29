import { describe, expect, it } from "vitest";

import { parseArgs } from "./args.js";

describe("CLI Arguments", () => {
  it("uses HEAD as the default base", () => {
    expect(parseArgs([])).toEqual({
      base: "HEAD",
      json: false,
    });
  });

  it("accepts a custom Git base", () => {
    expect(
      parseArgs(["--base", "origin/main"]),
    ).toEqual({
      base: "origin/main",
      json: false,
    });
  });

  it("accepts JSON output", () => {
    expect(parseArgs(["--json"])).toEqual({
      base: "HEAD",
      json: true,
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
});
