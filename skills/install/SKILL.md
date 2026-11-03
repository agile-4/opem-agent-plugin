---
name: install
description: "Use when adding the Opem Help widget to a website or web app: the script tag, the @opem/browser or @opem/react packages, Next.js, Remix, SvelteKit, Vite, Rails, Django or plain HTML, the Content-Security-Policy sources the widget needs, allowed origins, a widget that does not appear, or the error origin_not_allowed. Can check an install against the live /config endpoint."
---

# Install the Help widget

Put the widget on the developer's pages the way Opem documents it, set the Content-Security-Policy and the allowed origins, then prove the install against `GET /api/v1/widget/config`.

## Before you start

You need the project's publishable key, `pk_live_…` or `pk_test_…`. It is public by design: it works only from the sites the project allows. If the developer has no project or key yet, follow the `onboard` skill first; it ends with the key and the origins in place.

Never ask for, print or store a secret key (`sk_`) or a verification secret (`vs_`) in this skill. Installing the widget needs neither.

## Steps

1. **Pick the way in.** A site without a bundler, or a framework that renders HTML (Rails, Django, Laravel, Astro, plain HTML): the script tag. An app with a bundler (Vite, webpack, Next.js, Remix, SvelteKit): `@opem/browser`. A React app that wants a provider and a button component: `@opem/react`. All three load the same widget; see [snippets.md](references/snippets.md) for the exact code and [frameworks.md](references/frameworks.md) for where it goes in each framework.
2. **Add the code once per page.** The script tag goes before `</body>` on every page that should show the Help button, in the layout or root template so it is not repeated. `Opem.init({ projectKey })` runs once in the browser, never during server rendering; the module is safe to import on the server because nothing touches the page until `init`.
3. **Allow the origin.** Opem serves the widget only to origins on the Configuration page's Origins tab (up to 20): scheme, host and port, no path, such as `http://localhost:3000` and `https://app.example.com`. A new project allows none. Tell the developer which origins to add; the plugin cannot add them in this release.
4. **Set the Content-Security-Policy** if the site sends one: the five sources in [csp.md](references/csp.md). Without `script-src https://support.opem.app` the widget does not load at all; the other four degrade one feature each.
5. **Verify.** Run the check with the page's origin and the key:

   ```sh
   bash scripts/verify-config.sh http://localhost:3000 pk_live_…
   ```

   (In Claude Code the script is at `${CLAUDE_SKILL_DIR}/scripts/verify-config.sh`.) `200` with a JSON body means the key is live and the origin allowed; the body is the project's public settings, described in [config-response.md](references/config-response.md). `403` `origin_not_allowed` means the origin is missing from the Origins tab; `401` `unauthenticated` means the key is unknown or revoked. Then load a page with the widget: the dashboard's Install tab says "Seen from <origin>" within a minute.
6. **Hand over.** The identity, customisation and knowledge skills follow once the widget loads.

## When it does not appear

Read the browser console first: Opem writes one line starting `[Opem]` that names the refusal (`origin_not_allowed`, `unauthenticated`), and a blocked script shows as a Content Security Policy error instead. Then use the `troubleshoot` skill.

## With Opem connected

When the Opem MCP server is connected (see the `onboard` skill), skip the dashboard: `list_projects` to find the project, `get_install_snippet` for the exact tag and key, `add_allowed_origin` for each origin the pages load from, and `get_install_status` after the first page load to confirm the widget was seen and from which origin. The `verify-config.sh` check still proves the install from the page's point of view.

## References

- [snippets.md](references/snippets.md): the install snippets: script tag, ESM, React provider and button
- [frameworks.md](references/frameworks.md): where the tag or the call goes in each framework
- [csp.md](references/csp.md): the Content-Security-Policy sources and what breaks without each
- [config-response.md](references/config-response.md): the `/config` response the widget loads, field by field
