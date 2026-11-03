---
name: identify
description: "Use when the developer wants Opem to know who the signed-in user is: Opem.identify, HMAC signing, the verification secret (vs_), roles and signedAt, the errors identity_required, identity_signature_required or identity_signature_invalid, or a signing sample in Node.js, Python, Ruby, PHP or Go."
---

# Tell the widget who the person is

After the person signs in to the developer's app, the page calls `Opem.identify()` with the app's own id for them and, if known, their email. Opem then keeps one record per id in the project, so the person sees the same requests on every device. Anyone can type `Opem.identify()` into a console, so Opem trusts an identity only when the developer's server has signed it with the project's verification secret.

## Rules that decide the shape

- **Where the signature is made:** on the server, never in the browser. The verification secret starts with `vs_` and lives on the Configuration page, Identity tab. It belongs in the server's environment (`OPEM_VERIFICATION_SECRET`), never in code, the repository or a chat.
- **When a signature is required:** always on Basic, Professional and Enterprise; on Free it is a toggle on the Identity tab, off by default, and the widget treats an unsigned identity as given. See [verification-toggle.md](references/verification-toggle.md).
- **What is signed:** HMAC-SHA256 over the id, a newline and the email in lower case (nothing after the newline without an email); with roles, two more lines, the roles sorted and comma-joined, then `signedAt`. Lowercase hex. [canonical-string.md](references/canonical-string.md) has the exact string and worked examples.
- **Roles lapse a day after `signedAt`,** so sign on each page render, not once at sign-in. An identity without roles has no `signedAt` and does not lapse.

## Steps

1. **Server:** add a signing function with `signIdentity` from `@opem/node`, or the sample for the server's language in [signing.md](references/signing.md). Read the secret from the environment. Return `signature` (and `signedAt` when roles are sent) to the page, for example as data rendered into the HTML or from an endpoint only signed-in users can call.
2. **Browser:** call `Opem.identify({ id, email, name, roles, signedAt, signature })` once the widget has loaded and the person is signed in; call `Opem.reset()` when they sign out. The browser sample is in [signing.md](references/signing.md).
3. **Check:** load a page signed in. A refused identity shows `[Opem] The identity passed to identify() was refused (<code>)` in the console and the widget carries on as an anonymous visitor where the project allows them. The three codes are in [errors.md](references/errors.md).
4. **Prove the signing code** with the known-answer vectors before blaming the secret:

   ```sh
   node scripts/check-signature.mjs --vectors
   OPEM_VERIFICATION_SECRET=vs_test_secret node scripts/check-signature.mjs user-1 Jane@Example.COM owner,billing 1793318400
   ```

   (In Claude Code the script is at `${CLAUDE_SKILL_DIR}/scripts/check-signature.mjs`.) The second form prints the canonical string and the signature for any inputs, so the developer can compare their server's output line by line. It reads the secret from the environment, never from the command line; with the real secret, export it in the developer's shell or run the script from the server's environment rather than typing it into a command.

## Common mistakes

Signing in the browser; lower-casing the email on one side only; sorting roles on one side only; sending `roles` without `signedAt`; a server clock more than five minutes fast; a rotated secret still in an old environment.

## References

- [signing.md](references/signing.md): signing an identity in Node.js, Python, Ruby, PHP and Go, and passing it from the browser
- [canonical-string.md](references/canonical-string.md): the exact string that is signed, with worked examples
- [verification-toggle.md](references/verification-toggle.md): when a signature is required, by plan
- [errors.md](references/errors.md): the three `identity_*` error codes and their causes
- [identity-vectors.json](references/identity-vectors.json): known-answer test vectors for the signature
