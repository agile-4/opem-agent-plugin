---
type: llm
---

PASS if the reply says it will send the three documents with `sync_knowledge_documents`, by their paths from the repository root (`docs/getting-started.md`, `docs/billing.md`, `docs/faq.md`) and without `prune`, and names the sync script and a CI workflow only as an offer for later, without setting them up.
FAIL if it creates or asks for a secret key, adds a dependency such as `@opem/node`, adds a script or a GitHub Actions workflow to the repository, or switches a project setting the user did not ask for.
