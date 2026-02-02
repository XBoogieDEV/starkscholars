import { test, expect } from "@playwright/test";

/**
 * Smoke tests to verify basic connectivity and page loading
 * Run these first to ensure the application is running
 */
test.describe("Smoke Tests", () => {
  test("landing page should be accessible", async ({ page }) => {
    await page.goto("/");
    
    // Basic check that page loaded
    await expect(page).toHaveTitle(/Stark Scholars|Create Next App/i);
    
    // Check that body exists
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have correct viewport meta tag", async ({ page }) => {
    await page.goto("/");
    
    const viewport = await page.locator("meta[name='viewport']").getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });

  test("should load without console errors", async ({ page }) => {
    const errors: string[] = [];
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Filter out expected errors (e.g., from extensions)
    const criticalErrors = errors.filter(
      (e) => !e.includes("extension") && !e.includes("favicon")
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
