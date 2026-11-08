---
type: llm
---

PASS if the reply uses @opem/node's syncDocuments (or the sync script template) with the secret key from a repository secret such as OPEM_SECRET_KEY, triggers on push to main touching docs, prunes only on main, and says pruning needs the Professional or Enterprise plan (on Free and Basic the workflow leaves `--prune` out and the sync still runs).
FAIL if it puts the secret key in the repository or the workflow file, syncs with a publishable key, or prunes on every branch.
