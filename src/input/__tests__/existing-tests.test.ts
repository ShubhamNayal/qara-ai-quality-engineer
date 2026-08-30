import { describe, expect, it } from "vitest";

import {
  candidateTestPaths,
  extractTestCases,
  isTestFile,
} from "../existing-tests.js";

describe("Existing tests", () => {
  it("recognizes common test file paths", () => {
    expect(isTestFile("src/payments/refund.test.ts")).toBe(
      true,
    );
    expect(isTestFile("src/payments/refund.spec.ts")).toBe(
      true,
    );
    expect(
      isTestFile("src/payments/__tests__/refund.test.ts"),
    ).toBe(true);
    expect(isTestFile("src/payments/refund.ts")).toBe(false);
  });

  it("suggests companion test paths for a source file", () => {
    const candidates = candidateTestPaths(
      "src/payments/refund.ts",
    );

    expect(candidates).toContain("src/payments/refund.test.ts");
    expect(candidates).toContain(
      "src/payments/__tests__/refund.test.ts",
    );
  });

  it("extracts it/test/describe titles", () => {
    const content = `
describe("Refunds", () => {
  it("refunds a successful charge", () => {});
  test("rejects an expired card", () => {});
});
`;

    expect(extractTestCases(content)).toEqual([
      "Refunds",
      "refunds a successful charge",
      "rejects an expired card",
    ]);
  });
});
