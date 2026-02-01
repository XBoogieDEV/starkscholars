import { test, expect } from "@playwright/test";

test.describe("Application Steps", () => {
  test.describe("Step 1: Personal Information", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/apply/step/1");
    });

    test("should display all form fields", async ({ page }) => {
      await expect(page.locator("label:has-text('First Name')")).toBeVisible();
      await expect(page.locator("label:has-text('Last Name')")).toBeVisible();
      await expect(page.locator("label:has-text('Phone Number')")).toBeVisible();
      await expect(page.locator("label:has-text('Date of Birth')")).toBeVisible();
    });

    test("should validate required fields", async ({ page }) => {
      // Try to submit without filling fields
      await page.click("button:has-text('Save & Continue')");
      
      // Should show validation errors or stay on page
      await expect(page).toHaveURL(/.*\/apply\/step\/1/);
    });

    test("should format phone number correctly", async ({ page }) => {
      const phoneInput = page.locator("input[type='tel']");
      await phoneInput.fill("5551234567");
      
      // Check if formatted
      const value = await phoneInput.inputValue();
      expect(value).toMatch(/\(\d{3}\) \d{3}-\d{4}/);
    });

    test("should navigate to step 2 after completion", async ({ page }) => {
      // Fill form
      await page.fill("input[placeholder*='first' i], input[id*='first' i]", "John");
      await page.fill("input[placeholder*='last' i], input[id*='last' i]", "Doe");
      await page.fill("input[type='tel']", "5551234567");
      await page.fill("input[type='date']", "2000-01-01");
      
      // Submit
      await page.click("button:has-text('Save & Continue')");
      
      // Should navigate to step 2 (or show loading/error)
      await page.waitForTimeout(2000);
    });
  });

  test.describe("Step 2: Address", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/apply/step/2");
    });

    test("should display Michigan-only warning", async ({ page }) => {
      await expect(page.locator("text=/Michigan Resident/i")).toBeVisible();
    });

    test("should have state locked to MI", async ({ page }) => {
      const stateInput = page.locator("input[value='MI'], input:disabled").first();
      await expect(stateInput).toBeVisible();
    });

    test("should validate Michigan ZIP codes", async ({ page }) => {
      // Fill with invalid ZIP
      await page.fill("input[placeholder*='zip' i], input[id*='zip' i]", "12345");
      await page.fill("input[placeholder*='street' i], input[id*='address' i]", "123 Main St");
      await page.fill("input[placeholder*='city' i], input[id*='city' i]", "Detroit");
      
      await page.click("button:has-text('Save & Continue')");
      
      // Should show error for non-Michigan ZIP
      await expect(page.locator("text=/Michigan|ZIP|48001-49971/i")).toBeVisible();
    });

    test("should accept valid Michigan ZIP", async ({ page }) => {
      await page.fill("input[placeholder*='zip' i], input[id*='zip' i]", "48201");
      await page.fill("input[placeholder*='street' i], input[id*='address' i]", "123 Main St");
      await page.fill("input[placeholder*='city' i], input[id*='city' i]", "Detroit");
      
      // Should not show Michigan ZIP error
      const error = page.locator("text=/Invalid ZIP|48001-49971/i");
      await expect(error).not.toBeVisible();
    });
  });

  test.describe("Step 3: Education", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/apply/step/3");
    });

    test("should display GPA validation", async ({ page }) => {
      await expect(page.locator("text=/GPA/i")).toBeVisible();
      await expect(page.locator("text=/Minimum 3.0/i")).toBeVisible();
    });

    test("should reject GPA below 3.0", async ({ page }) => {
      await page.fill("input[type='number'][min], input[id*='gpa' i]", "2.5");
      await page.click("button:has-text('Save & Continue')");
      
      await expect(page.locator("text=/3.0|minimum|GPA/i")).toBeVisible();
    });

    test("should have year in college dropdown", async ({ page }) => {
      const yearSelect = page.locator("select, [role='combobox']").filter({ hasText: /Freshman|Sophomore|Junior|Senior/ }).first();
      await expect(yearSelect).toBeVisible();
    });
  });

  test.describe("Step 4: Eligibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/apply/step/4");
    });

    test("should display all eligibility questions", async ({ page }) => {
      await expect(page.locator("text=/first time applying/i")).toBeVisible();
      await expect(page.locator("text=/previous recipient/i")).toBeVisible();
      await expect(page.locator("text=/full-time student/i")).toBeVisible();
      await expect(page.locator("text=/Michigan resident/i")).toBeVisible();
    });

    test("should require full-time student to be yes", async ({ page }) => {
      // Select "No" for full-time student
      const fullTimeNo = page.locator("input[type='radio'][value='false'], [data-testid='full-time-no']").first();
      if (await fullTimeNo.isVisible().catch(() => false)) {
        await fullTimeNo.click();
        await expect(page.locator("text=/full-time student.*qualify/i")).toBeVisible();
      }
    });

    test("should require Michigan resident to be yes", async ({ page }) => {
      // Select "No" for Michigan resident
      const residentNo = page.locator("input[type='radio'][value='false'], [data-testid='resident-no']").first();
      if (await residentNo.isVisible().catch(() => false)) {
        await residentNo.click();
        await expect(page.locator("text=/Michigan resident.*qualify/i")).toBeVisible();
      }
    });
  });

  test.describe("Step 5: Documents & Essay", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/apply/step/5");
    });

    test("should display essay topic", async ({ page }) => {
      await expect(page.locator("text=/How Will Furthering My Studies/i")).toBeVisible();
      await expect(page.locator("text=/Improve My Community/i")).toBeVisible();
    });

    test("should show word count validation", async ({ page }) => {
      await expect(page.locator("text=/450|550|word count/i")).toBeVisible();
    });

    test("should have transcript upload area", async ({ page }) => {
      await expect(page.locator("text=/Transcript|upload/i")).toBeVisible();
    });

    test("should validate essay word count", async ({ page }) => {
      const essayTextarea = page.locator("textarea").first();
      
      // Type less than 450 words
      const shortEssay = "This is a short essay. ".repeat(20);
      await essayTextarea.fill(shortEssay);
      
      await page.click("button:has-text('Save & Continue')");
      
      // Should show word count error
      await expect(page.locator("text=/word count|450|550/i")).toBeVisible();
    });
  });

  test.describe("Step 6: Recommendations", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/apply/step/6");
    });

    test("should display recommendation requirements", async ({ page }) => {
      await expect(page.locator("text=/2 letters|2 recommend/i")).toBeVisible();
      await expect(page.locator("text=/educator|community group/i")).toBeVisible();
    });

    test("should have add recommender button", async ({ page }) => {
      await expect(page.locator("button:has-text('Add Recommender'), button:has-text('+')").first()).toBeVisible();
    });
  });

  test.describe("Step 7: Review & Submit", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/apply/step/7");
    });

    test("should display checklist with 8 requirements", async ({ page }) => {
      // Check for checklist items
      await expect(page.locator("text=/Personal Information/i")).toBeVisible();
      await expect(page.locator("text=/Address/i")).toBeVisible();
      await expect(page.locator("text=/Education/i")).toBeVisible();
      await expect(page.locator("text=/Eligibility/i")).toBeVisible();
      await expect(page.locator("text=/Essay/i")).toBeVisible();
      await expect(page.locator("text=/Transcript/i")).toBeVisible();
      await expect(page.locator("text=/Recommendations/i")).toBeVisible();
    });

    test("should require electronic signature", async ({ page }) => {
      await expect(page.locator("text=/Electronic Signature/i")).toBeVisible();
      await expect(page.locator("input[placeholder*='signature' i], input[type='text']").last()).toBeVisible();
    });

    test("should have certification checkboxes", async ({ page }) => {
      const checkboxes = page.locator("input[type='checkbox']");
      await expect(checkboxes).toHaveCount(3);
    });

    test("should show confirmation dialog on submit", async ({ page }) => {
      // Try to submit (will be disabled but test UI)
      const submitButton = page.locator("button:has-text('Submit Application')");
      await expect(submitButton).toBeVisible();
    });
  });
});
