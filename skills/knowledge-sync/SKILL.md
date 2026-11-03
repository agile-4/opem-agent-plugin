---
name: knowledge-sync
description: "Use when the developer wants Opem's assistant to answer from documentation kept in their repository: Markdoc or Markdown documents, front matter, access tags for roles, syncDocuments from @opem/node, PUT /api/v1/manage/knowledge/documents, a GitHub Actions workflow that syncs on every merge, or plan_limit_reached on a sync."
---

# Sync documentation from the repository

The assistant answers only from the project's knowledge documents. A sync sends the repository's Markdown or Markdoc files to the project by path through the management API, so the docs people already keep become the answers in the Help widget, and stay current with every merge.

## What a document needs

- A file ending `.md`, `.mdoc` or `.markdoc`, up to 512 KB. Plain Markdown is valid Markdoc.
- Front matter with `title` and `about` (the assistant's index shows both) and optionally `tags`; `access: [role, …]` restricts the whole document to signed roles. See [front-matter.md](references/front-matter.md).
- Headings written as the questions people ask: the assistant picks a section by its heading, then answers from the text under it. Each section should answer on its own.
- To restrict one section, wrap it, heading included, in `{% access roles=["owner"] %}` … `{% /access %}` on their own lines. See [access-tags.md](references/access-tags.md). A broken tag hides what it covers rather than showing it to the wrong people.

## Steps

1. **Check the plan.** Sync through the management API needs Professional or Enterprise; on other plans every call answers `403` `plan_limit_reached`, and the developer uploads on the Knowledge page instead. The document cap applies on every plan ([limits.md](references/limits.md)).
2. **Get the secret key** from the Configuration page, Keys tab ("New secret key"; shown once). It goes into the CI's secrets as `OPEM_SECRET_KEY`, never into the repository or a chat.
3. **Add the sync script.** Copy `scripts/sync-docs.mjs` into the repository (for example `scripts/opem-sync.mjs`) and `npm install --save-dev @opem/node`. It reads `DOCS_DIR` (default `docs`), sends every document under it, and prunes documents that are gone when run with `--prune`. The TypeScript version the docs show is in [sync-script.md](references/sync-script.md).
4. **Run it once locally** with the key in the environment and no `--prune`, and check the Knowledge page lists the documents as synced. Synced documents are read-only in the dashboard's editor: the repository wins.
5. **Add the workflow** from [github-action.md](references/github-action.md): on every push to the default branch that touches the docs, with `--prune` only there, so a branch build never deletes a document.
6. **Tag by role when needed:** the roles come from the signed identity (the `identify` skill). Until documents carry `access`, roles change nothing.

## What the sync does

New paths are added, changed ones updated, unchanged ones left alone; with prune, synced documents whose paths were not sent are removed. Documents uploaded or written in the dashboard are never pruned; a sync to a path one of them uses takes it over. The result names any document whose tags were refused and the line.

## With Opem connected

When the Opem MCP server is connected, `sync_knowledge_documents` sends documents by path from the editor on every plan within the document cap, without a secret key: the agent reads the files, sends `{ path, content }` for each and reads back each document's status and parse issues. `prune` still needs Professional or Enterprise, and the CI workflow above remains the way to keep a repository and Opem in step on every push. `add_crawl_source` points the assistant at a public site or sitemap instead.

## References

- [front-matter.md](references/front-matter.md): Markdoc front matter, sections and the `access` tag
- [access-tags.md](references/access-tags.md): restricting documents and sections to roles, as the help article explains it
- [sync-script.md](references/sync-script.md): the sync script and the management client
- [github-action.md](references/github-action.md): the workflow that syncs on every merge
- [limits.md](references/limits.md): sync call limits, the document caps per plan and the management API's plans
