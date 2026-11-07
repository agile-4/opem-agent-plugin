---
name: customise
description: "Use when the developer wants to change the Help widget from code: the Opem.init options (theme, position, launcher, trigger, strings, context), opening the panel from their own button with Opem.open, request kinds, a title or an error pinned to a request, reportError, page context with Opem.context, the unread badge, or the open, close, navigate, request:sent, request:replied and ask:answered events."
---

# Customise the widget from code

Two places set how the widget looks and behaves: the dashboard's Widget page (saved per project, reaches every site the next time the widget loads) and the page's own code (per page, through `window.Opem`). [dashboard-vs-code.md](references/dashboard-vs-code.md) says which does what; everything the code can do is in [window-opem.md](references/window-opem.md), printed from the widget's own source.

## First: is Opem connected?

Look for the Opem tools (`whoami`, `list_projects`). If the only Opem tool is `authenticate`, call it now and wait for the developer to sign in and consent; then call `whoami`. Only when the server cannot be connected, follow the dashboard path below.

## What code sets

- **`Opem.init({ … })`** once per page: `theme` (`system`, `light`, `dark`; wins over the project's), `position` (`bottom-right`, `bottom-left`), `launcher: false` to hide the Help button when the page has its own, `trigger` (a selector or element that toggles the panel), `context` (a function returning the page's context), `strings` (overrides by key; applied only on plans with custom strings, and the project's Strings tab wins), `onEvent`.
- **`Opem.open(tab?, { kind, title, error, screenshot })`** from the developer's own button: `kind` preselects a request kind (the keys are on the Widget page, `problem`, `question`, `idea` unless changed), `title` starts the message (at most 200 characters, only while the person has typed nothing), `error` pins an error's one-line digest (an `Error`'s name and message, or a string; the stack is never sent), `screenshot: true` starts "Capture this tab" from the click. The sample is in [open-request.md](references/open-request.md).
- **`Opem.context({ page, title, extra })`** on each route change in a single-page app, so requests name the app's routes. `page` starts with `/`; `extra` sends only the names listed on the Widget page's Context tab, up to 20, and anything that looks like a credential is blanked.
- **`Opem.reportError(error)`** keeps the last 20 errors in memory and sends nothing on its own; pair it with `Opem.open({ error })`.
- **Events:** `Opem.on("request:sent", ({ reference, kind }) => …)` for analytics, `Opem.on("request:replied", ({ unread }) => …)` with `Opem.badge()` to show the count in the app's own menu, `open`, `close`, `navigate`, `ask:answered`. `on` returns a function that stops listening.

## What the project's settings set

Request kinds and their labels, the logo, colours and corner radius (Basic and above), the string overrides that apply to every site (Basic and above), which tabs the widget offers, anonymous visitors, the context allow-list, allowed origins and identity verification. They are saved per project, not in the page's code. See [settings-contract.md](references/settings-contract.md) for every field, and [strings.md](references/strings.md) for every string key with its default and where it appears.

Connected, most of them are tool calls: `get_widget_settings` reads a project's settings with what the plan allows, and `update_widget_settings` saves theme, launcher, request kinds, page context, appearance and string overrides as the Widget page does (`appearance: null` resets the Look and drops the logo). Appearance and strings answer `plan_limit_reached` where the plan lacks them. Allowed origins are `add_allowed_origin` and `remove_allowed_origin`, identity verification `set_identity_verification`. Which tabs the widget offers and anonymous visitors stay on the Widget page's Features tab; the per-page options stay code.

## Steps

1. Ask what should change. If it is a kind, a colour, a logo or a string for every site, it is a project setting: `get_widget_settings`, then `update_widget_settings` (and say which plan it needs); the tabs on offer and anonymous visitors are the Features tab's; if it is per page or behavioural, write code.
2. Write the `init` options or the `open`, `context` and `on` calls where the page's code runs in the browser. With `@opem/react`, `useOpem()` returns the same API inside components.
3. For an own button, hide the launcher only if the button is on every page; otherwise people lose the way in.
4. Test with the widget loaded on an allowed origin: a refused option is logged as `[Opem] …` in the console and the last good value stays.

## Without the connection

When the MCP server cannot be connected, the project's settings are changed on the dashboard's Widget page instead (Features, Kinds, Appearance, Strings and Context tabs; [dashboard-vs-code.md](references/dashboard-vs-code.md) names the tab for each). Tell the developer the tab and the value; the code side is the same.

## References

- [window-opem.md](references/window-opem.md): the `window.Opem` interfaces with their doc comments
- [open-request.md](references/open-request.md): opening a request from your own button
- [dashboard-vs-code.md](references/dashboard-vs-code.md): what the dashboard sets, what code sets, and what paid plans unlock
- [settings-contract.md](references/settings-contract.md): what the dashboard's Widget page saves and reads back
- [strings.md](references/strings.md): every widget string, its default and where it appears
- [context.md](references/context.md): what the widget sends about the page, and how `extra` values and blanked parameters work
