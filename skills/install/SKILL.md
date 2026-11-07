---
name: install
description: "Use when adding the Opem Help widget to a website or web app: the script tag, the @opem/browser or @opem/react packages, Next.js, Remix, SvelteKit, Vite, Astro, Rails, Django, Laravel, .NET, Spring, Go templates, plain HTML or a Flutter or React Native WebView, the Content-Security-Policy sources the widget needs, allowed origins, a widget that does not appear, or the error origin_not_allowed. Can check an install against the live /config endpoint."
---

# Install the Help widget

Put the widget on the developer's pages the way Opem documents it, set the Content-Security-Policy and the allowed origins, then prove the install against `GET /api/v1/widget/config`.

## First: is Opem connected?

Look for the Opem tools (`whoami`, `list_projects`). If the only Opem tool is `authenticate`, call it now and wait for the developer to sign in and consent; then call `whoami`. Only when the server cannot be connected, follow the dashboard path below.

## Before you start

You need the project's publishable key, `pk_` followed by the id (the dashboard issues one per project; a key is valid only on the deployment that issued it, so a key from a test deployment is `unauthenticated` on production). It is public by design: it works only from the sites the project allows. If the developer has no project yet, follow the `onboard` skill first; it ends with the key and the origins in place.

Never ask for, print or store a secret key (`sk_`) or a verification secret (`vs_`) in this skill. Installing the widget needs neither.

## Steps

1. **Find the project and its snippet.** `list_projects` to find the project, then `get_install_snippet` for it: the exact script tag, the publishable key, `scriptOrigin` (the host the widget script loads from, which is the base url in step 6) and the project's `allowedOrigins`.
2. **Pick the way in.** [frameworks.md](references/frameworks.md) names, for each framework, the file, where in it, the code to paste and what to watch for: the script tag in the shared layout for most (through `next/script` in Next.js), `@opem/browser`'s `Opem.init` in a Vite app's entry module, and `@opem/react`'s provider as the alternative in any React app (never both the tag and the provider). All three load the same widget; [snippets.md](references/snippets.md) has the ESM and React code in full. The code shows `https://support.opem.app`; use the host in your snippet when it differs.
3. **Add the code once per page.** The script tag goes before `</body>` on every page that should show the Help button, in the layout or root template so it is not repeated. `Opem.init({ projectKey })` runs once in the browser, never during server rendering; the module is safe to import on the server because nothing touches the page until `init`.
4. **Allow the origin.** Opem serves the widget only to the project's allowed origins (up to 20): scheme, host and port, no path, such as `http://localhost:3001` and `https://app.example.com`. A new project allows none. Ask which port the dev server uses (Next.js 3000 unless `-p`, Vite 5173, Rails 3000, Django 8000) rather than assuming 3000; the origin is scheme, host and port. Then `add_allowed_origin` for the local origin and the production origin. Each call returns the project with its `allowedOrigins`, as every project read does (`list_projects`, `get_install_snippet`, `get_install_status`): repeat the returned list to the developer, so a missing or mistyped origin shows at once.
5. **Set the Content-Security-Policy** if the site sends one: the five sources in [csp.md](references/csp.md), with the snippet's host where it says `https://support.opem.app`. Without `script-src` for that host the widget does not load at all; the other four degrade one feature each.
6. **Verify.** Run the check with the page's origin, the key and the base url:

   ```sh
   bash scripts/verify-config.sh http://localhost:3001 pk_… https://support.opem.app
   ```

   (In Claude Code the script is at `${CLAUDE_SKILL_DIR}/scripts/verify-config.sh`.) The base url is `scriptOrigin` from `get_install_snippet`, or the scheme and host in the `src` of the snippet the developer pasted. The examples say `https://support.opem.app`; use the host in your snippet when it differs. `200` with a JSON body means the key is live and the origin allowed; the body is the project's public settings, described in [config-response.md](references/config-response.md). `403` `origin_not_allowed` means the origin is not allowed yet; `401` `unauthenticated` means the key is unknown or revoked on that deployment (often a key from another deployment). "Protected by Vercel Authentication" means the deployment is walled off: the widget cannot load there from any origin, so use the production host. A `5xx` is on Opem's side: it is not the key, the origin or the policy, so change nothing; quote the request id the script prints to support and retry after a minute. The check sends `X-Opem-Probe: 1` and is not "seen"; only a page load is. Load a page with the widget, then `get_install_status`: `lastSeenOrigin` and `lastSeenAt` show the page load within a minute.
7. **Hand over.** The identity, customisation and knowledge skills follow once the widget loads.

## Without the connection

When the MCP server cannot be connected, the same steps run on keys and settings from the dashboard:

- **The snippet and the key:** the developer copies them from the project's Widget page, Install tab (the key is also on the Configuration page, Keys tab). The base url for step 6 is the host in that snippet's `src`.
- **The origins:** tell the developer exactly which origins to add on the Configuration page's Origins tab, one per line, and ask them to read back what the tab shows after saving.
- **Seen:** after a page load, the Install tab says "Seen from <origin>" within a minute.

## When it does not appear

Read the browser console first: Opem writes one line starting `[Opem]` that names the refusal (`origin_not_allowed`, `unauthenticated`), and a blocked script shows as a Content Security Policy error instead. Then use the `troubleshoot` skill.

## References

- [snippets.md](references/snippets.md): the install snippets: script tag, ESM, React provider and button
- [frameworks.md](references/frameworks.md): where the tag or the call goes in each framework, with the code for each (generated from the source the docs page and the dashboard use)
- [csp.md](references/csp.md): the Content-Security-Policy sources and what breaks without each
- [config-response.md](references/config-response.md): the `/config` response the widget loads, field by field
