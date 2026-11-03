---
type: llm
---

PASS if the reply computes HMAC-SHA256 with the verification secret (vs_, from the environment) over the id, a newline, the lower-cased email, and with roles a newline, the roles sorted and comma-joined, a newline and signedAt in unix seconds, outputs lowercase hex, signs on the server only, and shows the browser calling Opem.identify with id, email, roles, signedAt and signature.
FAIL if the secret is used in the browser, the email is not lower-cased, roles are not sorted, signedAt is missing when roles are present, or a different algorithm is used.
