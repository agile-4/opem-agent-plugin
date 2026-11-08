---
name: knowledge-sync
description: "Use when the developer wants Opem's assistant to answer from documentation kept in their repository: Markdoc or Markdown documents, front matter, access tags for roles, syncDocuments from @opem/node, PUT /api/v1/manage/knowledge/documents, a GitHub Actions workflow that syncs on every merge, or plan_limit_reached on a sync."
---

# Sync documentation from the repository

The assistant answers only from the project's knowledge documents. A sync sends the repository's Markdown or Markdoc files to the project by path through the management API, so the docs people already keep become the answers in the Help widget, and stay current with every merge.

**What a sync through the agent costs.** `sync_knowledge_documents` carries each file's whole content in the call, so every byte of every file passes through the agent's context twice, once read and once sent: a 440 KB docs folder is about 220,000 tokens. Say so to the developer before starting. Send a handful of files this way, up to about 100 KB in all. For a folder, the sync script (steps 3 to 6) is the way on every plan: it reads the files itself, so none of them passes through the agent, and CI keeps them in step on every merge. Offer it; set it up only when the developer chooses it. The developer can also upload the folder on the project's Knowledge page.

## First: is Opem connected?

Look for the Opem tools (`whoami`, `list_projects`). If the only Opem tool is `authenticate`, call it now and wait for the developer to sign in and consent; then call `whoami`. Only when the server cannot be connected, follow the dashboard path below.

## Stop at the chosen step

Do the steps the developer chose (their answers to the how-far questions the `onboard` and `install` skills ask, or what they asked for) and no further. When the next step would add a dependency, a file to the repository, a key, a workflow or a switch they did not ask for, name it as the next offer and stop. If nothing has been chosen yet, ask before the first such step.

## What a document needs

- A file ending `.md`, `.mdoc` or `.markdoc`, up to 512 KB. Plain Markdown is valid Markdoc.
- Front matter is optional. The assistant's index shows a `title` and an `about`; when the front matter has none, Opem derives them, the title from the first heading (else the file name) and the about from the first paragraph. Each document in the sync result carries the `title` and `about` Opem stored, derived or given (none on a pruned one), and `derived` names what Opem derived; `sync_knowledge_documents` also names each derived title in its text. So send files as they are and do not invent front matter; read `title` and `about` in the result and add front matter only where they read badly. `tags` is optional; `access: [role, …]` restricts the whole document to signed roles. See [front-matter.md](references/front-matter.md).
- Headings written as the questions people ask: the assistant picks a section by its heading, then answers from the text under it. Each section should answer on its own.
- Real headings, not bold lines. A line that is only bold text (`**Billing**`) is a paragraph to Markdoc, so a document headed that way reaches the assistant as one block. Convert each to a `##` heading (`## Billing`) in the repository's file before syncing, so later syncs keep it.
- To restrict one section, wrap it, heading included, in `{% access roles=["owner"] %}` … `{% /access %}` on their own lines. See [access-tags.md](references/access-tags.md). A broken tag hides what it covers rather than showing it to the wrong people.

## Steps

1. **Check the assistant, then the plan.** `get_install_status` first: when `assistantReady` is false, stop and tell the developer why (`assistantReason`) and who fixes it before syncing anything, since synced documents answer nothing until then: `platform_key_missing` is the deployment operator's (Opem's model key is not configured there; the project can answer with its own key meanwhile), `own_key_missing` and `own_key_unreadable` are the project's Assistant page, and `mock_not_allowed` means choosing Opem's key or an own key there. Go on only if the developer wants the documents in place before then. Then `get_plan`: `documents` gives the cap against its use, which applies on every plan, and `managementApi` says whether `prune` is available (Professional and Enterprise; [limits.md](references/limits.md)).
2. **A handful of files from the editor.** For a few small files, `sync_knowledge_documents` sends documents by path on every plan within the document cap, without a secret key. Send each document's path from the repository root (`docs/billing.md`, not `billing.md` or `./docs/billing.md`): the sync script sends the same path, so the editor and the script name the same document and never make a duplicate. Read the files and send their content as it is, in one call:

   ```json
   {
     "projectId": "…",
     "sync": {
       "documents": [{ "path": "docs/billing.md", "content": "# Billing\n\n…" }],
       "prune": false,
       "keepPaths": []
     }
   }
   ```

   Read back each document's `status`, its parse issues (fix the line a refused tag names), and its `title` and `about`: those are the text to judge, and front matter is added only where they read badly. `prune` needs Professional or Enterprise. On Free and Basic the agent cannot take a document back: there is no `prune` and no tool that deletes a document, so a duplicate or a stale one is removed on the project's Knowledge page. Check every path before sending. `add_crawl_source` points the assistant at a public site or sitemap instead. For a folder, offer step 3 onwards; go on only when the developer chose the script or CI.
3. **A secret key for the script and CI, on every plan.** `create_key` for a secret key, which needs the connection's `keys` permission, returns it once. Write it to a git-ignored local environment file in the same step and never echo it; the developer adds it to the CI's secrets as `OPEM_SECRET_KEY`, never to the repository or a chat. On Free and Basic the key reaches the sync only, without `--prune`; every other management API call answers `403` `plan_limit_reached`.
4. **Add the sync script.** Copy `scripts/sync-docs.mjs` into the repository (for example `scripts/opem-sync.mjs`) and `npm install --save-dev @opem/node`. It needs Node.js 20 or later and `@opem/node` 0.1.1 or later (0.1.0 syncs, but a refusal then lacks Opem's sentence), and is run from the repository root. It reads `DOCS_DIR` (default `docs`), relative to the repository root, sends every document under it by its path from the root (`docs/billing.md`, the path step 2 sends, so the same file is one document whichever way it is synced), and prunes documents that are gone when run with `--prune`. It refuses an absolute `DOCS_DIR`, or one outside the repository such as `../docs`, before sending anything. The TypeScript version the docs show is in [sync-script.md](references/sync-script.md).
5. **Run it once locally** from the repository root, with the key in the environment and no `--prune`. It prints a line for each document it created or updated, with its title (`created docs/billing.md: "Billing"`): those titles, and the `title` and `about` in the sync result, are the text to judge, and front matter is added only where they read badly. When the API refuses a batch it prints one line with the API's sentence and the request id and exits 1, for example `Batch 1 of the sync was refused: 403 plan_limit_reached: This sync would take the account to 24 documents; the plan allows 20 (request req_…)`: read the sentence to the developer. A `5xx` prints only its code and request id (`500 internal (request req_…)`): quote the request id to support. Synced documents are read-only in the dashboard's editor: the repository wins.
6. **Add the workflow** when the developer chose CI (after a local run alone, offer it and stop), from [github-action.md](references/github-action.md): on every push to the default branch that touches the docs, with `--prune` only there on Professional and Enterprise, so a branch build never deletes a document. On Free and Basic leave `--prune` out (it is refused with `plan_limit_reached`); a document removed from the repository is then deleted on the Knowledge page.
7. **Tag by role when the developer asks:** the roles come from the identity (the `identify` skill). Until documents carry `access`, roles change nothing. Limiting documents to roles is a Professional and Enterprise feature: on Free or Basic a sync still stores the tags, and the material they cover is hidden from every answer until the plan has it.

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
