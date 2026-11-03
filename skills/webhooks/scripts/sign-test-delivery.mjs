#!/usr/bin/env node
// Prints a curl command that posts a signed sample Opem webhook delivery to a local handler, so the
// handler can be tested without a public endpoint. The signature is v1= and the lowercase hex
// HMAC-SHA256, with the endpoint's secret, of "<timestamp>.<raw body>", as Opem computes it.
//
//   OPEM_WEBHOOK_SECRET=whsec_test node sign-test-delivery.mjs <url> [event type]
//
// The secret comes from the environment, the same variable the handler reads, never from the
// command line.
import { createHmac, randomUUID } from "node:crypto";

const [url, type = "request.created"] = process.argv.slice(2);
const secret = process.env.OPEM_WEBHOOK_SECRET;
if (!url || !secret) {
  console.error("usage: OPEM_WEBHOOK_SECRET=whsec_… sign-test-delivery.mjs <url> [event type]");
  process.exit(2);
}

const now = new Date();
const body = JSON.stringify({
  id: randomUUID(),
  type,
  createdAt: now.toISOString(),
  projectId: "0199f000-0000-7000-8000-000000000001",
  data: {
    // Every field a request carries in a delivery (OpemWebhookRequest in @opem/node), so a handler
    // typed against the event reads real values during the offline test.
    request: {
      id: randomUUID(),
      reference: "TEST-1",
      kind: "problem",
      blocking: false,
      status: "sent",
      message: "A sample delivery from sign-test-delivery.mjs.",
      pageUrl: "https://app.example.com/reports",
      createdAt: now.toISOString(),
      endUser: {
        id: randomUUID(),
        kind: "identified",
        externalId: "user_42",
        email: "jane@example.com",
        name: "Jane",
      },
    },
  },
});
const timestamp = Math.floor(now.getTime() / 1000);
const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest("hex");

const quote = (text) => `'${text.replace(/'/g, `'\\''`)}'`;
console.log(
  [
    "curl -sS -X POST",
    `-H 'Content-Type: application/json'`,
    `-H 'Opem-Signature: v1=${signature}'`,
    `-H 'Opem-Timestamp: ${timestamp}'`,
    `-H 'Opem-Delivery: ${randomUUID()}'`,
    `-H 'Opem-Event: ${type}'`,
    `--data-raw ${quote(body)}`,
    quote(url),
  ].join(" \\\n  "),
);
