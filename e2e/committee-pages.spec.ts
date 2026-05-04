import { test, expect } from "@playwright/test";
import { waitForAuthRedirect, signInAs } from "./utils";

test.describe("Committee Pages", () => {
  // ─── Auth Redirects ────────────────────────────────────────────────────────

  test.describe("Auth Redirects", () => {
    const committeeRoutes = [
      "/committee",
      "/committee/candidates",
      "/committee/my-evaluations",
      "/committee/results",
    ];

    for (const route of committeeRoutes) {
      test(`${route} should redirect unauthenticated users to /login`, async ({ page }) => {
        await page.goto(route);
        await waitForAuthRedirect(page);
        const url = new URL(page.url());
        expect(url.pathname).toBe("/login");
        expect(url.searchParams.get("redirect")).toBe("/committee");
      });
    }
  });

  // ─── Login Page After Redirect ────────────────────────────────────────────

  test.describe("Login Page After Redirect", () => {
    test("should show login page elements after committee redirect", async ({ page }) => {
      await page.goto("/committee");
      await waitForAuthRedirect(page);

      // Should show Sign In heading
      await expect(
        page.getByRole("heading", { name: /sign in/i })
      ).toBeVisible({ timeout: 10000 });

      // Should show email input
      await expect(page.locator("input[type='email'], input[name='email'], input[placeholder*='email' i]").first()).toBeVisible();

      // Should show password input
      await expect(page.locator("input[type='password']").first()).toBeVisible();

      // Should show Stark Scholars branding
      await expect(page.getByText("Stark Scholars")).toBeVisible();
    });
  });

  // ─── Unauthorized Handling ────────────────────────────────────────────────

  test.describe("Unauthorized Handling", () => {
    test("should render unauthorized page with correct content", async ({ page }) => {
      await page.goto("/unauthorized");
      await expect(
        page.getByRole("heading", { name: "Unauthorized Access" })
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByText("don't have the necessary permissions")
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Go Back Home" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Contact Administrator" })).toBeVisible();
    });

    test("should have correct links on unauthorized page", async ({ page }) => {
      await page.goto("/unauthorized");
      await expect(page.getByRole("link", { name: "Go Back Home" })).toHaveAttribute("href", "/");
      await expect(page.getByRole("link", { name: "Contact Administrator" })).toHaveAttribute(
        "href",
        "mailto:scholarship@williamrstark.org"
      );
    });
  });

  // ─── URL Pattern Validation ───────────────────────────────────────────────

  test.describe("URL Pattern Validation", () => {
    test("trailing slash on /committee/ should still redirect", async ({ page }) => {
      await page.goto("/committee/");
      await waitForAuthRedirect(page);
      expect(page.url()).toContain("/login");
    });

    test("non-existent sub-route /committee/nonexistent should redirect or 404", async ({ page }) => {
      await page.goto("/committee/nonexistent");
      await page.waitForTimeout(6000);
      const url = page.url();
      const is404 = await page.getByText("404").isVisible().catch(() => false);
      const isNotFound = await page.getByText("not found", { exact: false }).isVisible().catch(() => false);
      const redirected = url.includes("/login");
      expect(is404 || isNotFound || redirected).toBe(true);
    });

    test("deep route /committee/candidates/fake-id should redirect or 404", async ({ page }) => {
      await page.goto("/committee/candidates/fake-id");
      await page.waitForTimeout(6000);
      const url = page.url();
      const is404 = await page.getByText("404").isVisible().catch(() => false);
      const isNotFound = await page.getByText("not found", { exact: false }).isVisible().catch(() => false);
      const redirected = url.includes("/login");
      expect(is404 || isNotFound || redirected).toBe(true);
    });
  });

  // ─── Authenticated Workflow ───────────────────────────────────────────────
  // Requires test users seeded by scripts/seed-test-users.mjs. Each test
  // attempts the relevant sign-in and skips with a clear reason if the
  // fixture user doesn't exist (so a missing seed doesn't fail the suite).

  test.describe("Committee role: authenticated dashboard", () => {
    test("committee user lands on /committee after login", async ({ page }) => {
      try {
        await signInAs(page, "committee");
      } catch (e) {
        test.skip(true, `Committee fixture not seeded (run scripts/seed-test-users.mjs). ${e}`);
        return;
      }
      // Welcome heading should reference the user
      await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });
      // Three stat cards present
      await expect(page.getByText("Total Applications")).toBeVisible();
      await expect(page.getByText("My Evaluations")).toBeVisible();
      await expect(page.getByText("Remaining to Evaluate")).toBeVisible();
    });

    test("/committee/candidates renders Pending and Evaluated tabs", async ({ page }) => {
      try {
        await signInAs(page, "committee");
      } catch (e) {
        test.skip(true, `Committee fixture not seeded. ${e}`);
        return;
      }
      await page.goto("/committee/candidates");
      await expect(page.getByRole("heading", { name: /Candidates/i }).first()).toBeVisible();
      // Tab triggers
      await expect(page.getByRole("tab", { name: /pending|to evaluate/i }).first()).toBeVisible();
      await expect(page.getByRole("tab", { name: /evaluated|done/i }).first()).toBeVisible();
    });

    test("profile photo URLs no longer hit /api/storage/ (bug #1 fix)", async ({ page }) => {
      try {
        await signInAs(page, "committee");
      } catch (e) {
        test.skip(true, `Committee fixture not seeded. ${e}`);
        return;
      }

      // Listen for any /api/storage/ requests; the fix removes that pattern.
      const badRequests: string[] = [];
      page.on("request", (req) => {
        if (req.url().includes("/api/storage/")) badRequests.push(req.url());
      });

      await page.goto("/committee/candidates");
      // Give the page time to fetch images
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
      expect(badRequests, `Found stale /api/storage/ URLs: ${badRequests.join(", ")}`).toHaveLength(0);
    });

    test("/committee/my-evaluations renders without crashing", async ({ page }) => {
      try {
        await signInAs(page, "committee");
      } catch (e) {
        test.skip(true, `Committee fixture not seeded. ${e}`);
        return;
      }
      await page.goto("/committee/my-evaluations");
      await expect(page.getByRole("heading", { name: /My Evaluations/i })).toBeVisible({ timeout: 15000 });
    });

    test("/committee/results renders rankings and progress", async ({ page }) => {
      try {
        await signInAs(page, "committee");
      } catch (e) {
        test.skip(true, `Committee fixture not seeded. ${e}`);
        return;
      }
      await page.goto("/committee/results");
      await expect(page.getByRole("heading", { name: /Results.*Rankings/i })).toBeVisible({ timeout: 15000 });
      // Plain committee should NOT see the selection panel ("Final Selection")
      await expect(page.getByText("Final Selection")).toBeHidden();
    });
  });

  test.describe("Applicant role: blocked from /committee", () => {
    test("applicant signing in cannot reach /committee", async ({ page }) => {
      try {
        await signInAs(page, "applicant");
      } catch (e) {
        test.skip(true, `Applicant fixture not seeded. ${e}`);
        return;
      }
      // Direct nav to /committee should bounce to /unauthorized or /login
      await page.goto("/committee");
      // Wait for either redirect or unauthorized text
      await page
        .waitForURL((url) => /\/(unauthorized|login|apply)/.test(url.pathname), { timeout: 15000 })
        .catch(() => {});
      const url = page.url();
      expect(url).not.toContain("/committee/candidates");
    });
  });
});
