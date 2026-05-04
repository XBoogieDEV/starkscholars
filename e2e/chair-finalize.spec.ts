import { test, expect } from "@playwright/test";
import { signInAs } from "./utils";

// Verifies that committee chairs (committeeMembers.isChairman === true) see the
// selection panel on /committee/results, while plain committee members do not.
// This is a NEW behavior introduced in PR #1.

test.describe("Chair finalization rights (NEW in PR #1)", () => {
  test("chair sees Selection panel + Chair Access badge", async ({ page }) => {
    try {
      await signInAs(page, "chair");
    } catch (e) {
      test.skip(true, `Chair fixture not seeded (run scripts/seed-test-users.mjs). ${e}`);
      return;
    }

    await page.goto("/committee/results");
    await expect(page.getByRole("heading", { name: /Results.*Rankings/i })).toBeVisible({ timeout: 15000 });

    // "Chair Access" badge in header
    await expect(page.getByText(/Chair Access/i)).toBeVisible();

    // The Final Selection card visible
    await expect(page.getByText("Final Selection")).toBeVisible();

    // The Confirm Selection button visible (disabled until exact count selected)
    await expect(page.getByRole("button", { name: /Confirm Selection/i })).toBeVisible();
  });

  test("plain committee member does NOT see Selection panel", async ({ page }) => {
    try {
      await signInAs(page, "committee");
    } catch (e) {
      test.skip(true, `Committee fixture not seeded. ${e}`);
      return;
    }
    await page.goto("/committee/results");
    await expect(page.getByText("Final Selection")).toBeHidden();
    await expect(page.getByText(/Chair Access|Admin Access/)).toBeHidden();
  });

  test("admin sees Admin Access badge + Selection panel", async ({ page }) => {
    try {
      await signInAs(page, "admin");
    } catch (e) {
      test.skip(true, `Admin fixture not seeded. ${e}`);
      return;
    }
    await page.goto("/committee/results");
    await expect(page.getByText(/Admin Access/i)).toBeVisible();
    await expect(page.getByText("Final Selection")).toBeVisible();
  });
});
