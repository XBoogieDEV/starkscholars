import { test, expect } from "@playwright/test";
import { assertSectionVisible } from "../utils";

test.describe("Landing Page > About Section (#about)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have the #about anchor", async ({ page }) => {
    await expect(page.locator("#about")).toBeAttached();
  });

  test("should display 'Our Mission' label", async ({ page }) => {
    await assertSectionVisible(page, "about");
    await expect(page.locator("#about").getByText("Our Mission")).toBeVisible({ timeout: 10000 });
  });

  test("should display heading 'Honoring a Legacy of Excellence'", async ({ page }) => {
    await assertSectionVisible(page, "about");
    await expect(
      page.locator("#about").getByText("Honoring a Legacy of Excellence")
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display mission description", async ({ page }) => {
    await assertSectionVisible(page, "about");
    await expect(
      page.locator("#about").getByText("empower the next generation of global youth leaders")
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display Educational Support card", async ({ page }) => {
    await assertSectionVisible(page, "about");
    await expect(page.locator("#about").getByText("Educational Support")).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("#about").getByText("financial assistance to help bridge the gap")
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display Community Impact card", async ({ page }) => {
    await assertSectionVisible(page, "about");
    await expect(page.locator("#about").getByText("Community Impact")).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("#about").getByText("look for students who are using their education")
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display library-study.png image", async ({ page }) => {
    await assertSectionVisible(page, "about");
    const img = page.locator("#about img[alt='Students studying in library']");
    await expect(img).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Landing Page > Past Recipients (#recipients)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await assertSectionVisible(page, "recipients");
  });

  test("should have the #recipients anchor", async ({ page }) => {
    await expect(page.locator("#recipients")).toBeAttached();
  });

  test("should display 'Our Scholars' label", async ({ page }) => {
    await expect(page.locator("#recipients").getByText("Our Scholars")).toBeVisible({ timeout: 10000 });
  });

  test("should display heading 'Past Recipients'", async ({ page }) => {
    await expect(
      page.locator("#recipients h2:has-text('Past Recipients')")
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display subtitle about celebrating students", async ({ page }) => {
    await expect(
      page.locator("#recipients").getByText("Celebrating the outstanding students")
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display '2025 — Pennsylvania' year badge", async ({ page }) => {
    await expect(
      page.locator("#recipients").getByText("2025")
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("#recipients").getByText("Pennsylvania")
    ).toBeVisible({ timeout: 10000 });
  });

  test("Kesmyn Mugo card should display name, initials, school, college, major, GPA", async ({ page }) => {
    const card = page.locator("h3:has-text('Kesmyn Mugo')").locator("../../..");
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(card.getByText("KM")).toBeVisible();
    await expect(card.getByText("Upper Merion Area '25")).toBeVisible();
    await expect(card.getByText("College Undecided")).toBeVisible();
    await expect(card.getByText("Biomedical Engineering")).toBeVisible();
    await expect(card.getByText("5.5")).toBeVisible();
  });

  test("Justin Bowser card should display name, initials, school, college, major, GPA", async ({ page }) => {
    const card = page.locator("h3:has-text('Justin Bowser')").locator("../../..");
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(card.getByText("JB")).toBeVisible();
    await expect(card.getByText("William Tennent HS '25")).toBeVisible();
    await expect(card.getByText("Widener University")).toBeVisible();
    await expect(card.getByText("Physical Therapy")).toBeVisible();
    await expect(card.getByText("3.1")).toBeVisible();
  });

  test("should display '2024 — Wisconsin' year badge", async ({ page }) => {
    const badge2024 = page.locator("#recipients").getByText("2024");
    await badge2024.scrollIntoViewIfNeeded();
    await expect(badge2024).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#recipients").getByText("Wisconsin")).toBeVisible({ timeout: 10000 });
  });

  test("William Bell card should display name, photo, school, major, GPA", async ({ page }) => {
    const card = page.locator("h3:has-text('William Bell')").locator("../../..");
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible({ timeout: 10000 });
    const photo = card.locator("img[alt='William Bell']");
    await expect(photo).toBeVisible();
    await expect(card.getByText("Kingdom Prep Lutheran '24")).toBeVisible();
    await expect(card.getByText("IT")).toBeVisible();
    await expect(card.getByText("3.4")).toBeVisible();
  });

  test("Joy Mitchell card should display name, photo, school, major, GPA", async ({ page }) => {
    const card = page.locator("h3:has-text('Joy Mitchell')").locator("../../..");
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible({ timeout: 10000 });
    const photo = card.locator("img[alt='Joy Mitchell']");
    await expect(photo).toBeVisible();
    await expect(card.getByText("U of Minnesota-Twin Cities").first()).toBeVisible();
    await expect(card.getByText("Sports Management & Economics")).toBeVisible();
    await expect(card.getByText("3.7")).toBeVisible();
  });

  test("should have 2-column grid on desktop", async ({ page }) => {
    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 768;
    if (!isDesktop) {
      test.skip();
      return;
    }
    const grid = page.locator("#recipients .grid.md\\:grid-cols-2").first();
    await expect(grid).toBeVisible({ timeout: 10000 });
    const columns = await grid.evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns;
    });
    const colCount = columns.split(" ").length;
    expect(colCount).toBe(2);
  });
});
