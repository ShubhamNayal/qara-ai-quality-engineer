#!/usr/bin/env node

import { readFileSync } from "node:fs";

const MARKER = "<!-- qara-qa-bot -->";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const pullNumber = process.env.PR_NUMBER;
const commentFile = process.argv[2];

if (!token) {
  console.error("GITHUB_TOKEN is required to post a PR comment.");
  process.exit(1);
}

if (!repository) {
  console.error("GITHUB_REPOSITORY is required to post a PR comment.");
  process.exit(1);
}

if (!pullNumber) {
  console.log("No pull request number; skipping comment.");
  process.exit(0);
}

if (!commentFile) {
  console.error("Usage: post-pr-comment.mjs <comment-file>");
  process.exit(1);
}

const body = readFileSync(commentFile, "utf8").trim();

if (!body) {
  console.log("Comment file is empty; skipping.");
  process.exit(0);
}

const [owner, repo] = repository.split("/");

if (!owner || !repo) {
  console.error(`Invalid GITHUB_REPOSITORY: ${repository}`);
  process.exit(1);
}

const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

async function github(path, method = "GET", payload) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "qara-qa-bot",
      ...(payload ? { "Content-Type": "application/json" } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `GitHub API ${method} ${path} failed (${response.status}): ${details}`,
    );
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

const comments = await github(`/issues/${pullNumber}/comments`);
const existing = comments.find((comment) =>
  typeof comment.body === "string" && comment.body.includes(MARKER),
);

if (existing) {
  await github(`/issues/comments/${existing.id}`, "PATCH", { body });
  console.log(`Updated QARA comment ${existing.id} on PR #${pullNumber}.`);
} else {
  await github(`/issues/${pullNumber}/comments`, "POST", { body });
  console.log(`Posted QARA comment on PR #${pullNumber}.`);
}
