import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

export interface ExistingTest {
  file: string;
  cases: string[];
}

const TEST_FILE_PATTERN =
  /(?:^|\/)(?:__tests__|tests?)\//u;

const TEST_NAME_PATTERN =
  /\.(?:test|spec)\.[cm]?[jt]sx?$/u;

const TEST_CASE_PATTERN =
  /\b(?:it|test|describe)\(\s*(?:`|'|")([^`'"]+)(?:`|'|")/gu;

const MAX_CASES_PER_FILE = 20;
const MAX_TEST_FILES = 15;

export function isTestFile(file: string): boolean {
  const normalized = file.replaceAll("\\", "/");

  return (
    TEST_FILE_PATTERN.test(normalized) ||
    TEST_NAME_PATTERN.test(normalized)
  );
}

export function candidateTestPaths(file: string): string[] {
  const normalized = file.replaceAll("\\", "/");

  if (isTestFile(normalized)) {
    return [normalized];
  }

  const directory = dirname(normalized);
  const name = basename(normalized, extname(normalized));
  const extension = extname(normalized);

  return [
    join(directory, `${name}.test${extension}`),
    join(directory, `${name}.spec${extension}`),
    join(directory, "__tests__", `${name}.test${extension}`),
    join(directory, "__tests__", `${name}.spec${extension}`),
    join(directory, "tests", `${name}.test${extension}`),
    join(directory, "tests", `${name}.spec${extension}`),
  ].map((path) => path.replaceAll("\\", "/"));
}

export function extractTestCases(content: string): string[] {
  const cases: string[] = [];

  for (const match of content.matchAll(TEST_CASE_PATTERN)) {
    const title = match[1]?.trim();

    if (title && !cases.includes(title)) {
      cases.push(title);
    }

    if (cases.length >= MAX_CASES_PER_FILE) {
      break;
    }
  }

  return cases;
}

function siblingTestFiles(file: string, repoRoot: string): string[] {
  const directory = join(repoRoot, dirname(file));

  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .filter((entry) => isTestFile(entry))
    .map((entry) => join(dirname(file), entry).replaceAll("\\", "/"));
}

export function findExistingTests(
  changedFiles: string[],
  repoRoot = process.cwd(),
): ExistingTest[] {
  const files = new Set<string>();

  for (const file of changedFiles) {
    if (isTestFile(file)) {
      files.add(file.replaceAll("\\", "/"));
    }

    for (const candidate of candidateTestPaths(file)) {
      if (existsSync(join(repoRoot, candidate))) {
        files.add(candidate);
      }
    }

    for (const sibling of siblingTestFiles(file, repoRoot)) {
      files.add(sibling);
    }
  }

  const tests: ExistingTest[] = [];

  for (const file of [...files].sort().slice(0, MAX_TEST_FILES)) {
    const absolutePath = join(repoRoot, file);

    if (!existsSync(absolutePath)) {
      continue;
    }

    const cases = extractTestCases(readFileSync(absolutePath, "utf8"));

    tests.push({
      file,
      cases,
    });
  }

  return tests;
}
