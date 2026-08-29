import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getGitDiff(
  base = "HEAD",
): Promise<string> {
  const { stdout } = await execFileAsync(
    "git",
    ["diff", base, "--"],
    {
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  return stdout.trim();
}
