---
name: knowledge-sync
description: "Use when the developer wants Opem's assistant to answer from documentation kept in their repository: Markdoc or Markdown documents, front matter, access tags for roles, syncDocuments from @opem/node, PUT /api/v1/manage/knowledge/documents, a GitHub Actions workflow that syncs on every merge, or plan_limit_reached on a sync."
---

# Sync documentation from the repository

The assistant answers only from the project's knowledge documents. A sync sends the repository's Markdown or Markdoc files to the project by path through the management API, so the docs people already keep become the answers in the Help widget, and stay current with every merge.

**What a sync through the agent costs.** `sync_knowledge_documents` carries each file's whole content in the call, so every byte of every file passes through the agent's context twice, once read and once sent: a 440 KB docs folder is about 220,000 tokens. Say so to the developer before starting. Send a handful of files this way, up to about 100 KB in all. For a folder, use the sync script (steps 3 to 6) on every plan: it reads the files itself, so none of them passes through the agent, and CI keeps them in step on every merge. The developer can also upload the folder on the project's Knowledge page.

## First: is Opem connected?

Look for the Opem tools (`whoami`, `list_projects`). If the only Opem tool is `authenticate`, call it now and wait for the developer to sign in and consent; then call `whoami`. Only when the server cannot be connected, follow the dashboard path below.

## What a document needs

- A file ending `.md`, `.mdoc` or `.markdoc`, up to 512 KB. Plain Markdown is valid Markdoc.
- Front matter is optional. The assistant's index shows a `title` and an `about`; when the front matter has none, Opem derives them, the title from the first heading (else the file name) and the about from the first paragraph, and the sync result's `derived` names what it derived. So send files as they are and do not invent front matter; add `title` or `about` only where the derived one reads badly. `tags` is optional; `access: [role, …]` restricts the whole document to signed roles. See [front-matter.md](references/front-matter.md).
- Headings written as the questions people ask: the assistant picks a section by its heading, then answers from the text under it. Each section should answer on its own.
- Real headings, not bold lines. A line that is only bold text (`**Billing**`) is a paragraph to Markdoc, so a document headed that way reaches the assistant as one block. Convert each to a `##` heading (`## Billing`) in the repository's file before syncing, so later syncs keep it.
- To restrict one section, wrap it, heading included, in `{% access roles=["owner"] %}` … `{% /access %}` on their own lines. See [access-tags.md](references/access-tags.md). A broken tag hides what it covers rather than showing it to the wrong people.

## Steps

1. **Check the assistant, then the plan.** `get_install_status` first: when `assistantReady` is false, stop and tell the developer why (`assistantReason`) and who fixes it before syncing anything, since synced documents answer nothing until then: `platform_key_missing` is the deployment operator's (Opem's model key is not configured there; the project can answer with its own key meanwhile), `own_key_missing` and `own_key_unreadable` are the project's Assistant page, and `mock_not_allowed` means choosing Opem's key or an own key there. Go on only if the developer wants the documents in place before then. Then `get_plan`: `documents` gives the cap against its use, which applies on every plan, and `managementApi` says whether `prune` is available (Professional and Enterprise; [limits.md](references/limits.md)).
2. **A handful of files from the editor.** For a few small files, `sync_knowledge_documents` sends documents by path on every plan within the document cap, without a secret key: read the files, send `{ path, content }` for each, and read back each document's status and parse issues (fix the line a refused tag names). `prune` needs Professional or Enterprise. `add_crawl_source` points the assistant at a public site or sitemap instead. For a folder, go on to step 3.
3. **A secret key for the script and CI, on every plan.** `create_key` for a secret key, which needs the connection's `keys` permission, returns it once. Write it to a git-ignored local environment file in the same step and never echo it; the developer adds it to the CI's secrets as `OPEM_SECRET_KEY`, never to the repository or a chat. On Free and Basic the key reaches the sync only, without `--prune`; every other management API call answers `403` `plan_limit_reached`.
4. **Add the sync script.** Copy `scripts/sync-docs.mjs` into the repository (for example `scripts/opem-sync.mjs`) and `npm install --save-dev @opem/node`. It reads `DOCS_DIR` (default `docs`), sends every document under it, and prunes documents that are gone when run with `--prune`. The TypeScript version the docs show is in [sync-script.md](references/sync-script.md).
5. **Run it once locally** with the key in the environment and no `--prune`, and check the documents are listed as synced. Synced documents are read-only in the dashboard's editor: the repository wins.
6. **Add the workflow** from [github-action.md](references/github-action.md): on every push to the default branch that touches the docs, with `--prune` only there on Professional and Enterprise, so a branch build never deletes a document. On Free and Basic leave `--prune` out (it is refused with `plan_limit_reached`); a document removed from the repository is then deleted on the Knowledge page.
7. **Tag by role when needed:** the roles come from the signed identity (the `identify` skill). Until documents carry `access`, roles change nothing. Limiting documents to roles is a Professional and Enterprise feature: on Free or Basic a sync still stores the tags, and the material they cover is hidden from every answer until the plan has it.

## Without the connection

When the MCP server cannot be connected, the plan is on the dashboard's Billing page, and the developer uploads a handful of documents on the project's Knowledge page instead of step 2. The secret key for steps 3 to 6 comes from the Configuration page, Keys tab ("New secret key", on every plan; shown once); the developer puts it into the CI's secrets as `OPEM_SECRET_KEY` themselves. Step 5's check is the Knowledge page's list.

## What the sync does

New paths are added, changed ones updated, unchanged ones left alone; with prune, synced documents whose paths were not sent are removed. Documents uploaded or written in the dashboard are never pruned; a sync to a path one of them uses takes it over. The result names any document whose tags were refused and the line.

## References

- [front-matter.md](references/front-matter.md): Markdoc front matter, sections and the `access` tag
- [access-tags.md](references/access-tags.md): restricting documents and sections to roles, as the help article explains it
- [sync-script.md](references/sync-script.md): the sync script and the management client
- [github-action.md](references/github-action.md): the workflow that syncs on every merge
- [limits.md](references/limits.md): sync call limits, the document caps per plan and the management API's plans
