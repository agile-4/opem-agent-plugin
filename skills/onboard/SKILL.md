---
name: onboard
description: "Use when the developer has no Opem account or project yet, asks how to start with Opem, or holds a key (pk_, sk_, vs_) with no idea where it goes. Walks through signing up at support.opem.app, creating a project, and finding the publishable key, the allowed origins and the verification secret on the Configuration page."
---

# Start with Opem

Take a developer from nothing to a project with a publishable key and an allowed origin for localhost and production, then hand over to the `install` skill. With Opem's MCP server connected, the project, the origins and the keys are tool calls; without it, the walkthrough in [dashboard-walkthrough.md](references/dashboard-walkthrough.md) names every page and tab, so the developer never hunts for them.

## First: is Opem connected?

Look for the Opem tools (`whoami`, `list_projects`). If the only Opem tool is `authenticate`, call it now and wait for the developer to sign in and consent; then call `whoami`. Only when the server cannot be connected, follow the dashboard path below.

The tool list is read when the server connects; after a plugin update, or when a tool's text disagrees with this skill, reconnect (`/mcp` in Claude Code) before trusting the older of the two.

## Steps

The plugin declares Opem's MCP server (`https://support.opem.app/api/v1/mcp`).

0. **Connect.** `authenticate` prints a sign-in link. It opens on Opem's authorisation server, a `neonauth…neon.tech` address, and lands on `support.opem.app`; the consent page shows the organisation, `read` (always), `configure` (ticked) and `keys` (unticked). Tell the developer what they will see before they open it. A developer with no account signs up at `https://support.opem.app/auth/sign-up` first (email and password with a six-digit code, or Google); one with no organisation creates it on the way to consent. If the browser shows an error on the `localhost:<port>/callback` page while the terminal reports no flow in progress, run `authenticate` again; the second attempt completes.
1. **`whoami`:** the organisation, the member's role, the plan and the permissions the connection carries (`read`, `configure`, `keys`). Writes need `configure`; a secret key, a verification secret or a webhook needs `keys`, which is unticked by default on consent.
2. **`get_plan`, then `list_projects`.** No project yet: `create_project` with a name, `environment` (`production`, `staging` or `development`), a reference prefix (2 to 8 capitals or digits, starting with a letter; it prefixes every request's reference such as `ACME-42`) and, if known, the origins; it comes with its publishable key and the snippet in the result (`publishableKey`, `snippet`, `scriptOrigin`).
3. **Snippet and origins.** For a project made in step 2 the snippet and the key are in its result; for an existing one, `get_install_snippet`. Ask which port the dev server uses (Next.js 3000 unless `-p`, Vite 5173, Rails 3000, Django 8000) rather than assuming 3000; the origin is scheme, host and port. `add_allowed_origin` for that local origin and the production origin, then repeat the returned `allowedOrigins` to the developer.
4. **Ask how far to go** (the section below), in one message, before making anything else.
5. **`create_key`** only when an answer needs one: a verification secret (`vs_`) for signed identities, a secret key (`sk_`) for the sync script run locally or in CI. The browser call, a few files from the editor and the widget itself need none. The value is in the result once. Write it to the environment file in the same step and never echo it; if it has appeared in a chat, rotate it in the dashboard.
6. **Where each key goes.** `pk_` in the script tag or `init`; `sk_` in CI or server secrets as `OPEM_SECRET_KEY`; `vs_` in the server's environment as `OPEM_VERIFICATION_SECRET`; a webhook secret as `OPEM_WEBHOOK_SECRET`. Never in the repository, the browser or a chat.
7. **A refusal names its reason:** `forbidden` (the role or the connection's permissions), `plan_limit_reached` (the plan), `not_found` (a project of another organisation). To act for another organisation the developer reconnects.
8. **Hand over** to `install`, and from there only to the skills the answers name (`identify`, `knowledge-sync`, `webhooks`, `customise`), each as far as its answer goes; name the rest as offers.

## Ask how far to go

Ask the developer, in one message, which features to switch on and how far to take each, with the default beside each question so a short answer is enough:

1. **Identity:** not yet (the default), the browser call (`Opem.identify()` after sign-in, no server needed), or signed on their server with the verification secret.
2. **Knowledge for the assistant:** none yet (the default), a few files sent from the editor, the docs folder by the sync script run locally, or the sync script in CI on every merge.
3. **Ask for visitors:** on for everyone, anonymous visitors included (the default for a new project), or signed-in people only (which needs identity, or nobody can ask).
4. **Webhooks and customisation:** later (the default), or now.

Repeat the answers back in one line, such as "Identity: the browser call; knowledge: three files from the editor; Ask: on for everyone; webhooks and customisation: later", so they stay in the conversation for the later skills to read. If the questions were answered earlier in the conversation, use those answers and do not ask again; a later request from the developer widens the answer for that feature only. Each later skill does what its answer says and stops there, naming the next step as an offer.

## Without the connection

When the MCP server cannot be connected, the developer makes the same things in the dashboard:

1. **Account and organisation.** Sign up at `https://support.opem.app/auth/sign-up` (email and password with a six-digit code, or Google). The first screen after sign-in creates the organisation; one Free organisation per person, paid plans through Checkout.
2. **Project.** The step-by-step page creates the first project: a name, a reference prefix and, if known, the site the widget runs on. Creating the project creates its publishable key.
3. **Keys.** On the project's Configuration page, Keys tab: the publishable key (`pk_`, public, goes in the page) and "New secret key" on every plan (`sk_`, shown once, for the sync script, CI and the management API from a server; on Free and Basic it reaches the knowledge sync only). Identity tab: the verification secret (`vs_`, shown once, for signing identities on a server). Make a secret only when an answer needs one, as in step 5. If a secret has appeared in a chat, rotate it on the same tab.
4. **Origins.** Configuration page, Origins tab: every origin the widget loads from, scheme, host and port, no path: the local origin on the port the dev server uses (ask; do not assume 3000) and the production origin. A new project allows none.

Steps 4 and 6 above apply unchanged.

## What the plugin sends

Nothing on its own. See [what-the-plugin-sends.md](references/what-the-plugin-sends.md) before the developer asks.

## References

- [dashboard-walkthrough.md](references/dashboard-walkthrough.md): sign-up, organisation, first project, and every tab that holds a key or a setting
- [what-the-plugin-sends.md](references/what-the-plugin-sends.md): what leaves the developer's machine, and when
