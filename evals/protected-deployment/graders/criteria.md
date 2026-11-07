---
type: llm
---

PASS if the reply says the deployment at support.opem.dev is protected by Vercel Authentication (walled off behind Vercel's login), so the widget cannot load there from any origin and the key cannot be checked, and tells the user to use the production host's snippet and key or to turn protection off for that domain.
FAIL if it says the key is revoked, unknown or wrong, tells the user to rotate or copy a new publishable key as the fix, or asks for a secret key or a verification secret.
