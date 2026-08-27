import { describe, expect, it } from "vitest";

import { detectRiskSignals } from "../signal-detector.js";

describe("Risk Signal Detector", () => {
  it("detects write operations", () => {
    const change = `
      Add an endpoint that creates new contacts.
    `;

    const signals = detectRiskSignals(change);

    expect(signals.map((signal) => signal.name)).toContain(
      "write-operation",
    );
  });

  it("detects financial operations", () => {
    const change = `
      Add a refund endpoint for completed payments.
    `;

    const signals = detectRiskSignals(change);

    expect(signals.map((signal) => signal.name)).toContain(
      "financial-operation",
    );
  });

  it("detects bulk operations", () => {
    const change = `
      Users can now bulk import thousands of contacts.
    `;

    const signals = detectRiskSignals(change);

    expect(signals.map((signal) => signal.name)).toContain(
      "bulk-operation",
    );
  });

  it("detects authorization changes", () => {
    const change = `
      Only administrators with the correct permission
      can access the new endpoint.
    `;

    const signals = detectRiskSignals(change);

    expect(signals.map((signal) => signal.name)).toContain(
      "authorization",
    );
  });

  it("returns no signals for a simple UI change", () => {
    const change = `
      Change the color of the submit button.
    `;

    const signals = detectRiskSignals(change);

    expect(signals).toHaveLength(0);
  });
});
