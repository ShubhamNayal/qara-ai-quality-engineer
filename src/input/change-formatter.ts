import type { ExtractedChange } from "./change-extractor.js";

export function formatChangeForAnalysis(
  change: ExtractedChange,
): string {
  const sections: string[] = [];

  if (change.files.length > 0) {
    sections.push(
      `Files changed:\n${change.files
        .map((file) => `- ${file}`)
        .join("\n")}`,
    );
  }

  if (change.addedLines.length > 0) {
    sections.push(
      `Added lines:\n${change.addedLines.join("\n")}`,
    );
  }

  if (change.removedLines.length > 0) {
    sections.push(
      `Removed lines:\n${change.removedLines.join("\n")}`,
    );
  }

  if (change.contextLines.length > 0) {
    sections.push(
      `Context:\n${change.contextLines.join("\n")}`,
    );
  }

  return sections.join("\n\n");
}
