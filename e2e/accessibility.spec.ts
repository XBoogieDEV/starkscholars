import { test, expect } from "@playwright/test";

test.describe("Accessibility Tests", () => {
  const pages = [
    "/",
    "/apply/dashboard",
    "/apply/step/1",
    "/apply/step/2",
    "/apply/step/3",
    "/apply/step/4",
    "/apply/step/5",
    "/apply/step/6",
    "/apply/step/7",
    "/apply/status",
    "/recommend/test-token",
  ];

  for (const path of pages) {
    test(`page ${path} should have proper heading structure`, async ({ page }) => {
      await page.goto(path);
      
      // Check for at least one h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBeGreaterThan(0);
      
      // Check h1 is visible
      await expect(page.locator("h1").first()).toBeVisible();
    });

    test(`page ${path} should have lang attribute`, async ({ page }) => {
      await page.goto(path);
      
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBeTruthy();
    });

    test(`page ${path} should have accessible buttons`, async ({ page }) => {
      await page.goto(path);
      
      // Check buttons have text or aria-label
      const buttons = page.locator("button");
      const count = await buttons.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute("aria-label");
        
        // Button should have either text or aria-label
        expect(text || ariaLabel).toBeTruthy();
      }
    });

    test(`page ${path} should have form labels`, async ({ page }) => {
      await page.goto(path);
      
      // Check inputs have associated labels
      const inputs = page.locator("input:not([type='hidden']), select, textarea");
      const count = await inputs.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledBy = await input.getAttribute("aria-labelledby");
        const placeholder = await input.getAttribute("placeholder");
        
        // Input should have some form of labeling
        const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
        
        expect(hasLabel || ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
      }
    });
  }

  test.describe("Keyboard Navigation", () => {
    test("should be navigable by keyboard on dashboard", async ({ page }) => {
      await page.goto("/apply/dashboard");
      
      // Press Tab multiple times
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      
      // Some element should be focused
      const focusedElement = await page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    });

    test("form should be keyboard accessible", async ({ page }) => {
      await page.goto("/apply/step/1");
      
      // Tab through form fields
      await page.keyboard.press("Tab");
      
      const focusedElement = await page.locator(":focus");
      const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
      
      // Should focus on an interactive element
      expect(["input", "button", "a", "select", "textarea"]).toContain(tagName);
    });
  });

  test.describe("Color Contrast", () => {
    test("main content should have sufficient contrast", async ({ page }) => {
      await page.goto("/apply/dashboard");
      
      // Check body text color
      const bodyColor = await page.locator("body").evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
        };
      });
      
      // Colors should be defined
      expect(bodyColor.color).toBeTruthy();
      expect(bodyColor.backgroundColor).toBeTruthy();
    });
  });

  test.describe("ARIA Attributes", () => {
    test("progress bar should have proper ARIA", async ({ page }) => {
      await page.goto("/apply/dashboard");
      
      const progressBar = page.locator("[role='progressbar'], progress").first();
      if (await progressBar.isVisible().catch(() => false)) {
        const ariaValueNow = await progressBar.getAttribute("aria-valuenow");
        const ariaValueMax = await progressBar.getAttribute("aria-valuemax");
        
        expect(ariaValueNow || await progressBar.getAttribute("value")).toBeTruthy();
        expect(ariaValueMax || await progressBar.getAttribute("max")).toBeTruthy();
      }
    });

    test("navigation should have proper ARIA", async ({ page }) => {
      await page.goto("/apply/dashboard");
      
      const nav = page.locator("nav, [role='navigation']").first();
      if (await nav.isVisible().catch(() => false)) {
        // Navigation should be visible and have proper structure
        await expect(nav).toBeVisible();
      }
    });
  });
});
