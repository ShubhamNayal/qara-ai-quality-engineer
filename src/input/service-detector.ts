const SOURCE_ROOTS = new Set([
  "src",
  "lib",
  "app",
  "apps",
  "packages",
  "services",
  "backend",
  "frontend",
  "server",
  "internal",
  "pkg",
]);

const IGNORED_SEGMENTS = new Set([
  ".",
  "..",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "__tests__",
  "test",
  "tests",
]);

function normalizePath(file: string): string[] {
  return file
    .replaceAll("\\", "/")
    .replace(/^\.\//, "")
    .split("/")
    .filter((segment) => segment.length > 0);
}

export function detectService(file: string): string | undefined {
  const parts = normalizePath(file);

  if (parts.length === 0) {
    return undefined;
  }

  const directories = parts.slice(0, -1).filter(
    (segment) => !IGNORED_SEGMENTS.has(segment),
  );

  if (directories.length === 0) {
    return undefined;
  }

  if (SOURCE_ROOTS.has(directories[0] ?? "")) {
    return directories[1];
  }

  return directories[0];
}

export function detectServices(files: string[]): string[] {
  const services = new Set<string>();

  for (const file of files) {
    const service = detectService(file);

    if (service) {
      services.add(service);
    }
  }

  return [...services].sort();
}
