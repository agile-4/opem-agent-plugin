# From symptom to cause

1. **Is there a `[Opem]` line in the console?**
   - `origin_not_allowed`: the Origins tab. Fix in the dashboard; verify with `install`'s `verify-config.sh`.
   - `unauthenticated`: the key. Keys tab (or `get_install_snippet`); a rotated key stops the old one at once. A key is valid only on the deployment that issued it, so a key copied from a test or staging dashboard is `unauthenticated` on production: compare the host in the snippet's `src` with the dashboard the key came from.
   - `identity_*`: the signature. `identify` skill.
   - Another code: look it up in `error-codes.md`.
2. **No `[Opem]` line but a Content Security Policy error?** The header lacks a source; `install` skill, `csp.md`. `diagnose.sh <origin> <key> <page url> <base url>` names the missing ones; the base url is the host in the snippet's `src`.
3. **No console output at all and no request to `/config` in the network tab?** The script never ran: the tag is missing from this page's layout, `data-project` was stripped (a tag manager, an iframe), or `init` runs during server rendering. `install` skill, `frameworks.md`.
4. **`/config` is `200` but the panel misbehaves?** A refused option: `init` or `open` was given a value the widget does not accept (an unknown tab, a `page` not starting with `/`); the console names it and the last good value stays. `customise` skill.
5. **A server call fails?** `401`: the secret key (`sk_`) is missing or revoked, or two credentials were sent at once. `403` `plan_limit_reached`: the plan or a cap. `429`: a rate limit. `422`: the body; read `issues`. `knowledge-sync` or `webhooks` skill.
6. **Webhook deliveries fail?** The Deliveries log on the Webhooks tab shows the status and reason; `webhooks` skill, `local-testing.md`.
7. **`verify-config.sh` or `diagnose.sh` says the deployment is protected by Vercel Authentication?** Vercel's login stands in front of that host, so the widget loads there from no origin and the key cannot be checked. Use the production host's snippet, or turn protection off for that domain; it is not a revoked key.
8. **`/config` answers a `5xx` (`verify-config.sh` says "Opem answered 5xx")?** The failure is on Opem's side: it is not the key, the origin or the policy, so change nothing in the install. Quote the request id the script prints to support and retry after a minute.
9. **Everything works locally, not on a deployed host?** Each host is its own origin, including preview hosts; the CSP of the deployed site may differ from the local one.
