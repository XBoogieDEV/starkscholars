import { test, expect } from "@playwright/test";

/**
 * Visual verification tests for landing page
 */

test.describe("Landing Page Visual Verification", () => {
  test("Desktop - Full page screenshot", async ({ page }) => {
    await page.goto("https://starkscholars.com/");
    await page.waitForLoadState("networkidle");
    
    // Take full page screenshot
    await page.screenshot({ 
      path: "test-results/landing-desktop-full.png",
      fullPage: true 
    });
    
    // Verify key elements are visible
    await expect(page.locator("h1:has-text('Stark Scholars')")).toBeVisible();
    await expect(page.locator("text=Start Your Application").first()).toBeVisible();
    await expect(page.locator("text=About the Program")).toBeVisible();
    
    console.log("✅ Desktop screenshot saved");
  });

  test("Mobile - Full page screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("https://starkscholars.com/");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({ 
      path: "test-results/landing-mobile-full.png",
      fullPage: true 
    });
    
    // Check mobile menu button exists
    await expect(page.locator("text=Apply Now").first()).toBeVisible();
    
    console.log("✅ Mobile screenshot saved");
  });

  test("Tablet - Full page screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("https://starkscholars.com/");
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({ 
      path: "test-results/landing-tablet-full.png",
      fullPage: true 
    });
    
    console.log("✅ Tablet screenshot saved");
  });

  test("Verify all sections render", async ({ page }) => {
    await page.goto("https://starkscholars.com/");
    await page.waitForLoadState("networkidle");
    
    // Hero section
    await expect(page.locator("text=Empowering Michigan students")).toBeVisible();
    
    // Stats
    await expect(page.locator("text=$500")).toBeVisible();
    await expect(page.locator("text=April 15")).toBeVisible();
    
    // Eligibility section
    await expect(page.locator("text=Eligibility Requirements")).toBeVisible();
    await expect(page.locator("text=Michigan Resident")).toBeVisible();
    await expect(page.locator("text=Minimum 3.0 GPA")).toBeVisible();
    
    // CTA section
    await expect(page.locator("text=Ready to Apply?")).toBeVisible();
    
    // Footer
    await expect(page.locator("text=Privacy Policy")).toBeVisible();
    
    console.log("✅ All sections verified");
  });

  test("Navigation links work", async ({ page }) => {
    await page.goto("https://starkscholars.com/");
    await page.waitForLoadState("networkidle");
    
    // Click Apply Now and verify navigation
    await page.click("text=Apply Now");
    await page.waitForURL("**/register");
    expect(page.url()).toContain("/register");
    
    console.log("✅ Navigation works");
  });
});
