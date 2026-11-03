#!/usr/bin/env node
// Syncs a directory of Markdown or Markdoc documents to an Opem project through the management API.
// A template to copy into your repository; it needs @opem/node and Node.js 22 or later.
//
//   OPEM_SECRET_KEY=sk_… node sync-docs.mjs            # add and update, never remove
//   OPEM_SECRET_KEY=sk_… node sync-docs.mjs --prune    # also remove synced documents that are gone
//
// DOCS_DIR (default "docs") is the directory to send; each file's path under it is its path in Opem.
import { glob, readFile } from "node:fs/promises";

const secretKey = process.env.OPEM_SECRET_KEY;
if (!secretKey?.startsWith("sk_")) {
  console.error(
    "OPEM_SECRET_KEY must be set to the project's secret key (sk_…), from the Configuration page.",
  );
  process.exit(2);
}
const docsDir = process.env.DOCS_DIR ?? "docs";
const prune = process.argv.includes("--prune");

// Imported after the checks above, so a missing key or directory is reported before a missing
// dependency is: `npm install --save-dev @opem/node` if this line fails.
const { createManagementClient, syncDocuments } = await import("@opem/node");
const opem = createManagementClient({ secretKey });

const documents = [];
for await (const path of glob("**/*.{md,mdoc,markdoc}", { cwd: docsDir })) {
  documents.push({ path, content: await readFile(`${docsDir}/${path}`, "utf8") });
}
if (documents.length === 0) {
  console.error(`No documents under ${docsDir}.`);
  process.exit(1);
}

const results = await syncDocuments(opem, documents, { prune });
console.log(`${results.length} documents in sync${prune ? ", pruned" : ""}`);
