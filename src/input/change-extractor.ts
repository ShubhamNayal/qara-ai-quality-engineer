export interface ExtractedChange {
  addedLines: string[];
  removedLines: string[];
  contextLines: string[];
  files: string[];
}

export function extractChange(
  diff: string,
): ExtractedChange {
  const addedLines: string[] = [];
  const removedLines: string[] = [];
  const contextLines: string[] = [];
  const files = new Set<string>();

  let currentFile: string | undefined;

  for (const line of diff.split("\n")) {
    if (line.startsWith("+++ b/")) {
      currentFile = line.slice(6);

      if (!files.has(currentFile)) {
        files.add(currentFile);
      }

      continue;
    }

    if (line.startsWith("--- ")) {
      continue;
    }

    if (line.startsWith("diff --git ")) {
      continue;
    }

    if (line.startsWith("@@")) {
      continue;
    }

    if (line.startsWith("+")) {
      addedLines.push(line.slice(1));
      continue;
    }

    if (line.startsWith("-")) {
      removedLines.push(line.slice(1));
      continue;
    }

    if (line.trim() !== "") {
      contextLines.push(line);
    }
  }

  return {
    addedLines,
    removedLines,
    contextLines,
    files: [...files],
  };
}

export function extractAddedLines(
  diff: string,
): string {
  return extractChange(diff).addedLines.join("\n");
}
