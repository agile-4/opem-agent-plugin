# The "Require signed identities" switch

Every project has one switch for identity verification, on every plan: "Require signed identities" on the Configuration page, Identity tab, or `set_identity_verification` through the Opem connection. It is off for a new project; projects that were on a paid plan when signing became optional had it switched on for them. `list_projects` and `get_widget_settings` give its current value, so read it rather than assume.

| Switch | An identity without a signature | An identity with a signature |
|---|---|---|
| Off (the default for a new project) | Accepted. The person is marked unverified in the inbox, carries no roles, and cannot change the email or name Opem has stored for them. | Checked: a right one makes the person verified; a wrong one is refused with `identity_signature_invalid`. |
| On | Refused with `identity_signature_required`. | Checked, as with the switch off. |

Changing plan never changes the switch: a project that moves from Free to a paid plan, or back, keeps its setting.

Turn it on only after every signed-in page sends a signature; until then, people whose pages do not sign fall back to anonymous visitors, or lose the request tabs where anonymous visitors are off.

Anonymous visitors (no `identify()` at all) are a separate project setting, "Anonymous visitors", on the Widget page's Features tab. A project may refuse anonymous visitors, in which case a page that never calls `identify()` gets `identity_required`.

Roles count only when the signature verifies; an unsigned identity counts as having no roles, so documents tagged by role stay hidden from it.
