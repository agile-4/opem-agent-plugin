# When a signature is required

| Plan | Identity verification |
|---|---|
| Free | A toggle on the Configuration page, Identity tab, off by default. While off, `Opem.identify()` without a signature is accepted, and the dashboard shows a persistent warning beside the toggle. |
| Basic, Professional, Enterprise | Required. Every identified widget call must carry a valid signature; an unsigned one is refused with `identity_signature_required`. |

The moment a project's plan becomes paid, unsigned identified calls start being refused, so build the signing in before upgrading. Anonymous visitors (no `identify()` at all) are a separate project setting, "Anonymous visitors", on the Widget page's Features tab; a project may require identity and refuse anonymous visitors, in which case a page that never calls `identify()` gets `identity_required`.

Roles count only when the signature verifies; an unsigned identity on Free counts as having no roles, so documents tagged by role stay hidden from it.
