#!/usr/bin/env node
// Removes the four fixture e2e test users via the seedHelpers:seedDeleteUser
// internal mutation. Refuses non-test emails (server-side guard).
//
// Usage: node scripts/cleanup-test-users.mjs

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadDotEnv() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    if (process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadDotEnv();

const FIXTURES = [
  "test-admin@scholars.test",
  "test-committee@scholars.test",
  "test-chair@scholars.test",
  "test-applicant@scholars.test",
];

function convexRun(fn, args) {
  const argString = JSON.stringify(args).replace(/"/g, '\\"');
  const cmd = `npx convex run ${fn} "${argString}"`;
  try {
    const out = execSync(cmd, { cwd: root, stdio: ["ignore", "pipe", "pipe"] }).toString();
    return { ok: true, out };
  } catch (e) {
    return { ok: false, error: e.stderr?.toString() || e.message };
  }
}

for (const email of FIXTURES) {
  const r = convexRun("seedHelpers:seedDeleteUser", { email });
  if (r.ok) {
    console.log(`✓ deleted ${email}: ${r.out.trim()}`);
  } else {
    console.error(`✗ ${email}: ${r.error.split("\n")[0]}`);
  }
}
console.log("\nCleanup done.");
