---
type: llm
---

PASS if the reply puts the widget in the shared layout (app/layout.tsx) once, either as a Next.js Script tag loading https://support.opem.app/v1/widget.js with data-project set to the key or through @opem/react's OpemProvider, says both origins must be added on the project's Configuration page under Origins, mentions the Content-Security-Policy sources if the site sends a policy, and describes a check against GET /api/v1/widget/config or the dashboard's "Seen from" status.
FAIL if it puts the tag on individual pages instead of the layout, asks for a secret key or a verification secret, invents an npm package name other than @opem/browser or @opem/react, or omits the allowed origins.
