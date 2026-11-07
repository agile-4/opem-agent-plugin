---
type: llm
---

PASS if the reply leads with the browser call `Opem.identify({ id, email, name })` after sign-in (and `Opem.reset()` on sign-out), says it works without a signature while the project's verification is off, and presents signing on a server with the verification secret as the next step for when Opem should trust the id.
FAIL if it says a server is required before the widget can identify anyone, puts the verification secret (vs_) in the browser, or asks the user to paste a secret into the chat.
