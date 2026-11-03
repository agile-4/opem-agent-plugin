# Testing a webhook handler

## Offline, with a signed sample

`OPEM_WEBHOOK_SECRET=<a test secret> node scripts/sign-test-delivery.mjs <url>` prints a `curl` command that posts a `request.created` body with `Opem-Signature`, `Opem-Timestamp`, `Opem-Delivery` and `Opem-Event` headers signed with that secret, read from the environment so it never appears in a command. Start the server with the same secret in `OPEM_WEBHOOK_SECRET`, run the command, and the handler should answer `2xx`. Change one character of the body in the command and it should answer `400`.

## Against the real thing

1. Expose the local server with a tunnel (`cloudflared tunnel --url http://localhost:3000`, `ngrok http 3000`, or the one your team uses). The tunnel's `https://` address is the endpoint.
2. On the Configuration page, Webhooks tab, add the endpoint with that URL and the events, copy the `whsec_` secret into the local environment, restart the server.
3. Raise a request in the widget on a page the project allows, or use "Redeliver" on a past delivery in the endpoint's Deliveries log. The log shows the status your server answered and, for a failed attempt, why.

## When verifying fails, in order

1. **The clock.** A timestamp more than five minutes from the server's clock is refused as stale. `date -u` on the server against a time service.
2. **The body.** Pass the bytes exactly as they arrived, before JSON parsing. In Express, `express.raw({ type: "application/json" })` on the route; in Next.js, `await request.text()`.
3. **The secret.** The endpoint's current one, starting `whsec_`; a rotated secret stops the old one at once.
4. **The headers.** Some proxies lowercase or drop custom headers; `verifyWebhook` reads them case-insensitively, but a dropped header fails.
5. **Redirects.** Opem never follows one; a `301` counts as a failure and is retried after 1 minute, 10 minutes, 1 hour, 6 hours and 16 hours.
