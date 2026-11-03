---
name: troubleshoot
description: "Use when something is wrong with an Opem install: the widget does not load or appear, a console line starting [Opem], a 401, 403 or 429 from the API, origin_not_allowed, identity_signature_invalid, plan_limit_reached, rate_limited, a Content-Security-Policy error, or a documentation sync that was refused."
---

# Troubleshoot an Opem install

Start from the symptom, find the code, apply the fix, and hand over to the skill that owns the area. The codes and their statuses are in [error-codes.md](references/error-codes.md); the decision tree in [decision-tree.md](references/decision-tree.md) goes from symptom to cause.

## First look

1. **The browser console.** Opem writes one line starting `[Opem]` with the refusal's code; a Content Security Policy error names the blocked source instead.
2. **The network tab.** The request to `/api/v1/widget/config` carries the answer: `200` means the widget loaded; `403` `origin_not_allowed`; `401` `unauthenticated`.
3. **Run the diagnosis** for the page's origin and the key, optionally with the page's URL to check its Content-Security-Policy header:

   ```sh
   bash scripts/diagnose.sh http://localhost:3000 pk_live_… https://app.example.com/
   ```

   (In Claude Code the script is at `${CLAUDE_SKILL_DIR}/scripts/diagnose.sh`.) It calls `/config` as the widget does and lists which of the five policy sources the page's header is missing.

## The usual causes

| Symptom | Cause | Fix |
|---|---|---|
| No Help button, console `origin_not_allowed` | The page's origin is not on the Configuration page's Origins tab | Add scheme, host and port; `http://localhost:3000` counts as its own origin |
| No Help button, console `unauthenticated` | The key is another project's, or revoked | Copy the current `pk_` from the Keys tab |
| No Help button, a CSP error | `script-src` lacks `https://support.opem.app` | Add the five sources (`install` skill) |
| Button shows, nothing works, falls back to the default look | `connect-src` lacks `https://support.opem.app` | Same |
| Screenshots fail | `connect-src` lacks `https://vercel.com` | Same |
| Replies take 30 seconds while the panel is open | `connect-src` lacks `wss://ws-eu.pusher.com` | Same, or accept polling |
| Logo or screenshots missing | `img-src` lacks `blob:` | Same |
| Console `identity_signature_invalid` or `_required` | Signed on the wrong string, or unsigned on a paid plan | `identify` skill; `check-signature.mjs --vectors` |
| `403` `plan_limit_reached` on a sync or a webhook | The plan has no management API, or a cap is reached | [plan-limits.md](references/plan-limits.md); upgrade or wait for the month |
| `429` `rate_limited` | Over a limit in [rate-limits.md](references/rate-limits.md) | Wait for `Retry-After`; batch sync calls; do not poll, use webhooks |
| `422` `validation_failed` | A field breaks the rules; unknown fields are refused, not ignored | Read `issues[].path` |
| Widget loads on production, not on a preview host | Each host is its own origin | Add the preview origin, or use a wildcard-free list of the hosts you deploy to |

## References

- [error-codes.md](references/error-codes.md): every error code with its status, and the help article that explains them
- [rate-limits.md](references/rate-limits.md): every rate limit and what it counts
- [plan-limits.md](references/plan-limits.md): the plan matrix: prices, limits and entitlements
- [decision-tree.md](references/decision-tree.md): from symptom to cause to the skill that fixes it
