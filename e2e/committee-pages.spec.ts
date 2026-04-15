import { test, expect } from "@playwright/test";
import { waitForAuthRedirect } from "./utils";

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
});
