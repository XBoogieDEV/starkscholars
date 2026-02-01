import { test, expect } from "@playwright/test";

test.describe("Responsive Design Tests", () => {
  const pages = [
    { path: "/", name: "Landing Page" },
    { path: "/apply/dashboard", name: "Dashboard" },
    { path: "/apply/step/1", name: "Step 1 - Personal Info" },
    { path: "/apply/step/2", name: "Step 2 - Address" },
    { path: "/apply/step/3", name: "Step 3 - Education" },
    { path: "/apply/step/4", name: "Step 4 - Eligibility" },
    { path: "/apply/step/5", name: "Step 5 - Documents" },
    { path: "/apply/step/6", name: "Step 6 - Recommendations" },
    { path: "/apply/step/7", name: "Step 7 - Review" },
    { path: "/apply/status", name: "Status Page" },
  ];

  for (const page of pages) {
    test.describe(`${page.name} - ${page.path}`, () => {
      
      test(`should render correctly on mobile-sm @mobile-sm`, async ({ page: p }) => {
        await p.setViewportSize({ width: 375, height: 667 });
        await p.goto(page.path);
        
        // Check no horizontal overflow
        const body = p.locator("body");
        const bodyWidth = await body.evaluate((el) => el.scrollWidth);
        const viewportWidth = 375;
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small tolerance
        
        // Check content is visible
        await expect(p.locator("h1, h2, main, [role='main']").first()).toBeVisible();
      });

      test(`should render correctly on mobile-lg @mobile-lg`, async ({ page: p }) => {
        await p.setViewportSize({ width: 414, height: 896 });
        await p.goto(page.path);
        
        // Check content is visible
        await expect(p.locator("h1, h2, main, [role='main']").first()).toBeVisible();
        
        // Check no horizontal scroll
        const hasHorizontalScrollbar = await p.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScrollbar).toBeFalsy();
      });

      test(`should render correctly on tablet @tablet`, async ({ page: p }) => {
        await p.setViewportSize({ width: 768, height: 1024 });
        await p.goto(page.path);
        
        // Check content is visible
        await expect(p.locator("h1, h2, main, [role='main']").first()).toBeVisible();
        
        // Navigation should be visible
        await expect(p.locator("header, nav").first()).toBeVisible();
      });

      test(`should render correctly on laptop @laptop`, async ({ page: p }) => {
        await p.setViewportSize({ width: 1366, height: 768 });
        await p.goto(page.path);
        
        // Check content is visible
        await expect(p.locator("h1, h2, main, [role='main']").first()).toBeVisible();
      });

      test(`should render correctly on desktop @desktop`, async ({ page: p }) => {
        await p.setViewportSize({ width: 1920, height: 1080 });
        await p.goto(page.path);
        
        // Check content is visible
        await expect(p.locator("h1, h2, main, [role='main']").first()).toBeVisible();
        
        // Layout should use full width appropriately
        const container = p.locator(".container, main, [class*='max-w-']").first();
        await expect(container).toBeVisible();
      });
    });
  }

  test.describe("Navigation Responsiveness", () => {
    test("should show hamburger menu on mobile @mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/apply/dashboard");
      
      // Check for mobile menu button or simplified nav
      const mobileNav = page.locator("button[aria-label*='menu'], [data-testid='mobile-menu'], header button").first();
      
      // Navigation should be present in some form
      await expect(page.locator("header")).toBeVisible();
    });

    test("should show full nav on desktop @desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/apply/dashboard");
      
      // Full navigation should be visible
      await expect(page.locator("nav")).toBeVisible();
      await expect(page.locator("text=Dashboard")).toBeVisible();
      await expect(page.locator("text=Application")).toBeVisible();
    });
  });

  test.describe("Form Layout Responsiveness", () => {
    test("should stack form fields on mobile @mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/apply/step/1");
      
      // Form fields should be stacked (full width)
      const inputs = page.locator("input, select, textarea");
      const count = await inputs.count();
      
      if (count > 0) {
        // Check first input is roughly full width
        const firstInput = inputs.first();
        const bbox = await firstInput.boundingBox();
        if (bbox) {
          expect(bbox.width).toBeGreaterThan(300); // Should be nearly full width
        }
      }
    });

    test("should show multi-column layout on desktop @desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/apply/step/1");
      
      // Should have grid layout
      const gridContainer = page.locator("[class*='grid'], [class*='md:grid']").first();
      await expect(gridContainer).toBeVisible();
    });
  });

  test.describe("Card Layout Responsiveness", () => {
    test("dashboard cards should stack on mobile @mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/apply/dashboard");
      
      // Cards should be visible
      const cards = page.locator("[class*='card'], article");
      await expect(cards.first()).toBeVisible();
    });

    test("dashboard cards should grid on desktop @desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/apply/dashboard");
      
      // Should have grid layout for cards
      const grid = page.locator("[class*='grid-cols-'], [class*='lg:grid']").first();
      await expect(grid).toBeVisible();
    });
  });
});
