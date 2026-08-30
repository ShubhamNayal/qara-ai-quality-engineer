#!/usr/bin/env node

import { writeFileSync } from "node:fs";

const MARKER = "<!-- qara-qa-bot -->";

// Keep in sync with STATE_MARKER_PREFIX/SUFFIX in
// src/analysis/recommendation-state.ts.
const STATE_PATTERN = /<!-- qara-state:([A-Za-z0-9+/=]*)\s*-->/u;

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const pullNumber = process.env.PR_NUMBER;
const outputFile = process.argv[2];

if (!outputFile) {
  console.error("Usage: fetch-pr-state.mjs <output-file>");
  process.exit(1);
}

function writeEmpty(reason) {
  if (reason) {
    console.log(reason);
  }

  writeFileSync(outputFile, "[]");
  process.exit(0);
}

if (!token || !repository || !pullNumber) {
  writeEmpty(
    "Missing GITHUB_TOKEN, GITHUB_REPOSITORY, or PR_NUMBER; no previous QARA state to fetch.",
  );
}

const [owner, repo] = repository.split("/");

if (!owner || !repo) {
  writeEmpty(`Invalid GITHUB_REPOSITORY: ${repository}`);
}

const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

async function github(path) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "qara-qa-bot",
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `GitHub API GET ${path} failed (${response.status}): ${details}`,
    );
  }

  return response.json();
}

try {
  const comments = await github(`/issues/${pullNumber}/comments`);
  const existing = comments.find(
    (comment) =>
      typeof comment.body === "string" && comment.body.includes(MARKER),
  );

  if (!existing) {
    writeEmpty("No previous QARA comment found; starting with no pending state.");
  }

  const match = STATE_PATTERN.exec(existing.body);

  if (!match || !match[1]) {
    writeEmpty("Previous QARA comment had no recognizable state block.");
  }

  const decoded = Buffer.from(match[1], "base64").toString("utf8");
  const parsed = JSON.parse(decoded);

  if (!Array.isArray(parsed)) {
    writeEmpty("Previous QARA state block was not a JSON array.");
  }

  writeFileSync(outputFile, JSON.stringify(parsed));
  console.log(
    `Loaded ${parsed.length} previously-pending recommendation(s) for PR #${pullNumber}.`,
  );
} catch (error) {
  console.error(
    `Could not fetch previous QARA state: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  writeEmpty();
}
