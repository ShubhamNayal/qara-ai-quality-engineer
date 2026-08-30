export function stripComments(text: string): string {
  return text
    // Remove single-line comments
    .replace(/\/\/.*$/gm, "")
    // Remove block comments
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

