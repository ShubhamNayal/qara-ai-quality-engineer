import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getGitDiff(
  base = "HEAD",
): Promise<string> {
  const diffArgs =
    base === "HEAD"
      ? ["diff", "HEAD", "--"]
      : ["diff", `${base}...HEAD`, "--"];

  const { stdout } = await execFileAsync(
    "git",
    diffArgs,
    {
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  return stdout.trim();
}
