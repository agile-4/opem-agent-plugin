---
name: identify
description: "Use when the developer wants Opem to know who the signed-in user is: Opem.identify and Opem.reset, unverified people in the inbox, HMAC signing, the verification secret (vs_), the Require signed identities switch, roles and signedAt, the errors identity_required, identity_signature_required or identity_signature_invalid, or a signing sample in Node.js, Python, Ruby, PHP, Go, C# or Java."
---

# Tell the widget who the person is

After the person signs in to the developer's app, the page calls `Opem.identify()` with the app's own id for them and, if known, their email and name. Opem then keeps one record per id in the project, so the person sees the same requests on every device. That one browser call is all a first install needs, on every plan. Anyone can type `Opem.identify()` into a console, though, so Opem marks an unsigned person unverified, and trusts an identity only when the developer's server has signed it with the project's verification secret.

## First: is Opem connected?

Look for the Opem tools (`whoami`, `list_projects`). If the only Opem tool is `authenticate`, call it now and wait for the developer to sign in and consent; then call `whoami`. Only when the server cannot be connected, follow the dashboard path below.

## Step 1: the browser call

1. **Identify after sign-in:** call `Opem.identify({ id, email, name })` once the widget has loaded and the person is signed in, with the app's own stable id for them. Call `Opem.reset()` when they sign out. The browser sample is in [signing.md](references/signing.md).
2. **No server needed yet:** this works on every plan while the project's "Require signed identities" switch is off, which is the default for a new project (projects that were on a paid plan when signing became optional have it on). `list_projects` gives each project's switch as `requireIdentityVerification`; read it before promising the browser call alone is enough. The inbox marks those people unverified, and an unverified call never changes the email or name Opem has stored for the person.
3. **Check:** load a page signed in and open the widget's Your requests tab; the person's requests are theirs on any device. A refused identity shows `[Opem] The identity passed to identify() was refused (<code>)` in the console and the widget carries on as an anonymous visitor where the project allows them. The three codes are in [errors.md](references/errors.md).

## Step 2: harden, when Opem should trust the id

An unsigned id can be forged: anyone who knows a person's id could read their requests from the browser. When that matters, sign on the server and then switch signing on.

- **Where the signature is made:** on the server, never in the browser. The verification secret starts with `vs_`. It belongs in the server's environment (`OPEM_VERIFICATION_SECRET`), never in code, the repository or a chat.
- **What is signed:** HMAC-SHA256 over the id, a newline and the email in lower case (nothing after the newline without an email). Lowercase hex. [canonical-string.md](references/canonical-string.md) has the exact string and worked examples.
- **A signature that is sent must be right,** whatever the switch says: a wrong one is refused with `identity_signature_invalid`.

1. **The verification secret:** `create_key` for a verification secret, which needs the connection's `keys` permission (without it the tool answers `forbidden`). The value is in the result once: write it to the server's git-ignored environment file as `OPEM_VERIFICATION_SECRET` in the same step and never echo it.
2. **Server:** add a signing function with `signIdentity` from `@opem/node`, or the sample for the server's language in [signing.md](references/signing.md). Read the secret from the environment. Return `signature` to the page, for example as data rendered into the HTML or from an endpoint only signed-in users can call.
3. **Browser:** pass it on: `Opem.identify({ id, email, name, signature })`. Those people are verified in the inbox from their next call.
4. **Switch it on:** once every signed-in page sends a signature, `set_identity_verification` with `required: true` turns on "Require signed identities", on any plan. From then on an unsigned identity is refused with `identity_signature_required`, so turn it on only after the signing is live. [verification-toggle.md](references/verification-toggle.md) has what each setting does.
5. **Prove the signing code** with the known-answer vectors before blaming the secret:

   ```sh
   node scripts/check-signature.mjs --vectors
   OPEM_VERIFICATION_SECRET=vs_test_secret node scripts/check-signature.mjs user-1 Jane@Example.COM owner,billing 1793318400
   ```

   (In Claude Code the script is at `${CLAUDE_SKILL_DIR}/scripts/check-signature.mjs`.) The second form prints the canonical string and the signature for any inputs, so the developer can compare their server's output line by line. It reads the secret from the environment, never from the command line; with the real secret, export it in the developer's shell or run the script from the server's environment rather than typing it into a command.

## Without the connection

When the MCP server cannot be connected, the project's Configuration page, Identity tab, in the dashboard holds the "Require signed identities" switch (every plan, off by default for a new project) and the verification secret (`vs_`, shown once, with Rotate). Step 1 needs neither. For step 2 the developer creates the secret there and copies it into the server's environment file themselves, never into the chat, and turns the switch on there once the signing is live. The rest is the same.

## Roles

Roles decide which of the developer's documents the assistant may read for the person (the `knowledge-sync` skill tags them). They count only when signed, and only on Professional and Enterprise.

- Send `roles` with `signedAt` (unix seconds) and sign both: `Opem.identify({ id, email, name, roles, signedAt, signature })`. With roles the signed string gains two lines, the roles sorted and comma-joined, then `signedAt` ([canonical-string.md](references/canonical-string.md)).
- **Roles lapse a day after `signedAt`,** so sign on each page render, not once at sign-in. The call stays verified and reads as a person with no roles until the page signs again. An identity without roles has no `signedAt` and does not lapse.
- An unsigned identity carries no roles, so documents tagged by role stay hidden from it.

## Common mistakes

Signing in the browser; lower-casing the email on one side only; sorting roles on one side only; sending `roles` without `signedAt`; a server clock more than five minutes fast; a rotated secret still in an old environment; switching "Require signed identities" on before every page sends a signature.

## References

- [signing.md](references/signing.md): passing the identity from the browser, and signing it in Node.js, Python, Ruby, PHP, Go, C# and Java
- [canonical-string.md](references/canonical-string.md): the exact string that is signed, with worked examples
- [verification-toggle.md](references/verification-toggle.md): the "Require signed identities" switch, off and on
- [errors.md](references/errors.md): the three `identity_*` error codes and their causes
- [identity-vectors.json](references/identity-vectors.json): known-answer test vectors for the signature
