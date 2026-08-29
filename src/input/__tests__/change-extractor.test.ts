import { describe, expect, it } from "vitest";

import { extractChange } from "../change-extractor.js";

describe("Change Extractor", () => {
  it("extracts added lines", () => {
    const diff = `
+const newFeature = true;
`;

    const result = extractChange(diff);

    expect(result.addedLines).toEqual([
      "const newFeature = true;",
    ]);
  });

  it("extracts removed lines", () => {
    const diff = `
-const oldFeature = true;
`;

    const result = extractChange(diff);

    expect(result.removedLines).toEqual([
      "const oldFeature = true;",
    ]);
  });

  it("ignores Git metadata", () => {
    const diff = `
diff --git a/src/index.ts b/src/index.ts
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,3 +1,3 @@
+const change = true;
`;

    const result = extractChange(diff);

    expect(result.addedLines).toEqual([
      "const change = true;",
    ]);

    expect(result.removedLines).toEqual([]);
  });

  it("extracts changed file paths", () => {
    const diff = `
diff --git a/src/index.ts b/src/index.ts
--- a/src/index.ts
+++ b/src/index.ts
@@ -1 +1 @@
+const change = true;
`;

    const result = extractChange(diff);

    expect(result.files).toEqual([
      "src/index.ts",
    ]);
  });

  it("preserves context lines", () => {
    const diff = `
 unchanged line
+new line
 another unchanged line
`;

    const result = extractChange(diff);

    expect(result.contextLines).toContain(
      " unchanged line",
    );

    expect(result.contextLines).toContain(
      " another unchanged line",
    );
  });
});
