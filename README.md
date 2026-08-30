# QARA

QARA is a GitHub Action that comments on **product** pull requests. It does not block merge.

On each PR open or update it reports:

- which **services** changed
- which **areas** are affected
- which **tests already exist** near those changes
- which **additional tests** should be added

It skips QARA's own repository changes. Use it on the product repo.

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
