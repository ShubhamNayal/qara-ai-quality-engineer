import { describe, expect, it } from "vitest";
import { classifyChange } from "../classifier.js";

describe("Change Classifier", () => {
  it("classifies a CSV import as data-import", () => {
    const change = `
      A new endpoint allows users to upload CSV files
      and import contacts in bulk.
    `;

    const profile = classifyChange(change);

    expect(profile?.featureType).toBe("data-import");
  });

  it("classifies a refund endpoint as payment", () => {
    const change = `
      A new POST /payments/refund endpoint has been introduced.
      Users can request a refund for a transaction.
    `;

    const profile = classifyChange(change);

    expect(profile?.featureType).toBe("payment");
  });

  it("classifies login functionality as authentication", () => {
    const change = `
      The application now supports login using OAuth.
    `;

    const profile = classifyChange(change);

    expect(profile?.featureType).toBe("authentication");
  });

  it("returns undefined for an unknown change", () => {
    const change = `
      The company logo has been updated.
    `;

    const profile = classifyChange(change);

    expect(profile).toBeUndefined();
  });
});