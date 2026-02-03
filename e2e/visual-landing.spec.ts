import { test, expect } from "@playwright/test";

/**
 * Visual verification tests for landing page - Production Only
 * Tests run against https://starkscholars.com
 */

test.describe("Landing Page Visual Verification - Production", () => {
  const PROD_URL = "https://starkscholars.com/";

  test("Desktop - Full page screenshot", async ({ page }) => {
    await page.goto(PROD_URL);
    await page.waitForLoadState("networkidle");
    
    // Wait for images to load
    await page.waitForSelector("img[src*='SS-LOGO1.png']", { timeout: 10000 });
    await page.waitForSelector("img[src*='simage1.jpeg']", { timeout: 10000 });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: "test-results/landing-desktop-full.png",
      fullPage: true 
    });
    
    // Verify key elements are visible
    await expect(page.locator("h1:has-text('Invest in Your')")).toBeVisible();
    await expect(page.locator("text=Start Your Application").first()).toBeVisible();
    await expect(page.locator("text=About the Program")).toBeVisible();
    
    // Verify images loaded
    const logo = page.locator("img[src*='SS-LOGO1.png']").first();
    await expect(logo).toBeVisible();
    
    console.log("✅ Desktop screenshot saved");
  });

  test("Mobile - Full page screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(PROD_URL);
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({ 
      path: "test-results/landing-mobile-full.png",
      fullPage: true 
    });
    
    // Check mobile elements
    await expect(page.locator("text=Apply Now").first()).toBeVisible();
    
    console.log("✅ Mobile screenshot saved");
  });

  test("Tablet - Full page screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(PROD_URL);
    await page.waitForLoadState("networkidle");
    
    await page.screenshot({ 
      path: "test-results/landing-tablet-full.png",
      fullPage: true 
    });
    
    console.log("✅ Tablet screenshot saved");
  });

  test("Verify all sections render", async ({ page }) => {
    await page.goto(PROD_URL);
    await page.waitForLoadState("networkidle");
    
    // Hero section
    await expect(page.locator("text=Invest in Your Educational Future")).toBeVisible();
    
    // Stats
    await expect(page.locator("text=$500")).toBeVisible();
    await expect(page.locator("text=April 15")).toBeVisible();
    
    // Eligibility section
    await expect(page.locator("text=Eligibility Requirements")).toBeVisible();
    await expect(page.locator("text=Michigan Resident")).toBeVisible();
    await expect(page.locator("text=3.0+ GPA")).toBeVisible();
    
    // CTA section
    await expect(page.locator("text=Ready to Apply?")).toBeVisible();
    
    // Footer
    await expect(page.locator("text=Privacy Policy")).toBeVisible();
    
    console.log("✅ All sections verified");
  });

  test("All images load correctly", async ({ page }) => {
    await page.goto(PROD_URL);
    await page.waitForLoadState("networkidle");
    
    // Wait for all images to load
    const images = [
      "SS-LOGO1.png",
      "simage1.jpeg",
      "simage2.jpeg",
      "simage3.jpeg",
      "simage4.jpeg",
      "simage5.jpeg",
      "simag6.jpeg"
    ];
    
    for (const img of images) {
      const locator = page.locator(`img[src*='${img}']`).first();
      await expect(locator, `Image ${img} should be visible`).toBeVisible();
      console.log(`✅ ${img} loaded`);
    }
  });

  test("Navigation links work", async ({ page }) => {
    await page.goto(PROD_URL);
    await page.waitForLoadState("networkidle");
    
    // Click Apply Now and verify navigation
    await page.click("text=Apply Now");
    await page.waitForURL("**/register");
    expect(page.url()).toContain("/register");
    
    console.log("✅ Navigation works");
  });
});
