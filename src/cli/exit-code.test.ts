import { describe, expect, it } from "vitest";

import { getExitCode } from "./exit-code.js";

describe("CLI Exit Code", () => {
  it("returns 0 for routine testing", () => {
    expect(getExitCode("ROUTINE_TESTING")).toBe(0);
  });

  it("returns 0 when testing is recommended", () => {
    expect(getExitCode("TESTING_RECOMMENDED")).toBe(0);
  });

  it("returns 1 when testing is required", () => {
    expect(getExitCode("MUST_TEST")).toBe(1);
  });

  it("returns 1 when testing is required before release", () => {
    expect(
      getExitCode("MUST_TEST_BEFORE_RELEASE"),
    ).toBe(1);
  });

  it("returns 0 for every decision in comment-bot mode", () => {
    expect(getExitCode("MUST_TEST", true)).toBe(0);
    expect(
      getExitCode("MUST_TEST_BEFORE_RELEASE", true),
    ).toBe(0);
  });
});
