---
name: reference
description: "Background knowledge about Opem for the other skills: every management API operation, the widget's public surface, the plans and their limits, rate limits and a glossary of Opem's terms. Read it when another skill does not cover a call or a limit."
---

# Opem reference

The facts the other skills look up, generated from Opem's own sources so they match the running product. Each file starts with the source it was rendered from.

- **The management API** ([management-api.md](references/management-api.md)): every operation under `/api/v1/manage/` with its parameters, body, responses and error codes. Server-to-server, `Authorization: Bearer sk_…`, Professional and Enterprise, 120 calls a minute per key. The live document is `https://support.opem.app/api/openapi.json`.
- **Plans and limits** ([plans.md](references/plans.md)): prices, caps and entitlements for Free, Basic, Professional and Enterprise, from the one file that defines them.
- **Rate limits** ([limits.md](references/limits.md)): every limit and what it counts; `429` `rate_limited` with `Retry-After`.
- **Glossary** ([glossary.md](references/glossary.md)): Opem's words, one line each.

The widget's surface is in the `customise` skill (`window-opem.md`), the error codes in `troubleshoot` (`error-codes.md`), the snippets in `install`, `identify`, `knowledge-sync` and `webhooks`.

## References

- [management-api.md](references/management-api.md): every management API operation, with its parameters, body, responses and error codes
- [plans.md](references/plans.md): the plan matrix: prices, limits and entitlements
- [limits.md](references/limits.md): rate limits
- [glossary.md](references/glossary.md): Opem's terms, one line each
