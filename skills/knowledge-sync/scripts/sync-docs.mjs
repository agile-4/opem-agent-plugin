#!/usr/bin/env node
// Syncs a directory of Markdown or Markdoc documents to an Opem project through the management API.
// A template to copy into your repository; it needs @opem/node (0.1.1 or later prints the API's
// own sentence when a sync is refused) and Node.js 20 or later.
//
//   OPEM_SECRET_KEY=sk_… node sync-docs.mjs            # add and update, never remove
//   OPEM_SECRET_KEY=sk_… node sync-docs.mjs --prune    # also remove synced documents that are gone
//
// Run it from the repository root; each document's path in Opem is its path from there, so a
// document synced from the editor and by the script are the same document. DOCS_DIR (default
// "docs") is the directory to send, relative to the repository root.
import { readdir, readFile, realpath } from "node:fs/promises";
import { isAbsolute, posix, sep } from "node:path";

const secretKey = process.env.OPEM_SECRET_KEY;
if (!secretKey?.startsWith("sk_")) {
  console.error(
    "OPEM_SECRET_KEY must be set to the project's secret key (sk_…), from the Configuration page.",
  );
  process.exit(2);
}
const given = process.env.DOCS_DIR ?? "docs";
if (isAbsolute(given)) {
  console.error(
    `DOCS_DIR must be relative to the repository root, such as "docs", not ${given}: a document's path in Opem is its path from the root.`,
  );
  process.exit(2);
}
// "./docs/" and "docs" are the same directory, so each document has one path whichever is set.
const docsDir = posix.normalize(given.split(sep).join("/")).replace(/\/+$/, "");
if (docsDir === ".." || docsDir.startsWith("../")) {
  console.error(`DOCS_DIR must be inside the repository, not ${given}.`);
  process.exit(2);
}
// A docs folder that is a link to somewhere outside the repository would sync whatever it points
// at, so it is refused too; a missing folder is reported below as "No documents".
const root = await realpath(process.cwd());
const real = await realpath(docsDir).catch(() => null);
if (real !== null && real !== root && !real.startsWith(root + sep)) {
  console.error(`DOCS_DIR must be inside the repository: ${given} points outside it.`);
  process.exit(2);
}
const prune = process.argv.includes("--prune");

// Imported after the checks above, so a missing key or directory is reported before a missing
// dependency is: `npm install --save-dev @opem/node` if this line fails.
const { createManagementClient, SyncError, syncDocuments } = await import("@opem/node");
const opem = createManagementClient({ secretKey });

const DOCUMENT = /\.(md|mdoc|markdoc)$/;
const entries = await readdir(docsDir, { recursive: true, withFileTypes: true }).catch(() => []);
const documents = [];
for (const entry of entries) {
  if (!entry.isFile() || !DOCUMENT.test(entry.name)) continue;
  // parentPath is the directory as read, DOCS_DIR included (`path` before Node.js 20.12), so the
  // file's path from the repository root is its path in Opem: docs/billing/refunds.md.
  const file = posix.join((entry.parentPath ?? entry.path).split(sep).join("/"), entry.name);
  documents.push({ path: file, file });
}
if (documents.length === 0) {
  console.error(`No documents under ${docsDir}.`);
  process.exit(1);
}
documents.sort((a, b) => (a.path < b.path ? -1 : 1));

let results;
try {
  results = await syncDocuments(
    opem,
    await Promise.all(
      documents.map(async ({ path, file }) => ({ path, content: await readFile(file, "utf8") })),
    ),
    { prune },
  );
} catch (error) {
  // A refusal says its status, code and request id, and for a 4xx the API's own sentence.
  console.error(error instanceof SyncError ? error.message : String(error?.message ?? error));
  process.exit(1);
}

// One line per document written, with the title Opem stored, so a derived title can be judged.
const counts = { created: 0, updated: 0, unchanged: 0, pruned: 0 };
for (const result of results) {
  counts[result.status] = (counts[result.status] ?? 0) + 1;
  if (result.status === "created" || result.status === "updated") {
    console.log(`${result.status} ${result.path}${result.title ? `: "${result.title}"` : ""}`);
  }
}
const inSync = results.length - counts.pruned;
console.log(
  `${inSync} documents in sync: ${counts.created} created, ${counts.updated} updated, ${counts.unchanged} unchanged${prune ? `, ${counts.pruned} pruned` : ""}`,
);
