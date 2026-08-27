import { describe, expect, it } from "vitest";
import { classifyChange } from "../classifier.js";

describe("Change Classifier", () => {
  it("classifies a CSV import as data-import", () => {
    const change = `
      A new endpoint allows users to upload CSV files
      and import contacts in bulk.
    `;

    const result = classifyChange(change);

    expect(result.profiles).toHaveLength(1);
    expect(result.profiles[0]?.featureType).toBe(
      "data-import",
    );
  });

  it("classifies a refund endpoint as payment", () => {
    const change = `
      A new POST /payments/refund endpoint has been introduced.
      Users can request a refund for a transaction.
    `;

    const result = classifyChange(change);

    expect(result.profiles).toHaveLength(1);
    expect(result.profiles[0]?.featureType).toBe(
      "payment",
    );
  });

  it("classifies login functionality as authentication", () => {
    const change = `
      The application now supports login using OAuth.
    `;

    const result = classifyChange(change);

    expect(result.profiles).toHaveLength(1);
    expect(result.profiles[0]?.featureType).toBe(
      "authentication",
    );
  });

  it("returns no profiles for an unknown change", () => {
    const change = `
      The company logo has been updated.
    `;

    const result = classifyChange(change);

    expect(result.profiles).toHaveLength(0);
    expect(result.categories).toHaveLength(0);
  });

  it("detects multiple risk profiles", () => {
    const change = `
      Add OAuth authentication to the payment refund flow.
    `;

    const result = classifyChange(change);

    const featureTypes = result.profiles.map(
      (profile) => profile.featureType,
    );

    expect(featureTypes).toContain("payment");
    expect(featureTypes).toContain("authentication");
  });

  it("combines risk categories from multiple profiles", () => {
    const change = `
      Add OAuth authentication to the payment refund flow.
    `;

    const result = classifyChange(change);

    expect(result.categories).toContain("FINANCIAL");
    expect(result.categories).toContain("SECURITY");
    expect(result.categories).toContain("AUTHORIZATION");
  });

    it("assigns a high risk score to payment changes", () => {
    const change = `
      Introduce a new payment refund endpoint.
    `;

    const result = classifyChange(change);

    expect(result.riskScore).toBe(85);
  });

  it("assigns a high risk score to authentication changes", () => {
    const change = `
      Add OAuth login to the application.
    `;

    const result = classifyChange(change);

    expect(result.riskScore).toBe(80);
  });

  it("uses the highest risk profile for multiple profiles", () => {
    const change = `
      Add OAuth authentication to the payment refund flow.
    `;

    const result = classifyChange(change);

    expect(result.riskScore).toBe(85);
  });

  it("assigns zero risk when no profile matches", () => {
    const change = `
      Update the company logo
    `;

    const result = classifyChange(change);

    expect(result.riskScore).toBe(0);
  });

});