---
name: install
description: "Use when adding the Opem Help widget to a website or web app: the script tag, the @opem/browser or @opem/react packages, Next.js, Remix, SvelteKit, Vite, Astro, Rails, Django, Laravel, .NET, Spring, Go templates, plain HTML or a Flutter or React Native WebView, the Content-Security-Policy sources the widget needs, allowed origins, a widget that does not appear, or the error origin_not_allowed. Can check an install against the live /config endpoint."
---

# Install the Help widget

Put the widget on the developer's pages the way Opem documents it, set the Content-Security-Policy and the allowed origins, then prove the install against `GET /api/v1/widget/config`.

## First: is Opem connected?

Look for the Opem tools (`whoami`, `list_projects`). If the only Opem tool is `authenticate`, call it now and wait for the developer to sign in and consent; then call `whoami`. Only when the server cannot be connected, follow the dashboard path below.

## Stop at the chosen step

Do the steps the developer chose (their answers to the how-far questions the `onboard` and `install` skills ask, or what they asked for) and no further. When the next step would add a dependency, a file to the repository, a key, a workflow or a switch they did not ask for, name it as the next offer and stop. If nothing has been chosen yet, ask before the first such step.

## Before you start

You need the project's publishable key, `pk_` followed by the id (the dashboard issues one per project; a key is valid only on the deployment that issued it, so a key from a test deployment is `unauthenticated` on production). It is public by design: it works only from the sites the project allows. If the developer has no project yet, follow the `onboard` skill first; it ends with the key and the origins in place.

Never ask for, print or store a secret key (`sk_`) or a verification secret (`vs_`) in this skill. Installing the widget needs neither.

## Steps

1. **Find the project and its snippet.** `list_projects` to find the project, then `get_install_snippet` for it: the exact script tag, the publishable key, `scriptOrigin` (the host the widget script loads from, which is the base url in step 6) and the project's `allowedOrigins`. A project `create_project` has just made already carries `publishableKey`, `snippet` and `scriptOrigin` in its result.
2. **Pick the way in.** [frameworks.md](references/frameworks.md) names, for each framework, the file, where in it, the code to paste and what to watch for: the script tag in the shared layout for most (through `next/script` in Next.js), `@opem/browser`'s `Opem.init` in a Vite app's entry module, and `@opem/react`'s provider as the alternative in any React app (never both the tag and the provider). All three load the same widget; [snippets.md](references/snippets.md) has the ESM and React code in full. The code shows `https://support.opem.app`; use the host in your snippet when it differs.
3. **Add the code once per page.** The script tag goes before `</body>` on every page that should show the Help button, in the layout or root template so it is not repeated. `Opem.init({ projectKey })` runs once in the browser, never during server rendering; the module is safe to import on the server because nothing touches the page until `init`.
4. **Allow the origin.** Opem serves the widget only to the project's allowed origins (up to 20): scheme, host and port, no path, such as `http://localhost:3001` and `https://app.example.com`. A new project allows none. Ask which port the dev server uses (Next.js 3000 unless `-p`, Vite 5173, Rails 3000, Django 8000) rather than assuming 3000; the origin is scheme, host and port. Then `add_allowed_origin` for the local origin and the production origin. Each call returns the project with its `allowedOrigins`, as every project read does (`list_projects`, `get_install_snippet`, `get_install_status`): repeat the returned list to the developer, so a missing or mistyped origin shows at once.
5. **Set the Content-Security-Policy** if the site sends one: the five sources in [csp.md](references/csp.md), with the snippet's host where it says `https://support.opem.app`. Without `script-src` for that host the widget does not load at all; the other four degrade one feature each.
6. **Verify.** Run the check with the page's origin, the key and the base url:

   ```sh
   bash scripts/verify-config.sh http://localhost:3001 pk_… https://support.opem.app
   ```

   (In Claude Code the script is at `${CLAUDE_SKILL_DIR}/scripts/verify-config.sh`.) The base url is `scriptOrigin` from `get_install_snippet`, or the scheme and host in the `src` of the snippet the developer pasted. The examples say `https://support.opem.app`; use the host in your snippet when it differs. `200` with a JSON body means the key is live and the origin allowed; the body is the project's public settings, described in [config-response.md](references/config-response.md). `403` `origin_not_allowed` means the origin is not allowed yet; `401` `unauthenticated` means the key is unknown or revoked on that deployment (often a key from another deployment). "Protected by Vercel Authentication" means the deployment is walled off: the widget cannot load there from any origin, so use the production host. A `5xx` is on Opem's side: it is not the key, the origin or the policy, so change nothing; quote the request id the script prints to support and retry after a minute. The check sends `X-Opem-Probe: 1` and is not "seen"; only a page load is. Load a page with the widget, then `get_install_status`: `lastSeenOrigin` and `lastSeenAt` show the page load within a minute.
