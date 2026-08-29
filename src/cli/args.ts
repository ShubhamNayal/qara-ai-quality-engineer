export interface CLIOptions {
  base: string;
  json: boolean;
}

export function parseArgs(
  args: string[],
): CLIOptions {
  let base = "HEAD";
  let json = false;

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

    if (argument === "--help" || argument === "-h") {
      console.log(`
QARA — AI Quality Engineer

Usage:
  npm start
  npm start -- --base origin/main
  npm start -- --json
  npm start -- --base origin/main --json

Options:
  --base <ref>   Git reference to compare against. Default: HEAD
  --json         Output the QARA result as JSON
  --help, -h     Show this help message
`);
      process.exit(0);
    }

    throw new Error(
      `Unknown argument: ${argument}`,
    );
  }

  return {
    base,
    json,
  };
}
