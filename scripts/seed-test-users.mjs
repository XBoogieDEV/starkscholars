#!/usr/bin/env node
// Seeds the four fixture accounts for e2e committee tests.
//
// Usage: node scripts/seed-test-users.mjs
//
// What it does:
//   1. Signs up four users via better-auth (/sign-up/email on the Convex site URL).
//   2. Promotes roles via Convex internal mutations (seedHelpers:seedSetRole / seedSetChair).
//
// Idempotent: skips signup if email already exists; always re-applies role/chair.
//
// Env required (read from .env.local):
//   NEXT_PUBLIC_CONVEX_SITE_URL  (e.g. https://necessary-orca-813.convex.site)
//
// Convex CLI must be authenticated against the same deployment so `npx convex run`
// targets the right one.

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Load .env.local manually (no dotenv dependency)
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

const SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
if (!SITE_URL) {
  console.error(
    "Missing NEXT_PUBLIC_CONVEX_SITE_URL in environment. Set in .env.local."
  );
  process.exit(1);
}

const PASSWORD = "TestPass-2026";

const FIXTURES = [
  { email: "test-admin@scholars.test", name: "Test Admin", role: "admin" },
  { email: "test-committee@scholars.test", name: "Test Committee", role: "committee" },
  { email: "test-chair@scholars.test", name: "Test Chair", role: "committee", chair: true },
  { email: "test-applicant@scholars.test", name: "Test Applicant", role: "applicant" },
];

async function signUp({ email, name }) {
  const res = await fetch(`${SITE_URL}/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD, name }),
  });
  if (res.ok) {
    console.log(`  ✓ signed up ${email}`);
    return { ok: true };
  }
  const text = await res.text();
  // Better-auth returns 422 / 400 with "User already exists" or similar
  if (
    res.status === 422 ||
    /exists|already/i.test(text)
  ) {
    console.log(`  • ${email} already exists, skipping signup`);
    return { ok: true, existed: true };
  }
  console.error(`  ✗ signup failed for ${email}: [${res.status}] ${text}`);
  return { ok: false, error: text };
}

function convexRun(fn, args) {
  const argString = JSON.stringify(args).replace(/"/g, '\\"');
  const cmd = `npx convex run ${fn} "${argString}"`;
  try {
    const out = execSync(cmd, { cwd: root, stdio: ["ignore", "pipe", "pipe"] }).toString();
    return { ok: true, out };
  } catch (e) {
    return {
      ok: false,
      error: e.stderr?.toString() || e.message,
    };
  }
}

async function main() {
  console.log(`Seeding test users against ${SITE_URL}\n`);
  for (const fx of FIXTURES) {
    console.log(`→ ${fx.email} (${fx.role}${fx.chair ? ", chair" : ""})`);
    const su = await signUp(fx);
    if (!su.ok) continue;

    // Promote role
    const role = fx.role;
    const setRole = convexRun("seedHelpers:seedSetRole", { email: fx.email, role });
    if (!setRole.ok) {
      console.error(`  ✗ seedSetRole failed: ${setRole.error.split("\n")[0]}`);
      continue;
    }
    console.log(`  ✓ role=${role}`);

    if (fx.chair) {
      const setChair = convexRun("seedHelpers:seedSetChair", {
        email: fx.email,
        isChairman: true,
        title: "Test Chair",
      });
      if (!setChair.ok) {
        console.error(`  ✗ seedSetChair failed: ${setChair.error.split("\n")[0]}`);
        continue;
      }
      console.log(`  ✓ isChairman=true`);
    } else if (fx.role === "committee") {
      const setMember = convexRun("seedHelpers:seedSetChair", {
        email: fx.email,
        isChairman: false,
        title: "Test Committee Member",
      });
      if (!setMember.ok) {
        console.error(`  ✗ committeeMembers seed failed: ${setMember.error.split("\n")[0]}`);
        continue;
      }
      console.log(`  ✓ committeeMembers row`);
    }
  }
  console.log("\nDone. Credentials: TestPass-2026 for all fixtures.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
