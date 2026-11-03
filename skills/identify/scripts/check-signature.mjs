#!/usr/bin/env node
// Recomputes Opem's identity signature so a server's output can be compared line by line, and
// checks the known-answer vectors in ../references/identity-vectors.json.
//
//   node check-signature.mjs --vectors
//   OPEM_VERIFICATION_SECRET=vs_… node check-signature.mjs <id> [email] [roles, comma-separated] [signedAt]
//
// The secret comes from the environment, never from the command line, so it stays out of shell
// history and agent transcripts.
//
// The string signed is the id, a newline and the lower-cased email (nothing after the newline
// without an email); with roles, a newline, the roles sorted and comma-joined, a newline and
// signedAt. HMAC-SHA256 with the verification secret, as lowercase hex.
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function canonical({ id, email, roles, signedAt }) {
  let text = `${id}\n${(email ?? "").toLowerCase()}`;
  const sorted = [...(roles ?? [])].sort();
  if (sorted.length > 0) {
    if (signedAt === undefined || signedAt === null)
      throw new Error("signedAt is needed with roles");
    text += `\n${sorted.join(",")}\n${signedAt}`;
  }
  return text;
}

export function sign(identity, secret) {
  return createHmac("sha256", secret).update(canonical(identity), "utf8").digest("hex");
}

const args = process.argv.slice(2);
if (args[0] === "--vectors") {
  const path = join(dirname(fileURLToPath(import.meta.url)), "../references/identity-vectors.json");
  const { secret, vectors } = JSON.parse(readFileSync(path, "utf8"));
  let failed = 0;
  for (const vector of vectors) {
    const actual = sign(vector, secret);
    const ok = actual === vector.signature;
    if (!ok) failed += 1;
    console.log(`${ok ? "ok  " : "FAIL"} ${JSON.stringify(canonical(vector))} -> ${actual}`);
  }
  console.log(failed === 0 ? `${vectors.length} vectors pass` : `${failed} vector(s) fail`);
  process.exit(failed === 0 ? 0 : 1);
}

const [id, email, roles, signedAt] = args;
const secret = process.env.OPEM_VERIFICATION_SECRET;
if (!id) {
  console.error("usage: check-signature.mjs --vectors | <id> [email] [roles,comma] [signedAt]");
  process.exit(2);
}
if (!secret) {
  console.error(
    "Set OPEM_VERIFICATION_SECRET in the environment; the secret is never passed on the command line.",
  );
  process.exit(2);
}
const identity = {
  id,
  email: email && email !== "-" ? email : null,
  roles: roles ? roles.split(",").filter(Boolean) : [],
  signedAt: signedAt ? Number(signedAt) : undefined,
};
console.log(`string:    ${JSON.stringify(canonical(identity))}`);
console.log(`signature: ${sign(identity, secret)}`);
