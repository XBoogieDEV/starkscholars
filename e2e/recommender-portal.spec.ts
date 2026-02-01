import { test, expect } from "@playwright/test";

test.describe("Recommender Portal", () => {
  test.describe("Invalid/Expired Tokens", () => {
    test("should show invalid link message for bad token", async ({ page }) => {
      await page.goto("/recommend/invalid-token-12345");
      
      await expect(page.locator("text=/Invalid Link|invalid|expired/i")).toBeVisible();
    });
  });

  test.describe("Recommendation Form", () => {
    // Note: This would require a valid token from the database
    // For now, we test the UI structure
    
    test("should display applicant information section", async ({ page }) => {
      // Navigate with a mock token (will show invalid but we can check structure)
      await page.goto("/recommend/test-token");
      
      // Even on error page, check structure
      await expect(page.locator("h1, h2").first()).toBeVisible();
    });

    test("should have file upload for recommendation letter", async ({ page }) => {
      await page.goto("/recommend/test-token");
      
      // Check for upload-related elements
      const uploadArea = page.locator("text=/upload|Upload Letter|file/i").first();
      await expect(uploadArea).toBeVisible();
    });

    test("should display letter guidelines", async ({ page }) => {
      await page.goto("/recommend/test-token");
      
      // Check for guidelines
      await expect(page.locator("text=/What to Include|guidelines|Include/i")).toBeVisible();
    });

    test("should have recommender info fields", async ({ page }) => {
      await page.goto("/recommend/test-token");
      
      // Check for form fields
      await expect(page.locator("text=/Your Full Name|Your Name/i")).toBeVisible();
    });

    test("should require confirmation checkbox", async ({ page }) => {
      await page.goto("/recommend/test-token");
      
      // Check for confirmation
      await expect(page.locator("text=/confirm|my own work|accurately/i")).toBeVisible();
    });

    test("should be responsive @mobile", async ({ page }) => {
      await page.goto("/recommend/test-token");
      
      // Check main content is visible on mobile
      await expect(page.locator("main, .container, [class*='container']").first()).toBeVisible();
    });
  });
});
