---
type: llm
---

PASS if the reply starts by calling, or asking to run, the `authenticate` tool so the user signs in and consents, then `whoami`, and names the tool calls as the path after that: `list_projects` (or `create_project`), `get_install_snippet` and `add_allowed_origin` for http://localhost:5173, with the dashboard only as the fallback when the connection cannot be made.
FAIL if it sends the user to the dashboard to copy a key or add origins by hand before trying to connect, says the plugin cannot add origins, or asks for a secret key or a verification secret.
