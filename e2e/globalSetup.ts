// Playwright globalSetup — runs ONCE before all test workers start, against
// the local dev server (already booted by the `webServer` config). Hits each
// route so Turbopack compiles them upfront. Without this, 8 parallel workers
// race the same cold-compile and authenticated tests time out at signInAs.
//
// Each request waits for `domcontentloaded` (not `load` — the Convex
// WebSocket prevents `load` from firing reliably). Failures are warnings
// rather than fatal: an unauthenticated `/admin` route 302s to `/login`,
// which still triggers compilation of both pages.

import { chromium, type FullConfig } from "@playwright/test";

const ROUTES_TO_WARM = [
  "/login",
  "/register",
  "/forgot-password",
  "/admin",
  "/admin/applications",
  "/admin/selection",
  "/admin/settings",
  "/admin/committee",
  "/admin/users",
  "/admin/emails",
  "/admin/analytics",
  "/committee",
  "/committee/candidates",
  "/committee/results",
  "/committee/my-evaluations",
  "/unauthorized",
] as const;

const PER_ROUTE_TIMEOUT = 90_000;

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL =
    config.projects[0]?.use?.baseURL ||
    process.env.PLAYWRIGHT_BASE_URL ||
    "http://localhost:3000";

  console.log(`[globalSetup] Pre-warming ${ROUTES_TO_WARM.length} routes at ${baseURL}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Suppress page-level console noise so the test output is readable.
  page.on("console", () => {});
  page.on("pageerror", () => {});

  let okCount = 0;
  let failCount = 0;

  for (const route of ROUTES_TO_WARM) {
    const start = Date.now();
    try {
      await page.goto(`${baseURL}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: PER_ROUTE_TIMEOUT,
      });
      const elapsed = Date.now() - start;
      console.log(`[globalSetup] ✓ ${route} (${elapsed}ms)`);
      okCount++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[globalSetup] ⚠ ${route} — ${msg.split("\n")[0]}`);
      failCount++;
    }
  }

  await browser.close();
  console.log(`[globalSetup] Done. ${okCount} warmed, ${failCount} failed/skipped.`);
}
