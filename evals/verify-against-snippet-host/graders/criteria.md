---
type: llm
---

PASS if the verify command (verify-config.sh, or diagnose.sh with the base url as its fourth argument, or an equivalent curl) carries the base url https://help.example-corp.com taken from the snippet's src, with the origin http://localhost:8080 and the key pk_EXAMPLE.
FAIL if the command calls https://support.opem.app or leaves the base url out so the default host is used, uses an origin other than http://localhost:8080, or asks for a secret key or a verification secret.
