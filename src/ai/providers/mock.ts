import type { AIProvider } from "./types.js";

export class MockAIProvider implements AIProvider {
  async analyze(_change: string): Promise<string> {
    return JSON.stringify({
      riskLevel: "HIGH",
      summary:
        "Bulk contact import introduces data integrity and authorization risks.",
      risks: [
        {
          title: "Duplicate contacts",
          severity: "HIGH",
          reason:
            "Bulk imports may create duplicate contact records if existing contacts are not detected.",
        },
        {
          title: "Malformed CSV data",
          severity: "MEDIUM",
          reason:
            "Invalid or unexpected CSV data could cause failed imports or corrupted contact information.",
        },
        {
          title: "Unauthorized import",
          severity: "CRITICAL",
          reason:
            "An improperly protected bulk import endpoint could allow unauthorized users to create large amounts of data.",
        },
      ],
      recommendedTests: [
        "Import duplicate contacts",
        "Import malformed CSV",
        "Import an unauthorized request",
        "Import an empty CSV",
        "Import a very large CSV",
      ],
    });
  }
}
