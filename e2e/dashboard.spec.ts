import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (will redirect to login if not authenticated)
    await page.goto("/apply/dashboard");
  });

  test("should display dashboard layout correctly @desktop", async ({ page }) => {
    // Check header
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("text=Stark Scholars")).toBeVisible();
    
    // Check navigation links
    await expect(page.locator("nav >> text=Dashboard")).toBeVisible();
    await expect(page.locator("nav >> text=Application")).toBeVisible();
    await expect(page.locator("nav >> text=Status")).toBeVisible();
  });

  test("should show welcome message for new users", async ({ page }) => {
    // Check for welcome content
    await expect(page.locator("h1")).toContainText(/Welcome|Dashboard/i);
  });

  test("should display progress overview card", async ({ page }) => {
    const progressCard = page.locator("text=Application Progress").first();
    await expect(progressCard).toBeVisible();
    
    // Check for progress bar
    const progressBar = page.locator("[role='progressbar'], .progress, [class*='progress']").first();
    await expect(progressBar).toBeVisible();
  });

  test("should show deadline reminder", async ({ page }) => {
    await expect(page.locator("text=/Deadline|April 15/i")).toBeVisible();
  });

  test("should have 7 step cards", async ({ page }) => {
    // Count step cards
    const stepCards = page.locator("a[href*='/apply/step/']");
    await expect(stepCards).toHaveCount(7);
  });

  test("should navigate to step pages when clicking cards", async ({ page }) => {
    // Click first step
    await page.click("a[href='/apply/step/1']");
    await expect(page).toHaveURL(/.*\/apply\/step\/1/);
    await expect(page.locator("text=Personal Information")).toBeVisible();
  });

  test("should be responsive @mobile", async ({ page }) => {
    // Mobile viewport is set in playwright config
    await page.goto("/apply/dashboard");
    
    // Check that content is still accessible
    await expect(page.locator("h1")).toBeVisible();
    
    // Navigation should adapt (either hidden in menu or stacked)
    const nav = page.locator("header nav, nav").first();
    await expect(nav).toBeVisible();
  });

  test("should show correct step status indicators", async ({ page }) => {
    // Check for status indicators (checkmarks, circles, etc.)
    const statusIcons = page.locator("[data-testid='step-status'], svg").first();
    await expect(statusIcons).toBeVisible();
  });
});
