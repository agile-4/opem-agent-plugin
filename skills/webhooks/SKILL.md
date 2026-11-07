---
name: webhooks
description: "Use when the developer wants their server told when a request is raised, replied to or closed, or when the assistant answers: Opem webhooks, verifyWebhook from @opem/node, the Opem-Signature header, the whsec_ secret, redelivery, or testing a webhook handler locally."
---

# Receive Opem's webhooks

Opem posts a signed JSON `POST` to the developer's endpoint for five events. The handler verifies the signature, deduplicates on the event id, answers `2xx` quickly and does the work after.

## First: is Opem connected?

Look for the Opem tools (`whoami`, `list_projects`). If the only Opem tool is `authenticate`, call it now and wait for the developer to sign in and consent; then call `whoami`. Only when the server cannot be connected, follow the dashboard path below.

## Before you start

- Webhooks come with Professional and Enterprise. On other plans the Webhooks tab is read-only and nothing is delivered.
- The endpoint must be `https://` on a public address: no localhost, no private networks. For local work, a tunnel (see [local-testing.md](references/local-testing.md)) or the offline signer below.
- The signing secret (`whsec_…`) is shown once, when the endpoint is made. It goes into the server's environment as `OPEM_WEBHOOK_SECRET`, never into code or a chat.

## Steps

0. **Make the endpoint** once its public https URL is known (a deployed host, or a tunnel from [local-testing.md](references/local-testing.md)). `create_webhook` with the URL and the events (optionally disabled) makes it and returns its `whsec_` secret once: write it to the environment file as `OPEM_WEBHOOK_SECRET` in the same step and never echo it. The tool needs the connection's `keys` permission (`whoami` lists it); without it the answer is `forbidden`, and the developer reconnects with `keys` ticked or uses the dashboard below.
1. **Write the handler** from [handler.md](references/handler.md): read the raw body as text, call `verifyWebhook({ body, headers, secret })`, which returns the typed event or throws on a bad signature or a delivery older than five minutes. In Express use `express.raw({ type: "application/json" })` on the route; a framework that parses JSON first changes the bytes that were signed.
2. **Deduplicate.** Keep the handled event ids; a delivery can arrive more than once, and a copy within five minutes verifies too. Return `204` early for one seen before.
3. **Answer fast, work after.** Opem waits ten seconds for a `2xx` and never follows redirects; queue anything slow.
4. **Branch on `event.type`.** The events, what `data` holds, the headers and the retry schedule are in [events.md](references/events.md).
5. **Test offline** with a signed sample delivery:

   ```sh
   OPEM_WEBHOOK_SECRET=whsec_test node scripts/sign-test-delivery.mjs http://localhost:3000/api/opem
   ```

   (In Claude Code the script is at `${CLAUDE_SKILL_DIR}/scripts/sign-test-delivery.mjs`.) It prints a `curl` command with the four headers and a `request.created` body signed with the secret in `OPEM_WEBHOOK_SECRET`, the same variable the handler reads; start the local server with the same test value. Use a made-up test secret here, never the endpoint's real one. Then test the real thing through a tunnel and the dashboard's "Redeliver".
6. **In another language,** compute HMAC-SHA256 with the secret over the `Opem-Timestamp` value, a full stop and the raw body, compare its lowercase hex with the part after `v1=` in constant time, and refuse a timestamp more than five minutes from the clock.

## Without the connection

When the MCP server cannot be connected, or the connection lacks `keys`, the developer adds the endpoint on the Configuration page, Webhooks tab: tell them the URL to enter and which events to tick. The secret is shown once there; they copy it into the server's environment file as `OPEM_WEBHOOK_SECRET` themselves. Steps 1 to 6 are the same.

## When verifying fails

A server clock more than five minutes out; a parsed body instead of the raw one; a rotated secret still in an old environment; a proxy that re-encodes the body. [local-testing.md](references/local-testing.md) has the checks in order.

## References

- [events.md](references/events.md): events, headers, signature, retries and timeouts
- [handler.md](references/handler.md): a verified webhook handler
- [local-testing.md](references/local-testing.md): a tunnel, the offline signer, redelivery, and the checks when verifying fails
