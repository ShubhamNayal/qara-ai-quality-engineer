# QARA

QARA is a GitHub Action that comments on **product** pull requests. It does not block merge.

On each PR open or update it reports:

- which **services** changed
- which **areas** are affected
- which **tests already exist** near those changes
- which **additional tests** should be added

It skips QARA's own repository changes. Use it on the product repo.

## Recommendations persist across pushes

QARA remembers what it already recommended for a PR. On the next push:

- any recommended test whose scenario is now matched by a real test case in
  the repo (a title QARA can see near the changed files) is dropped —
  it won't come back, even reworded.
- every recommendation still outstanding keeps its **exact original
  wording** — QARA never regenerates or rephrases a pending recommendation.
- genuinely new recommendations can still be appended if later commits in
  the same PR introduce new, not-yet-covered risk.

So if QARA recommends 5 tests and the next push adds 2 of them, the comment
updates to show only the 3 that are still outstanding — the wording for
those 3 does not change.

This state is stored in a hidden block inside the QARA PR comment itself
(no external storage needed), and is reconciled using a deterministic
text-similarity match between a recommendation's scenario and the test
case titles QARA finds in the repo — not an extra AI call.

## Add it to a product

Create `.github/workflows/qara.yml` in the product repository:

```yaml
name: QARA QA Bot

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  qara:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: ShubhamNayal/qara-ai-quality-engineer@main
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Add `ANTHROPIC_API_KEY` as a repository secret.

The bot updates a single PR comment on every push instead of leaving a new comment each time.

## Local

```bash
npm start -- --base origin/main --markdown --no-fail
```

To exercise the persisted-recommendation behavior locally, pass a JSON
file of previously-recommended tests:

```bash
npm start -- --base origin/main --markdown --no-fail \
  --previous-state-file qara-previous-state.json
```
