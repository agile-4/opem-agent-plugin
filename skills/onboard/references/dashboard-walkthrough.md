# The dashboard, page by page

All on `https://support.opem.app`.

| Step | Where | What happens |
|---|---|---|
| Sign up | `/auth/sign-up` | Name, email and password, then a six-digit code by email; or Google. |
| Organisation | `/onboarding`, straight after the first sign-in | A name and a slug. One Free organisation per person; "Start a paid organisation" goes through Checkout. |
| First project | The projects home, "Step 1 of 2" | Name, reference prefix, optional first site. The publishable key is created with the project. |
| Install | The project page, "Step 2 of 2", or the Widget page's Install tab (`/projects/<id>/widget?tab=install`) | The one-tag snippet, the install status ("Seen from …" within a minute of the first load), the Content-Security-Policy sources. |
| Keys | `/projects/<id>/configuration`, Keys tab | `pk_` shown in full; "New secret key" (`sk_`, every plan; on Free and Basic it reaches the knowledge sync only) shown once; Rotate and Revoke. |
| Origins | Configuration, Origins tab | Up to 20 origins, `https?://host(:port)`, no path. |
| Identity | Configuration, Identity tab | The "Require signed identities" switch (every plan, off by default: unsigned people are accepted as unverified), the `vs_` secret shown once, and a link to the signing code in seven languages. |
| Webhooks | Configuration, Webhooks tab (Professional and Enterprise) | Endpoints, events, the `whsec_` secret shown once, the deliveries log and Redeliver. |
| API reference | Configuration, API reference tab | The management API, the OpenAPI document, a Node.js snippet. |
| Knowledge | `/projects/<id>/knowledge` | Upload, write, "Sync from CI" (the snippet), crawl a URL or sitemap, roles, the help centre. |
| Widget | `/projects/<id>/widget` | Features, Kinds, Appearance (Basic and above), Strings (Basic and above), Context, Install. |
| Team, Usage, Billing | `/settings/team`, `/settings/usage`, `/settings/billing` | Seats and roles; this month against the plan; the plan and invoices. |

Who can do what: owners and admins create projects and keys, change settings and add origins; agents see them. Only owners delete a project or the organisation.

Plans in one line: Free (1 project, 100 requests a month, 20 documents); Basic $39 (appearance and strings); Professional $99 (the whole management API, webhooks, prune); Enterprise (custom, single sign-on, own sending domain). The full matrix is in the `reference` skill's `plans.md`.
