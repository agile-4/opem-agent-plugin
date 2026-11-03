# What the dashboard sets, what code sets

| Setting | Where | Plan |
|---|---|---|
| Which tabs the widget offers (Ask, New request, Your requests), screenshots, anonymous visitors | Widget page, Features tab | every plan |
| Request kinds (1 to 8, label and hint) | Widget page, Kinds tab | every plan |
| Logo, accent, background and text colours, corner radius | Widget page, Appearance tab | Basic and above; kept but not shown on Free |
| Colour scheme (follow the visitor, light, dark) | Widget page, Appearance tab, or `init({ theme })` which wins | every plan |
| Launcher position and label | Widget page, Appearance tab, or `init({ position })` and `init({ launcher: false })` | every plan |
| Strings for every site | Widget page, Strings tab (wins over `init({ strings })`) | Basic and above |
| Strings for one page | `init({ strings })` | Basic and above (ignored otherwise) |
| Context: extra value names and blanked parameters | Widget page, Context tab | every plan |
| Which page the person is on, extra values | `Opem.context()` or `init({ context })` | every plan |
| Allowed origins, identity verification, keys | Configuration page | every plan (verification required on paid plans) |
| Opening the panel, preselecting a kind, pinning an error or a title, a screenshot | `Opem.open()` | every plan |
| Unread count in the app's own menu | `Opem.badge()` and the `request:replied` event | every plan |

Changes saved in the dashboard reach a site the next time the widget loads there; there is no release. If requests are switched off for the project, `Opem.open({ tab: "request" })` opens the first tab still on offer; when the month's requests are used up, New request opens but says requests are paused.