7. **Check that visitors can ask.** After the first page load, `get_install_status` again, and read three fields before handing over:
   - `assistantReady` false: the assistant cannot answer anyone, and the widget hides its Ask tab. Say why from `assistantReason` and who fixes it: `platform_key_missing` means Opem's model key is not configured on that deployment, which only its operator can set (the project can answer with its own key meanwhile, on its Assistant page); `own_key_missing` or `own_key_unreadable` means the project's own key, provider or model needs adding or testing again on the project's Assistant page; `mock_not_allowed` means the test model is chosen on a production project, so choose Opem's key or an own key there. Nothing in the install fixes it.
   - `askAvailableToVisitors` false with the assistant ready: Ask is switched off for the project (the Widget page's Features tab), or anonymous Ask (`anonymousAsk`) is off and no identity has arrived yet (`lastIdentityAt` null). Offer the two ways out: the `identify` skill, so signed-in people can ask, or turning anonymous Ask on so visitors can ask before identity is wired, which `update_project_features` with `{ "anonymousAsk": true }` does (it needs `anonymousVisitors` on, the default; when Ask itself is off, `{ "ask": true }` turns it on), as "Anonymous visitors may ask" does in the Widget page's Features tab.
   - Both true: visitors can ask.
8. **Hand over.** Ask how far to go (the section below) unless the answers are already in the conversation. Act on the Ask answer here: signed-in people only is `update_project_features` with `{ "anonymousAsk": false }` (without the connection, "Anonymous visitors may ask" off on the Widget page's Features tab); on for everyone is the default and needs nothing. Then hand over to the skills the answers name (`identify`, `knowledge-sync`, `webhooks`, `customise`), and name the others as offers without starting them.

## Ask how far to go

Ask the developer, in one message, which features to switch on and how far to take each, with the default beside each question so a short answer is enough:

1. **Identity:** not yet (the default), the browser call (`Opem.identify()` after sign-in, no server needed), or signed on their server with the verification secret.
2. **Knowledge for the assistant:** none yet (the default), a few files sent from the editor, the docs folder by the sync script run locally, or the sync script in CI on every merge.
3. **Ask for visitors:** on for everyone, anonymous visitors included (the default for a new project), or signed-in people only (which needs identity, or nobody can ask).
4. **Webhooks and customisation:** later (the default), or now.

Repeat the answers back in one line, such as "Identity: the browser call; knowledge: three files from the editor; Ask: on for everyone; webhooks and customisation: later", so they stay in the conversation for the later skills to read. If the questions were answered earlier in the conversation, use those answers and do not ask again; a later request from the developer widens the answer for that feature only. Each later skill does what its answer says and stops there, naming the next step as an offer.

## Without the connection

When the MCP server cannot be connected, the same steps run on keys and settings from the dashboard:

- **The snippet and the key:** the developer copies them from the project's Widget page, Install tab (the key is also on the Configuration page, Keys tab). The base url for step 6 is the host in that snippet's `src`.
- **The origins:** tell the developer exactly which origins to add on the Configuration page's Origins tab, one per line, and ask them to read back what the tab shows after saving.
- **Seen:** after a page load, the Install tab says "Seen from <origin>" within a minute. The line under it says whether visitors can use Ask, and when they cannot, why and where it is fixed.

## When it does not appear

Read the browser console first: Opem writes one line starting `[Opem]` that names the refusal (`origin_not_allowed`, `unauthenticated`), and a blocked script shows as a Content Security Policy error instead. Then use the `troubleshoot` skill.

## References

- [snippets.md](references/snippets.md): the install snippets: script tag, ESM, React provider and button
- [frameworks.md](references/frameworks.md): where the tag or the call goes in each framework, with the code for each (generated from the source the docs page and the dashboard use)
- [csp.md](references/csp.md): the Content-Security-Policy sources and what breaks without each
- [config-response.md](references/config-response.md): the `/config` response the widget loads, field by field
