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

- The step runs from the repository root, where the checkout puts the job, and `DOCS_DIR` is relative to it. Each document's path in Opem is its path from the root (`docs/billing/refunds.md`), the path the editor sync and the Knowledge page show, so a document synced from the editor and by the workflow are the same document. The script refuses an absolute `DOCS_DIR`.
- A sync is idempotent: running it twice changes nothing the second time. The log has a line per created or updated document with the title Opem stored (`created docs/billing/refunds.md: "Refunds"`), then the summary.
- The script retries `429` and `503` after `Retry-After`; a `403` `plan_limit_reached` means the document cap is reached, or `--prune` was sent on Free or Basic, and the job should fail loudly rather than loop. A refusal prints one line to the log with the status, the code, the API's own sentence for a 4xx and the request id (`Batch 1 of the sync was refused: 403 plan_limit_reached: This sync would take the account to 24 documents; the plan allows 20 (request req_…)`), and the step exits 1. A 5xx prints its code and request id only.
- Node.js 20 or later runs the script with no warning; `node-version: 22` is a current long-term release.
- To sync from another CI, the same two environment variables and `node scripts/opem-sync.mjs` (with `--prune` on Professional and Enterprise) are all it takes.
- Several projects (staging and production): one secret and one job per project, or one job that runs the script twice with different keys and `DOCS_DIR` values.
