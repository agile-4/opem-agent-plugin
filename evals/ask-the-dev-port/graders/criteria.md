---
type: llm
---

PASS if the local origin the reply adds (with `add_allowed_origin` or on the Origins tab) is exactly http://localhost:3001, the production origin is https://app.example.com, and neither carries a path.
FAIL if it adds http://localhost:3000 as the local origin, adds an origin with a path, or asks for a secret key or a verification secret.
