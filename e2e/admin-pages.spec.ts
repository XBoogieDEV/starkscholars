import { test, expect } from "@playwright/test";
import { waitForAuthRedirect } from "./utils";

test.describe("Admin Pages", () => {
  // ─── Auth Redirects ────────────────────────────────────────────────────────

  test.describe("Auth Redirects", () => {
    const adminRoutes = [
      "/admin",
      "/admin/applications",
      "/admin/committee",
      "/admin/selection",
      "/admin/users",
      "/admin/settings",
      "/admin/analytics",
      "/admin/emails",
    ];

    for (const route of adminRoutes) {
      test(`${route} should redirect unauthenticated users to /login`, async ({ page }) => {
        await page.goto(route);
        await waitForAuthRedirect(page);
        const url = new URL(page.url());
        expect(url.pathname).toBe("/login");
        expect(url.searchParams.get("redirect")).toBe("/admin");
      });
    }
  });

  // ─── Login Page After Redirect ────────────────────────────────────────────

  test.describe("Login Page After Redirect", () => {
    test("should show login page elements after admin redirect", async ({ page }) => {
      await page.goto("/admin");
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

  // ─── Unauthorized Page ────────────────────────────────────────────────────

  test.describe("Unauthorized Page", () => {
    test("should render 'Unauthorized Access' heading", async ({ page }) => {
      await page.goto("/unauthorized");
      await expect(
        page.getByRole("heading", { name: "Unauthorized Access" })
      ).toBeVisible({ timeout: 10000 });
    });

    test("should display description about lacking permissions", async ({ page }) => {
      await page.goto("/unauthorized");
      await expect(
        page.getByText("don't have the necessary permissions")
      ).toBeVisible({ timeout: 10000 });
    });

    test("should display shield icon", async ({ page }) => {
      await page.goto("/unauthorized");
      // The shield icon is rendered inside a red circular container
      const iconContainer = page.locator(".rounded-full.bg-red-100");
      await expect(iconContainer).toBeVisible({ timeout: 10000 });
    });

    test("should have 'Go Back Home' button with href='/'", async ({ page }) => {
      await page.goto("/unauthorized");
      const btn = page.getByRole("link", { name: "Go Back Home" });
      await expect(btn).toBeVisible({ timeout: 10000 });
      await expect(btn).toHaveAttribute("href", "/");
    });

    test("should have 'Contact Administrator' button with mailto link", async ({ page }) => {
      await page.goto("/unauthorized");
      const btn = page.getByRole("link", { name: "Contact Administrator" });
      await expect(btn).toBeVisible({ timeout: 10000 });
      await expect(btn).toHaveAttribute("href", "mailto:scholarship@williamrstark.org");
    });

    test("should display help text about contacting committee", async ({ page }) => {
      await page.goto("/unauthorized");
      await expect(
        page.getByText("contact the scholarship committee for assistance")
      ).toBeVisible({ timeout: 10000 });
    });

    test("'Go Back Home' should navigate to /", async ({ page }) => {
      await page.goto("/unauthorized");
      await page.getByRole("link", { name: "Go Back Home" }).click();
      await page.waitForURL("**/", { timeout: 10000 });
      // Should be at homepage
      expect(page.url()).toMatch(/\/$/);
    });
  });

  // ─── URL Pattern Validation ───────────────────────────────────────────────

  test.describe("URL Pattern Validation", () => {
    test("trailing slash on /admin/ should still redirect", async ({ page }) => {
      await page.goto("/admin/");
      await waitForAuthRedirect(page);
      expect(page.url()).toContain("/login");
    });

    test("non-existent sub-route /admin/nonexistent should redirect or 404", async ({ page }) => {
      await page.goto("/admin/nonexistent");
      // Either redirects to login or shows 404
      await page.waitForTimeout(6000);
      const url = page.url();
      const is404 = await page.getByText("404").isVisible().catch(() => false);
      const isNotFound = await page.getByText("not found", { exact: false }).isVisible().catch(() => false);
      const redirected = url.includes("/login");
      expect(is404 || isNotFound || redirected).toBe(true);
    });

    test("deep route /admin/applications/compare should redirect or 404", async ({ page }) => {
      await page.goto("/admin/applications/compare");
      await page.waitForTimeout(6000);
      const url = page.url();
      const is404 = await page.getByText("404").isVisible().catch(() => false);
      const isNotFound = await page.getByText("not found", { exact: false }).isVisible().catch(() => false);
      const redirected = url.includes("/login");
      expect(is404 || isNotFound || redirected).toBe(true);
    });
  });
});
