---
type: llm
---

PASS if the handler reads the raw body as text, calls verifyWebhook from @opem/node with the body, the headers and the whsec_ secret from the environment, deduplicates on the event id or says to, answers a 2xx quickly, and branches on event.type === "request.created".
FAIL if it parses the JSON before verifying, hard-codes the secret, skips verification, or invents header names other than Opem-Signature, Opem-Timestamp, Opem-Delivery and Opem-Event.
