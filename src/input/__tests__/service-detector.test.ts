import { describe, expect, it } from "vitest";

import {
  detectService,
  detectServices,
} from "../service-detector.js";

describe("Service detector", () => {
  it("maps a nested src file to a service folder", () => {
    expect(detectService("src/payments/refund.ts")).toBe(
      "payments",
    );
  });

  it("maps a services/ path to the service name", () => {
    expect(
      detectService("services/auth/login.ts"),
    ).toBe("auth");
  });

  it("maps a packages/ path to the package name", () => {
    expect(
      detectService("packages/billing/src/charge.ts"),
    ).toBe("billing");
  });

  it("ignores root source files without a service folder", () => {
    expect(detectService("src/index.ts")).toBeUndefined();
  });

  it("returns unique sorted service names", () => {
    expect(
      detectServices([
        "src/payments/refund.ts",
        "src/payments/charge.ts",
        "src/auth/session.ts",
        "README.md",
      ]),
    ).toEqual(["auth", "payments"]);
  });
});
