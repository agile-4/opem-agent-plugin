# A GitHub Actions workflow that syncs on every merge

The workflow runs on every plan with the project's secret key. Prune only on the default branch, so a pull request's build adds and updates documents but never removes one; prune needs Professional or Enterprise, so on Free and Basic drop `--prune` from the last line (a document removed from the repository is then deleted on the Knowledge page). `OPEM_SECRET_KEY` is a repository secret; nothing else is needed.

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
- The script retries `429` and `503` after `Retry-After`; a `403` `plan_limit_reached` means the document cap is reached, or `--prune` was sent on Free or Basic, and the job should fail loudly rather than loop.
- To sync from another CI, the same two environment variables and `node scripts/opem-sync.mjs` (with `--prune` on Professional and Enterprise) are all it takes.
- Several projects (staging and production): one secret and one job per project, or one job that runs the script twice with different keys and `DOCS_DIR` values.
