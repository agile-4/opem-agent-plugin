# What the plugin sends, and when

Nothing of its own. The plugin is Markdown and small scripts your coding agent reads on your machine. It holds no credentials and asks for none; a connection to Opem's MCP server is an OAuth token your agent keeps for you, made only when you sign in and consent.

The only network calls it ever makes are the ones you ask for, to your own project:

| Call | When | What it carries |
|---|---|---|
| `GET https://support.opem.app/api/v1/widget/config` | `install`'s `verify-config.sh`, `troubleshoot`'s `diagnose.sh` | Your publishable key and your site's origin, exactly as the widget sends them |
| `HEAD <your page>` | `diagnose.sh` with a page URL | Nothing but the request |
| `PUT /api/v1/manage/knowledge/documents` | the sync script you copy into your repository, run by you or your CI | Your documents and your secret key, from your own environment |
| `POST <your endpoint>` | `sign-test-delivery.mjs`, to your own local server | A sample body signed with a test secret you choose |
| `POST https://support.opem.app/api/v1/mcp` | every tool call, once you have connected the Opem MCP server (sign in, choose the organisation, consent) | The OAuth token your agent holds for the connection, and the tool's arguments: a project name, an origin, widget settings, or for `sync_knowledge_documents` the documents' paths and content. Every write is audit-logged on Opem's side by id, never by content; revoke the connection from Settings > Agents |

Nothing is sent when the plugin is installed or when a skill is read. The plugin stores no record of what you ask it and writes no file outside your project unless you ask. Removing it (`claude plugin uninstall opem@opem`, or from Codex's `/plugins`) changes nothing in your Opem project.
