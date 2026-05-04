import { test, expect } from "@playwright/test";
import { signInAs } from "./utils";

// Covers /admin/selection workflow:
//   - rankings render
//   - inline +/- adjusts the max_scholarship_recipients setting (NEW in PR #1)
//   - "Selected: X / Y" counter reflects the setting

test.describe("Admin Selection workflow", () => {
  test.describe.configure({ timeout: 120000 });

  test.beforeEach(async ({ page }) => {
    try {
      await signInAs(page, "admin");
    } catch (e) {
      test.skip(true, `Admin fixture not seeded (run scripts/seed-test-users.mjs). ${e}`);
    }
  });

  test("/admin/selection renders rankings header", async ({ page }) => {
    await page.goto("/admin/selection");
    await expect(page.getByRole("heading", { name: /^Selection$/ })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Candidate Rankings/i)).toBeVisible();
  });

  test("inline + button increments max recipients", async ({ page }) => {
    await page.goto("/admin/selection");
    await expect(page.getByRole("heading", { name: /^Selection$/ })).toBeVisible({ timeout: 15000 });

    // Initial counter "Selected: 0 / N" — capture N
    const initialCounter = await page.locator("p", { hasText: /\d+\s*\/\s*\d+/ }).first().textContent();
    const initialMatch = initialCounter?.match(/(\d+)\s*\/\s*(\d+)/);
    if (!initialMatch) {
      throw new Error(`Could not parse selected counter: ${initialCounter}`);
    }
    const initialMax = parseInt(initialMatch[2], 10);

    // Click the increase button
    await page.getByRole("button", { name: /Increase award count/i }).click();

    // Wait for toast or for the counter to update
    await expect(
      page.locator("p", { hasText: new RegExp(`\\d+\\s*/\\s*${initialMax + 1}`) }).first()
    ).toBeVisible({ timeout: 10000 });

    // Restore: click decrease
    await page.getByRole("button", { name: /Decrease award count/i }).click();
    await expect(
      page.locator("p", { hasText: new RegExp(`\\d+\\s*/\\s*${initialMax}`) }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("decrease button bounded at 1", async ({ page }) => {
    await page.goto("/admin/selection");
    await expect(page.getByRole("heading", { name: /^Selection$/ })).toBeVisible({ timeout: 15000 });

    // Read current max
    const counter = await page.locator("p", { hasText: /\d+\s*\/\s*\d+/ }).first().textContent();
    const m = counter?.match(/(\d+)\s*\/\s*(\d+)/);
    if (!m) {
      throw new Error(`Could not parse counter: ${counter}`);
    }
    const max = parseInt(m[2], 10);

    // If max is already 1, decrease should be disabled. Otherwise still disabled when reaching 1.
    if (max === 1) {
      await expect(page.getByRole("button", { name: /Decrease award count/i })).toBeDisabled();
      return;
    }
    // Otherwise, walk down to 1 and confirm disabled.
    for (let i = max; i > 1; i--) {
      await page.getByRole("button", { name: /Decrease award count/i }).click();
      await expect(
        page.locator("p", { hasText: new RegExp(`\\d+\\s*/\\s*${i - 1}\\b`) }).first()
      ).toBeVisible({ timeout: 10000 });
    }
    await expect(page.getByRole("button", { name: /Decrease award count/i })).toBeDisabled();

    // Restore back to original
    for (let i = 1; i < max; i++) {
      await page.getByRole("button", { name: /Increase award count/i }).click();
      await expect(
        page.locator("p", { hasText: new RegExp(`\\d+\\s*/\\s*${i + 1}\\b`) }).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });
});
