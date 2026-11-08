# The "Require signed identities" switch

Every project has one switch for identity verification, on every plan: "Require signed identities" on the Configuration page, Identity tab, or `set_identity_verification` through the Opem connection. It is off for a new project; projects that were on a paid plan when signing became optional had it switched on for them. `list_projects` and `get_widget_settings` give its current value, so read it rather than assume.

| Switch | An identity without a signature | An identity with a signature |
|---|---|---|
| Off (the default for a new project) | Accepted. The person is marked unverified in the inbox and cannot change the email or name Opem has stored for them. Their roles count only with "Trust unsigned roles" on (below). | Checked: a right one makes the person verified; a wrong one is refused with `identity_signature_invalid`. |
| On | Refused with `identity_signature_required`. | Checked, as with the switch off. |

Changing plan never changes the switch: a project that moves from Free to a paid plan, or back, keeps its setting.

Turn it on only after every signed-in page sends a signature; until then, people whose pages do not sign fall back to anonymous visitors, or lose the request tabs where anonymous visitors are off.

Anonymous visitors (no `identify()` at all) are a separate project setting, "Anonymous visitors", on the Widget page's Features tab. A project may refuse anonymous visitors, in which case a page that never calls `identify()` gets `identity_required`.

## "Trust unsigned roles"

A second switch, under "Require signed identities" on the Identity tab, or `set_identity_verification` with `trustUnsignedRoles`. Off by default on every project. `list_projects` gives its value as `trustUnsignedRoles`.

| Trust unsigned roles | Roles sent without a signature | Roles sent with a signature |
|---|---|---|
| Off (the default) | Dropped. The person is still accepted, unverified, and the browser console says once that the roles were ignored. | Count while the signature verifies, for a day after `signedAt`. |
| On | Kept on the person, shown as "Unverified" on the inbox's person card, and they open documents tagged for them (Professional and Enterprise). They need no `signedAt` and do not lapse. | The same as with the switch off. |

The risk with it on: anyone who has the publishable key can claim any role from a browser console and read every document tagged for that role. It has no effect while "Require signed identities" is on, because no unsigned identity is accepted then, and the Identity tab disables it.

On Free and Basic, no role opens a tagged document, signed or not; the switch still keeps unsigned roles on the person for staff to see.
