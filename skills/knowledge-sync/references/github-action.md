# A GitHub Actions workflow that syncs on every merge

Prune only on the default branch, so a pull request's build adds and updates documents but never removes one. `OPEM_SECRET_KEY` is a repository secret; nothing else is needed.

```yaml
name: Sync docs to Opem

on:
  push:
    branches: [main]
    paths: ["docs/**", "scripts/opem-sync.mjs"]
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - name: Sync the docs directory to Opem
        env:
          OPEM_SECRET_KEY: ${{ secrets.OPEM_SECRET_KEY }}
          DOCS_DIR: docs
        run: node scripts/opem-sync.mjs --prune
```

Notes:

- A sync is idempotent: running it twice changes nothing the second time.
- The script retries `429` and `503` after `Retry-After`; a `403` `plan_limit_reached` means the plan has no management API, or the document cap is reached, and the job should fail loudly rather than loop.
- To sync from another CI, the same two environment variables and `node scripts/opem-sync.mjs --prune` are all it takes.
- Several projects (staging and production): one secret and one job per project, or one job that runs the script twice with different keys and `DOCS_DIR` values.
