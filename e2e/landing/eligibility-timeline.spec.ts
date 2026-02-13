import { test, expect } from "@playwright/test";
import { assertSectionVisible } from "../utils";

test.describe("Landing Page > Eligibility (#eligibility)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await assertSectionVisible(page, "eligibility");
  });

  test("should have the #eligibility anchor", async ({ page }) => {
    await expect(page.locator("#eligibility")).toBeAttached();
  });

  test("should display 'Requirements' label", async ({ page }) => {
    await expect(
      page.locator("#eligibility").getByText("Requirements")
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display heading 'Who We Are Looking For'", async ({ page }) => {
    await expect(
      page.locator("#eligibility").getByText("Who We Are")
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("#eligibility").getByText("Looking For")
    ).toBeVisible({ timeout: 10000 });
  });

  const eligibilityCards = [
    { title: "Michigan Resident", desc: "permanent resident of the State of Michigan" },
    { title: "High School Senior", desc: "graduating high school senior planning to enroll" },
    { title: "3.0+ GPA", desc: "Grade Point Average of 3.0 or higher" },
    { title: "First-Time Priority", desc: "first-time scholarship applicants" },
    { title: "Service Oriented", desc: "volunteerism or community improvement" },
    { title: "Personal Essay", desc: "450-550 word essay" },
  ];

  for (const card of eligibilityCards) {
    test(`should display eligibility card: ${card.title}`, async ({ page }) => {
      const title = page.locator(`#eligibility h3:has-text("${card.title}")`);
      await title.scrollIntoViewIfNeeded();
      await expect(title).toBeVisible({ timeout: 10000 });
    });
  }

  test("should show 6 eligibility cards total", async ({ page }) => {
    const cards = page.locator("#eligibility h3");
    await cards.last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(cards).toHaveCount(6);
  });

  test("eligibility cards should have background images with alt text", async ({ page }) => {
    const images = page.locator("#eligibility .group img");
    await images.first().scrollIntoViewIfNeeded();
    const count = await images.count();
    expect(count).toBe(6);
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });

  test("should have 3-column grid on desktop", async ({ page }) => {
    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 1024;
    if (!isDesktop) {
      test.skip();
      return;
    }
    const grid = page.locator("#eligibility .grid").first();
    await expect(grid).toBeVisible({ timeout: 10000 });
    const columns = await grid.evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns;
    });
    const colCount = columns.split(" ").length;
    expect(colCount).toBe(3);
  });
});

test.describe("Landing Page > Timeline (#timeline)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await assertSectionVisible(page, "timeline");
  });

  test("should have the #timeline anchor", async ({ page }) => {
    await expect(page.locator("#timeline")).toBeAttached();
  });

  test("should display heading 'Application Timeline'", async ({ page }) => {
    await expect(
      page.locator("#timeline h2:has-text('Application Timeline')")
    ).toBeVisible({ timeout: 10000 });
  });

  const timelineEntries = [
    { date: "Feb 1, 2026", title: "Applications Open", desc: "Online portal opens" },
    { date: "Apr 15, 2026", title: "Application Deadline", desc: "Final day to submit" },
    { date: "Apr 16 - May 15", title: "Review Period", desc: "Committee reviews" },
    { date: "May 20 - 30", title: "Final Determinations", desc: "Recipients for awards are finalized" },
    { date: "May 23, 2026", title: "Awards Ceremony", desc: "Winners announced" },
  ];

  for (const entry of timelineEntries) {
    test(`should display timeline entry: ${entry.title}`, async ({ page }) => {
      const titleEl = page.locator(`#timeline h3:has-text("${entry.title}")`);
      await titleEl.scrollIntoViewIfNeeded();
      await expect(titleEl).toBeVisible({ timeout: 10000 });
    });
  }

  for (const entry of timelineEntries) {
    test(`should display date badge '${entry.date}'`, async ({ page }) => {
      const dateEl = page.locator("#timeline").getByText(entry.date);
      await dateEl.scrollIntoViewIfNeeded();
      await expect(dateEl).toBeVisible({ timeout: 10000 });
    });
  }

  test("should show 5 timeline entries", async ({ page }) => {
    const entries = page.locator("#timeline h3");
    await entries.last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(entries).toHaveCount(5);
  });

  test("should display center line on desktop", async ({ page }) => {
    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 768;
    if (!isDesktop) {
      test.skip();
      return;
    }
    const centerLine = page.locator("#timeline .absolute.left-1\\/2");
    await expect(centerLine).toBeVisible({ timeout: 10000 });
  });
});
