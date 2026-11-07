# The canonical string

The signature is HMAC-SHA256, keyed with the project's verification secret, over this UTF-8 string, printed as lowercase hex (64 characters):

```
<id> "\n" <email in lower case, or nothing>
```

and, only when you send roles (one or more):

```
<id> "\n" <email in lower case, or nothing> "\n" <roles sorted, joined with ","> "\n" <signedAt>
```

- `id`: the app's own stable id, 1 to 255 characters, no leading or trailing whitespace, not starting with `anon_`.
- `email`: optional; lower-cased before signing. With no email the first line still ends with the newline.
- `roles`: optional; lower-case letters, digits, `_` and `-`, up to 40 characters each, at most 20, none twice. Sorted with ordinary string comparison. An empty list is the same as no roles: two lines, no `signedAt`.
- `signedAt`: unix seconds as a plain integer. Needed with roles; the roles lapse a day later.

Worked examples with the secret `vs_test_secret` (from `identity-vectors.json`):

| id | email | roles | signedAt | string | signature |
|---|---|---|---|---|---|
| `user-1` | `Jane@Example.COM` | `owner, billing` | `1793318400` | `user-1\njane@example.com\nbilling,owner\n1793318400` | `c92adf4e3c1f372d4dfdf0d83c7cb1ed8d70a3a99f622a7dcc9304f89218e74c` |
| `user-1` | none | none | ignored | `user-1\n` | `b49974ada965a93c2df44a04e60fca9de2f8defb3c37103199c66c43f6728d0e` |
| `user-1` | none | `owner` | `1793318400` | `user-1\n\nowner\n1793318400` | `20f5bc749113de7753886900b740cd1d588003de342e4dc5ef6575ad1b9e1213` |

Opem compares the hex in constant time. The browser passes the same `id`, `email`, `roles` and `signedAt` to `Opem.identify()`; Opem rebuilds the string from them and checks the signature, so any difference (an email in a different case, roles in a different order are fine; a different id or a missing email are not) refuses the identity.
