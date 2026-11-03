# Where the widget goes, by framework

The rule everywhere: one copy per page, in the layout the pages share, running in the browser only, with the publishable key from the project's Configuration page (an environment variable is fine; the key is public).

| Framework | Where | Notes |
|---|---|---|
| Plain HTML | The script tag before `</body>` in every page, or in the shared footer include | `defer` keeps it off the critical path |
| Next.js, app router | `app/layout.tsx`: `<Script src="https://support.opem.app/v1/widget.js" data-project={process.env.NEXT_PUBLIC_OPEM_KEY} strategy="afterInteractive" />` from `next/script`, or `@opem/react`'s `OpemProvider` in a client component wrapped around `{children}` | The provider adds the script tag itself; do not add both |
| Next.js, pages router | `pages/_app.tsx`, the same `<Script>` or `OpemProvider` | |
| Remix | `app/root.tsx`, the script tag inside `<body>` after `<Scripts />`, or `OpemProvider` around `<Outlet />` | |
| SvelteKit | `src/app.html` before `</body>` (static key), or `+layout.svelte` with `onMount(() => Opem.init({ projectKey }))` from `@opem/browser` | `onMount` keeps it out of server rendering |
| Vite with React or Vue | `main.tsx` or `main.ts`: `import { Opem } from "@opem/browser"; Opem.init({ projectKey: import.meta.env.VITE_OPEM_KEY })` | |
| Astro | The script tag in the shared layout `.astro` file, before `</body>` | |
| Rails | `app/views/layouts/application.html.erb` before `</body>` | |
| Django | The base template, before `</body>` | |
| Laravel | `resources/views/layouts/app.blade.php` before `</body>` | |

Signed-in users: call `Opem.identify()` after the person signs in, with a signature from your server (the `identify` skill). Single-page apps: call `Opem.context({ page })` on each route change so requests name your routes (the `customise` skill).

Do not load the script in an iframe or through a tag manager that strips `data-project`; the widget reads the key from its own script element.
