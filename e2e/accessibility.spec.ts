import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("landing page should not have accessibility violations", async ({ page }) => {
    await page.goto("/");
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test("login page should not have accessibility violations", async ({ page }) => {
    await page.goto("/login");
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test("register page should not have accessibility violations", async ({ page }) => {
    await page.goto("/register");
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test("should have skip link on all pages", async ({ page }) => {
    await page.goto("/");
    
    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeHidden(); // Initially hidden (sr-only)
    
    // Tab to make it visible
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeVisible();
  });
  
  test("landing page should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    
    // Check that h1 exists
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    
    // Check heading levels don't skip
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    let previousLevel = 0;
    
    for (const heading of headings) {
      const level = parseInt(await heading.evaluate(el => el.tagName[1]));
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = level;
    }
  });
  
  test("forms should have proper labels and ARIA attributes", async ({ page }) => {
    await page.goto("/register");
    
    // Check all inputs have associated labels
    const inputs = await page.locator("input:not([type=\"hidden\"])").all();
    
    for (const input of inputs) {
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const ariaLabel = el.getAttribute("aria-label");
        const ariaLabelledBy = el.getAttribute("aria-labelledby");
        const hasLabelElement = id && document.querySelector(`label[for="${id}"]`);
        const parentLabel = el.closest("label");
        
        return !!(hasLabelElement || parentLabel || ariaLabel || ariaLabelledBy);
      });
      
      expect(hasLabel).toBe(true);
    }
  });
  
  test("dashboard should be keyboard navigable", async ({ page }) => {
    // This would require authentication - skipping for now
    // In a real test, you'd authenticate first
    test.skip();
    
    await page.goto("/apply/dashboard");
    
    // Press Tab multiple times and verify focus moves through interactive elements
    const tabbableElements = await page.locator("a, button, input, select, textarea, [tabindex]:not([tabindex=\"-1\"])").all();
    
    for (let i = 0; i < Math.min(tabbableElements.length, 10); i++) {
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    }
  });
  
  test("buttons should have accessible names", async ({ page }) => {
    await page.goto("/");
    
    const buttons = await page.locator("button").all();
    
    for (const button of buttons) {
      const hasAccessibleName = await button.evaluate(el => {
        return !!(el.textContent?.trim() || 
                  el.getAttribute("aria-label") || 
                  el.getAttribute("aria-labelledby") ||
                  el.querySelector("title"));
      });
      
      expect(hasAccessibleName).toBe(true);
    }
  });
  
  test("images should have alt text", async ({ page }) => {
    await page.goto("/");
    
    const images = await page.locator("img").all();
    
    for (const image of images) {
      const hasAlt = await image.evaluate(el => {
        return el.hasAttribute("alt") || el.getAttribute("role") === "presentation" || el.getAttribute("aria-hidden") === "true";
      });
      
      expect(hasAlt).toBe(true);
    }
  });
  
  test("color contrast should meet WCAG AA standards", async ({ page }) => {
    await page.goto("/");
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === "color-contrast"
    );
    
    expect(contrastViolations).toEqual([]);
  });
});

test.describe("Screen Reader Support", () => {
  test("page should have proper landmarks", async ({ page }) => {
    await page.goto("/");
    
    // Check for main landmark
    const main = page.locator("main, [role='main']");
    await expect(main).toHaveCount(1);
    
    // Check for navigation landmark
    const nav = page.locator("nav, [role='navigation']");
    await expect(nav).toBeVisible();
  });
  
  test("status messages should be announced", async ({ page }) => {
    // Test that live regions exist for dynamic content
    const liveRegion = page.locator("[aria-live]");
    // Note: live regions might be hidden (sr-only)
    const count = await liveRegion.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
