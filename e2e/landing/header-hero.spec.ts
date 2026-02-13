import { test, expect } from "@playwright/test";

test.describe("Landing Page > Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display the logo image", async ({ page }) => {
    const logo = page.locator("header img[alt='Stark Scholars Logo']");
    await expect(logo).toBeVisible();
  });

  test("should display brand text 'Stark Scholars'", async ({ page }) => {
    const brand = page.locator("header").getByText("Stark Scholars");
    await expect(brand).toBeVisible();
  });

  test("should display subtitle on larger screens", async ({ page }) => {
    const subtitle = page.locator("header").getByText("William R. Stark Financial Assistance Program");
    const isMobile = (page.viewportSize()?.width ?? 1280) < 640;
    if (isMobile) {
      await expect(subtitle).toBeHidden();
    } else {
      await expect(subtitle).toBeVisible();
    }
  });

  test("should have nav links on desktop (About, Recipients, Timeline, Eligibility)", async ({ page }) => {
    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobile) {
      test.skip();
      return;
    }
    for (const label of ["About", "Recipients", "Timeline", "Eligibility"]) {
      await expect(page.locator(`header nav a:has-text("${label}")`)).toBeVisible();
    }
  });

  test("nav links should be hidden on mobile", async ({ page }) => {
    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 768;
    if (isDesktop) {
      test.skip();
      return;
    }
    await expect(page.locator("header nav")).toBeHidden();
  });

  test("should display Sign In link", async ({ page }) => {
    const signIn = page.locator("header").getByRole("link", { name: "Sign In" });
    const isMobile = (page.viewportSize()?.width ?? 1280) < 640;
    if (isMobile) {
      await expect(signIn).toBeHidden();
    } else {
      await expect(signIn).toBeVisible();
      await expect(signIn).toHaveAttribute("href", "/login");
    }
  });

  test("should display Apply Now button linking to /register", async ({ page }) => {
    const applyNow = page.locator("header").getByRole("link", { name: "Apply Now" });
    await expect(applyNow).toBeVisible();
    await expect(applyNow).toHaveAttribute("href", "/register");
  });

  test("header should be sticky (fixed at top)", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toHaveCSS("position", "sticky");
  });

  test("nav link About should smooth-scroll to #about", async ({ page }) => {
    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 768;
    if (!isDesktop) {
      test.skip();
      return;
    }
    await page.locator('header nav a:has-text("About")').click();
    await page.waitForTimeout(1000);
    const aboutSection = page.locator("#about");
    await expect(aboutSection).toBeInViewport({ ratio: 0.3 });
  });
});

test.describe("Landing Page > Hero Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display the badge 'Class of 2023 President's Club'", async ({ page }) => {
    await expect(page.getByText("Class of 2023 President's Club", { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test("should display the h1 with 'Invest in Your' and 'Future Legacy'", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible({ timeout: 10000 });
    await expect(h1).toContainText("Invest in Your");
    await expect(h1).toContainText("Future Legacy");
  });

  test("should display body copy about the scholarship program", async ({ page }) => {
    await expect(
      page.locator("p.lg\\:block").getByText("William R. Stark Financial Assistance Program awards prestigious scholarships")
    ).toBeVisible({ timeout: 10000 });
  });

  test("should have Start Application CTA linking to /register", async ({ page }) => {
    const cta = page.getByRole("link", { name: "Start Application" });
    await expect(cta).toBeVisible({ timeout: 10000 });
    await expect(cta).toHaveAttribute("href", "/register");
  });

  test("should have Learn More CTA linking to #about", async ({ page }) => {
    const cta = page.getByRole("link", { name: "Learn More" });
    await expect(cta).toBeVisible({ timeout: 10000 });
    await expect(cta).toHaveAttribute("href", "#about");
  });

  test("should display stats: $500, 2 Recipients, Apr 15 Deadline", async ({ page }) => {
    await expect(page.getByText("$500")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Award Amount")).toBeVisible();
    await expect(page.getByText("Apr 15", { exact: true })).toBeVisible();
    await expect(page.getByText("Deadline", { exact: true })).toBeVisible();
  });

  test("stat '2' should display with label 'Recipients'", async ({ page }) => {
    const recipientsStat = page.locator("p.text-3xl:has-text('2')");
    await expect(recipientsStat).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Recipients", { exact: false }).first()).toBeVisible();
  });

  test("should show floating 'Application Open' card on desktop", async ({ page }) => {
    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 1024;
    if (!isDesktop) {
      test.skip();
      return;
    }
    await expect(page.getByText("Application Open")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("For 2026 Academic Year")).toBeVisible();
  });

  test("should display hero image area on desktop", async ({ page }) => {
    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 1024;
    if (!isDesktop) {
      test.skip();
      return;
    }
    const heroImage = page.locator("img[alt='Stark Scholars Heritage Logo']").first();
    await expect(heroImage).toBeVisible({ timeout: 10000 });
  });

  test("Start Application CTA should navigate to /register", async ({ page }) => {
    await page.getByRole("link", { name: "Start Application" }).click();
    await page.waitForURL("**/register**", { timeout: 10000 });
    expect(page.url()).toContain("/register");
  });

  test("Learn More CTA should scroll to #about", async ({ page }) => {
    await page.getByRole("link", { name: "Learn More" }).click();
    await page.waitForTimeout(1000);
    const aboutSection = page.locator("#about");
    await expect(aboutSection).toBeInViewport({ ratio: 0.3 });
  });

  test("mobile carousel should show dot indicators on mobile", async ({ page }) => {
    const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;
    if (!isMobile) {
      test.skip();
      return;
    }
    const dots = page.locator(".lg\\:hidden .rounded-full.w-2.h-2, .lg\\:hidden div.w-2.h-2");
    await expect(dots.first()).toBeVisible({ timeout: 10000 });
  });
});
