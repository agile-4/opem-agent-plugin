---
name: troubleshoot
description: "Use when something is wrong with an Opem install: the widget does not load or appear, a console line starting [Opem], a 401, 403 or 429 from the API, origin_not_allowed, identity_signature_invalid, plan_limit_reached, rate_limited, a Content-Security-Policy error, or a documentation sync that was refused."
---

# Troubleshoot an Opem install

Start from the symptom, find the code, apply the fix, and hand over to the skill that owns the area. The codes and their statuses are in [error-codes.md](references/error-codes.md); the decision tree in [decision-tree.md](references/decision-tree.md) goes from symptom to cause.

## First: is Opem connected?

Look for the Opem tools (`whoami`, `list_projects`). If the only Opem tool is `authenticate`, call it now and wait for the developer to sign in and consent; then call `whoami`. Only when the server cannot be connected, follow the dashboard path below.

## Stop at the chosen step

Do the steps the developer chose (their answers to the how-far questions the `onboard` and `install` skills ask, or what they asked for) and no further. When the next step would add a dependency, a file to the repository, a key, a workflow or a switch they did not ask for, name it as the next offer and stop. If nothing has been chosen yet, ask before the first such step.

## Steps

1. **Ask Opem what it sees.** `get_install_status` for the project: `allowedOrigins` against the page's origin, and `lastSeenAt` and `lastSeenOrigin` (null means no page has loaded the widget yet with an allowed origin and a live key). `get_install_snippet` gives the current publishable key and `scriptOrigin`, the host the page's snippet must name; `get_plan` explains a `plan_limit_reached`. A missing origin is `add_allowed_origin`; repeat the returned `allowedOrigins` to the developer.
2. **The browser console.** Opem writes one line starting `[Opem]` with the refusal's code; a Content Security Policy error names the blocked source instead.
3. **The network tab.** The request to `/api/v1/widget/config` carries the answer: `200` means the widget loaded; `403` `origin_not_allowed`; `401` `unauthenticated`.
4. **Run the diagnosis** for the page's origin and the key, optionally with the page's URL to check its Content-Security-Policy header, and the base url:

   ```sh
   bash scripts/diagnose.sh http://localhost:3001 pk_… https://app.example.com/ https://support.opem.app
   ```

   (In Claude Code the script is at `${CLAUDE_SKILL_DIR}/scripts/diagnose.sh`.) The fourth argument, the base url, is `scriptOrigin` from `get_install_snippet`, or the scheme and host in the `src` of the snippet the developer pasted. The examples say `https://support.opem.app`; use the host in your snippet when it differs. Pass `""` as the page url to check `/config` alone. It calls `/config` as the widget does, without counting as a page load, and lists which of the five policy sources the page's header is missing. "Protected by Vercel Authentication" means that deployment is walled off: nothing loads there from any origin and the key cannot be checked.

## Without the connection

When the MCP server cannot be connected, the same facts are in the dashboard: the allowed origins on the Configuration page's Origins tab, the publishable key on its Keys tab, and "Seen from <origin>" and the snippet on the Widget page's Install tab. Ask the developer to read them out (the publishable key is public; never ask for a secret), then follow steps 2 to 4.

## The usual causes

`https://support.opem.app` below stands for the host in the snippet's `src`.

| Symptom | Cause | Fix |
|---|---|---|
| No Help button, console `origin_not_allowed` | The page's origin is not on the Configuration page's Origins tab | Add scheme, host and port (`add_allowed_origin`, or the Origins tab); each port counts, so `http://localhost:3001` is not `http://localhost:3000` |
| No Help button, console `unauthenticated` | The key is another project's, revoked, or from another deployment (a key is valid only on the deployment that issued it) | The current `pk_` from `get_install_snippet` or the Keys tab of the dashboard the snippet's host belongs to |
| `verify-config.sh` says "protected by Vercel Authentication" | The deployment is behind Vercel's login, so the widget loads from no origin | Use the production host's snippet, or turn protection off for that domain |
| No Help button, a CSP error | `script-src` lacks `https://support.opem.app` | Add the five sources (`install` skill) |
| Button shows, nothing works, falls back to the default look | `connect-src` lacks `https://support.opem.app` | Same |
| Screenshots fail | `connect-src` lacks `https://vercel.com` | Same |
| Replies take 30 seconds while the panel is open | `connect-src` lacks `wss://ws-eu.pusher.com` | Same, or accept polling |
| Logo or screenshots missing | `img-src` lacks `blob:` | Same |
| Console `identity_signature_invalid` or `_required` | Signed on the wrong string, or unsigned where the project's "Require signed identities" switch is on | `identify` skill; `check-signature.mjs --vectors` |
| `403` `plan_limit_reached` on a sync or a webhook | The plan has no management API, or a cap is reached | [plan-limits.md](references/plan-limits.md); upgrade or wait for the month |
| Ask answers `503`, the widget says "The assistant is not available right now", or the Ask tab is missing | The assistant cannot answer: `assistant_not_set_up`; the reason is in `get_install_status`'s `assistantReason` (and in the test console's message), never in the widget's 503 | `platform_key_missing`: Opem's model key is not configured on that deployment; only its operator sets it, so answer with the project's own key meanwhile. `own_key_missing` or `own_key_unreadable`: add or test the key again on the project's Assistant page. `mock_not_allowed`: the test model on a production project; choose another key there. Nothing in the install changes it |
| `verify-config.sh` says "Opem answered 5xx" | A failure on Opem's side; it is not the key, the origin or the policy | Change nothing in the install; quote the request id to support and retry after a minute |
| `429` `rate_limited` | Over a limit in [rate-limits.md](references/rate-limits.md) | Wait for `Retry-After`; batch sync calls; do not poll, use webhooks |
| `422` `validation_failed` | A field breaks the rules; unknown fields are refused, not ignored | Read `issues[].path` |
| Widget loads on production, not on a preview host | Each host is its own origin | Add the preview origin, or use a wildcard-free list of the hosts you deploy to |

## References

- [error-codes.md](references/error-codes.md): every error code with its status, and the help article that explains them
- [rate-limits.md](references/rate-limits.md): every rate limit and what it counts
- [plan-limits.md](references/plan-limits.md): the plan matrix: prices, limits and entitlements
- [decision-tree.md](references/decision-tree.md): from symptom to cause to the skill that fixes it
