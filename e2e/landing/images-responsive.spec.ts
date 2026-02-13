import { test, expect } from "@playwright/test";
import { assertSectionVisible } from "../utils";

test.describe("Landing Page > Image Loading", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("all images should have alt text", async ({ page }) => {
    // Scroll to bottom to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const images = page.locator("img");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `Image at index ${i} is missing alt text`).toBeTruthy();
    }
  });

  test("hero logo should load successfully", async ({ page }) => {
    const logo = page.locator("header img[alt='Stark Scholars Logo']");
    await expect(logo).toBeVisible({ timeout: 10000 });
    const naturalWidth = await logo.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test("library-study image should load successfully", async ({ page }) => {
    await assertSectionVisible(page, "about");
    const img = page.locator("img[alt='Students studying in library']");
    await expect(img).toBeVisible({ timeout: 10000 });
    const naturalWidth = await img.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test("recipient photos should load for 2024 scholars", async ({ page }) => {
    await assertSectionVisible(page, "recipients");

    for (const name of ["William Bell", "Joy Mitchell"]) {
      const img = page.locator(`img[alt='${name}']`);
      await img.scrollIntoViewIfNeeded();
      await expect(img).toBeVisible({ timeout: 10000 });
      // Verify image URL is accessible (Next.js fill images use lazy loading
      // which may not trigger naturalWidth in headless Chromium)
      const src = await img.evaluate((el: HTMLImageElement) => el.src);
      expect(src, `${name} photo has no src`).toBeTruthy();
      const response = await page.request.get(src);
      expect(response.status(), `${name} photo returned non-200`).toBe(200);
      expect(
        response.headers()["content-type"],
        `${name} photo has wrong content type`
      ).toContain("image/");
    }
  });

  test("eligibility card images should load", async ({ page }) => {
    await assertSectionVisible(page, "eligibility");
    const expectedAlts = [
      "Michigan Resident",
      "High School Senior",
      "3.0+ GPA",
      "First-Time Priority",
      "Service Oriented",
      "Personal Essay",
    ];
    for (const alt of expectedAlts) {
      const img = page.locator(`#eligibility img[alt='${alt}']`);
      await img.scrollIntoViewIfNeeded();
      await expect(img).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("Landing Page > Full Page Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should scroll through all sections in order without error", async ({ page }) => {
    // Hero (top of page)
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    // About
    await assertSectionVisible(page, "about");
    await expect(page.locator("#about").getByText("Our Mission")).toBeVisible({ timeout: 10000 });

    // Recipients
    await assertSectionVisible(page, "recipients");
    await expect(page.locator("#recipients h2")).toBeVisible({ timeout: 10000 });

    // Eligibility
    await assertSectionVisible(page, "eligibility");
    await expect(page.locator("#eligibility").getByText("Requirements")).toBeVisible({ timeout: 10000 });

    // Timeline
    await assertSectionVisible(page, "timeline");
    await expect(page.locator("#timeline h2")).toBeVisible({ timeout: 10000 });

    // CTA
    const ctaHeading = page.getByText("Ready to Shape Your Future?");
    await ctaHeading.scrollIntoViewIfNeeded();
    await expect(ctaHeading).toBeVisible({ timeout: 10000 });

    // Footer
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(page.locator("footer").getByText("Stark Scholars", { exact: true })).toBeVisible();
  });

  test("should have no horizontal overflow at current viewport", async ({ page }) => {
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await delay(100);
      }
    });

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});

test.describe("Landing Page > Responsive Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("mobile: logo and Apply Now should be visible, nav links hidden", async ({ page }) => {
    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (!isMobile) {
      test.skip();
      return;
    }
    await expect(page.locator("header img[alt='Stark Scholars Logo']")).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "Apply Now" })).toBeVisible();
    await expect(page.locator("header nav")).toBeHidden();
  });

  test("desktop: full nav should be visible with hero image", async ({ page }) => {
    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 1024;
    if (!isDesktop) {
      test.skip();
      return;
    }
    await expect(page.locator("header nav")).toBeVisible();
    const heroImage = page.locator("img[alt='Stark Scholars Heritage Logo']").first();
    await expect(heroImage).toBeVisible({ timeout: 10000 });
  });
});
