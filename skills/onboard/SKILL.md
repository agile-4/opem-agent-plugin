---
name: onboard
description: "Use when the developer has no Opem account or project yet, asks how to start with Opem, or holds a key (pk_, sk_, vs_) with no idea where it goes. Walks through signing up at support.opem.app, creating a project, and finding the publishable key, the allowed origins and the verification secret on the Configuration page."
---

# Start with Opem

Take a developer from nothing to a project with a publishable key and an allowed origin for localhost and production, then hand over to the `install` skill. In this release the account, the project and the keys are made in the dashboard; the walkthrough in [dashboard-walkthrough.md](references/dashboard-walkthrough.md) names every page and tab, so the developer never hunts for them.

## Steps

1. **Account and organisation.** Sign up at `https://support.opem.app/auth/sign-up` (email and password with a six-digit code, or Google). The first screen after sign-in creates the organisation; one Free organisation per person, paid plans through Checkout.
2. **Project.** The step-by-step page creates the first project: a name, a reference prefix (2 to 8 capitals or digits, starting with a letter; it prefixes every request's reference such as `ACME-42`) and, if known, the site the widget runs on. Creating the project creates its publishable key.
3. **Keys.** On the project's Configuration page, Keys tab: the publishable key (`pk_`, public, goes in the page) and, on Professional and Enterprise, "New secret key" (`sk_`, shown once, for the management API from a server). Identity tab: the verification secret (`vs_`, shown once, for signing identities on a server).
4. **Origins.** Configuration page, Origins tab: every origin the widget loads from, scheme, host and port, no path: `http://localhost:3000` for local work and the production origin. A new project allows none.
5. **Where each key goes.** `pk_` in the script tag or `init`; `sk_` in CI or server secrets as `OPEM_SECRET_KEY`; `vs_` in the server's environment as `OPEM_VERIFICATION_SECRET`; a webhook secret as `OPEM_WEBHOOK_SECRET`. Never in the repository, the browser or a chat. If a secret has appeared in a chat, rotate it on the same tab.
6. **Hand over** to `install`, and from there to `identify`, `knowledge-sync`, `webhooks` and `customise` as the developer needs them.

## What the plugin sends

Nothing on its own. See [what-the-plugin-sends.md](references/what-the-plugin-sends.md) before the developer asks.

## With Opem connected

The plugin declares Opem's MCP server (`https://support.opem.app/api/v1/mcp`). Once the developer has connected it (sign in, choose the organisation, consent), the steps above become tool calls and the dashboard is only the fallback:

1. `whoami`: the organisation, the member's role, the plan and the permissions the connection carries (`read`, `configure`, `keys`). Writes need `configure`; a secret key, a verification secret or a webhook needs `keys`, which is unticked by default on consent.
2. `get_plan`, then `list_projects`. No project yet: `create_project` with a name, `environment` (`production`, `staging` or `development`), a reference prefix and, if known, the origins; it comes with its publishable key.
3. `get_install_snippet` for the script tag and the key; `add_allowed_origin` for `http://localhost:3000` and the production origin.
4. `create_key` for a verification secret (`vs_`) or a secret key (`sk_`) when the developer needs one: the value is in the result once. Write it to the environment file in the same step and never echo it; if it has appeared in a chat, rotate it in the dashboard.
5. A refusal names its reason: `forbidden` (the role or the connection's permissions), `plan_limit_reached` (the plan), `not_found` (a project of another organisation). To act for another organisation the developer reconnects.

## References

- [dashboard-walkthrough.md](references/dashboard-walkthrough.md): sign-up, organisation, first project, and every tab that holds a key or a setting
- [what-the-plugin-sends.md](references/what-the-plugin-sends.md): what leaves the developer's machine, and when
