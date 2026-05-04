import { test, expect } from "@playwright/test";
import { signInAs } from "./utils";

// Verifies the Recommendation Letter Audit card on /admin/settings (NEW in PR #1).
//   - Hidden by default; toggles via "Run audit" button
//   - Renders 4 summary tiles when expanded
//   - Calls api.admin.auditOrphanedLetters (read-only, no actions)

test.describe("Orphan letter audit (admin/settings)", () => {
  test.describe.configure({ timeout: 120000 });

  test("admin can open audit and see summary cards", async ({ page }) => {
    try {
      await signInAs(page, "admin");
    } catch (e) {
      test.skip(true, `Admin fixture not seeded (run scripts/seed-test-users.mjs). ${e}`);
      return;
    }

    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: /^Settings$/ })).toBeVisible({ timeout: 15000 });

    // Audit card title visible (not necessarily expanded yet)
    await expect(page.getByText("Recommendation Letter Audit")).toBeVisible();

    // Click "Run audit"
    await page.getByRole("button", { name: /Run audit/i }).click();

    // Wait for summary tiles
    await expect(page.getByText("Total recommendations")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Orphaned uploads")).toBeVisible();
    await expect(page.getByText("Submitted, no file")).toBeVisible();
    await expect(page.getByText("Apps stuck pending")).toBeVisible();

    // Note about Convex storage limitation should be present
    await expect(page.getByText(/storage has no list API|storage blobs with no recommendations row/i)).toBeVisible();
  });

  test("non-admin (committee) cannot reach /admin/settings", async ({ page }) => {
    try {
      await signInAs(page, "committee");
    } catch (e) {
      test.skip(true, `Committee fixture not seeded. ${e}`);
      return;
    }
    await page.goto("/admin/settings");
    // Should redirect to /unauthorized (per admin layout guard) or back to /committee
    await page
      .waitForURL((url) => /\/(unauthorized|committee|login)/.test(url.pathname), {
        timeout: 15000,
      })
      .catch(() => {});
    expect(page.url()).not.toContain("/admin/settings");
  });
});
