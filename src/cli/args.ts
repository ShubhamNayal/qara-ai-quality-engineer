export interface CLIOptions {
  base: string;
  json: boolean;
  markdown: boolean;
  noFail: boolean;
  commentFile?: string;
}

export function parseArgs(
  args: string[],
): CLIOptions {
  let base = "HEAD";
  let json = false;
  let markdown = false;
  let noFail = false;
  let commentFile: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--base") {
      const value = args[index + 1];

      if (!value) {
        throw new Error(
          "--base requires a Git reference.",
        );
      }

      base = value;
      index += 1;
      continue;
    }

    if (argument === "--json") {
      json = true;
      continue;
    }

    if (argument === "--markdown") {
      markdown = true;
      continue;
    }

    if (argument === "--no-fail") {
      noFail = true;
      continue;
    }

    if (argument === "--comment-file") {
      const value = args[index + 1];

      if (!value) {
        throw new Error(
          "--comment-file requires a path.",
        );
      }

      commentFile = value;
      index += 1;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      console.log(`
QARA — AI Quality Engineer

Usage:
  npm start
  npm start -- --base origin/main
  npm start -- --json
  npm start -- --markdown --no-fail
  npm start -- --base origin/main --markdown --no-fail --comment-file qara-comment.md

Options:
  --base <ref>            Git reference to compare against. Default: HEAD
  --json                  Output the QARA result as JSON
  --markdown              Output a GitHub PR comment in Markdown
  --no-fail               Always exit 0 (comment-bot mode, do not block the PR)
  --comment-file <path>   Write the PR comment Markdown to a file
  --help, -h              Show this help message
`);
      process.exit(0);
    }

    throw new Error(
      `Unknown argument: ${argument}`,
    );
  }

  if (commentFile) {
    return {
      base,
      json,
      markdown,
      noFail,
      commentFile,
    };
  }

  return {
    base,
    json,
    markdown,
    noFail,
  };
}
