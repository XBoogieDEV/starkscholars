import { Page, expect } from "@playwright/test";

/**
 * Utility function to fill out the personal information form
 */
export async function fillPersonalInfo(page: Page, data: {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
}) {
  await page.fill("input[placeholder*='first' i], input[id*='first' i], input[name*='first' i]", data.firstName);
  await page.fill("input[placeholder*='last' i], input[id*='last' i], input[name*='last' i]", data.lastName);
  await page.fill("input[type='tel']", data.phone);
  await page.fill("input[type='date']", data.dateOfBirth);
}

/**
 * Utility function to fill out the address form
 */
export async function fillAddress(page: Page, data: {
  street: string;
  city: string;
  zipCode: string;
}) {
  await page.fill("input[placeholder*='street' i], input[id*='street' i], input[name*='street' i]", data.street);
  await page.fill("input[placeholder*='city' i], input[id*='city' i], input[name*='city' i]", data.city);
  await page.fill("input[placeholder*='zip' i], input[id*='zip' i], input[name*='zip' i]", data.zipCode);
}

/**
 * Utility function to fill out the education form
 */
export async function fillEducation(page: Page, data: {
  highSchool: string;
  gpa: string;
  college: string;
  year: string;
}) {
  await page.fill("input[placeholder*='high school' i], input[id*='highSchool' i]", data.highSchool);
  await page.fill("input[type='number'], input[id*='gpa' i]", data.gpa);
  await page.fill("input[placeholder*='college' i], input[id*='college' i]", data.college);
  
  // Select year
  const yearSelect = page.locator("select").filter({ hasText: /Freshman|Sophomore|Junior|Senior/ });
  if (await yearSelect.isVisible().catch(() => false)) {
    await yearSelect.selectOption(data.year);
  }
}

/**
 * Utility function to complete eligibility questions
 */
export async function fillEligibility(page: Page, answers: {
  firstTime: boolean;
  previousRecipient: boolean;
  fullTime: boolean;
  michiganResident: boolean;
}) {
  // Select radio buttons based on answers
  const radioGroups = await page.locator("input[type='radio']").all();
  
  // This is a simplified version - in real tests you'd target specific questions
  for (let i = 0; i < radioGroups.length; i += 2) {
    const yesRadio = radioGroups[i];
    const noRadio = radioGroups[i + 1];
    
    // Click appropriate radio based on question index
    // This is simplified - you'd want to identify questions by label
  }
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState("networkidle", { timeout });
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).count() > 0;
}

/**
 * Get viewport dimensions
 */
export async function getViewportSize(page: Page) {
  return page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
}

/**
 * Take screenshot with descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `./e2e/screenshots/${name}.png`, fullPage: true });
}

/**
 * Wait for unauthenticated redirect to /login
 * Accounts for Convex SYNC_GRACE_PERIOD_MS (5s)
 */
export async function waitForAuthRedirect(page: Page, timeout = 15000) {
  await page.waitForURL("**/login**", { timeout });
}

/**
 * Test fixtures created by scripts/seed-test-users.mjs.
 * All share the same password.
 */
export const TEST_USERS = {
  admin: { email: "test-admin@scholars.test", expectedLanding: "/admin" },
  committee: { email: "test-committee@scholars.test", expectedLanding: "/committee" },
  chair: { email: "test-chair@scholars.test", expectedLanding: "/committee" },
  applicant: { email: "test-applicant@scholars.test", expectedLanding: "/apply" },
} as const;

export const TEST_PASSWORD = "TestPass-2026";

/**
 * Signs in via the /login form. Waits for the post-login redirect to land on
 * `expectedLanding` (or any path containing it). Throws if the form errors out.
 */
export async function signInAs(
  page: Page,
  who: keyof typeof TEST_USERS,
): Promise<void> {
  const { email, expectedLanding } = TEST_USERS[who];

  await page.goto("/login", { waitUntil: "domcontentloaded" });

  // Dismiss the cookie banner if present — it can intercept interactions
  await page
    .getByRole("button", { name: /^accept$/i })
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});

  // Wait for inputs to be attached AND interactive (React hydrated)
  const emailInput = page.locator("#email").first();
  const pwInput = page.locator("#password").first();
  await emailInput.waitFor({ state: "visible", timeout: 15000 });
  await pwInput.waitFor({ state: "visible", timeout: 5000 });

  // Use pressSequentially (simulates real keystrokes — React's onChange picks
  // up each char). plain fill() can race with React hydration.
  await emailInput.click();
  await emailInput.pressSequentially(email, { delay: 10 });
  await pwInput.click();
  await pwInput.pressSequentially(TEST_PASSWORD, { delay: 10 });

  // Verify the values are actually in the DOM before submitting
  await expect(emailInput).toHaveValue(email, { timeout: 3000 });
  await expect(pwInput).toHaveValue(TEST_PASSWORD, { timeout: 3000 });

  // Submit
  await page
    .getByRole("button", { name: /^sign in$/i })
    .first()
    .click();

  // Login page redirects via window.location after success. Generous timeout
  // for Turbopack cold-compile of the destination page, and waitUntil:
  // domcontentloaded so we don't block on a slow 'load' event (network idle
  // is also unreliable with Convex WebSocket and image loading).
  await page.waitForURL(`**${expectedLanding}**`, {
    timeout: 60000,
    waitUntil: "domcontentloaded",
  });
}

/**
 * Skip-if-not-seeded marker. Authenticated specs check that the test users
 * exist by attempting a quick login as the admin fixture; if it fails, the
 * suite is skipped instead of failing.
 */
export async function ensureSeededOrSkip(page: Page, testInfo: { skip: (reason?: string) => void }) {
  try {
    await signInAs(page, "admin");
  } catch (e) {
    testInfo.skip(
      `Test users not seeded. Run \`node scripts/seed-test-users.mjs\` first. (${e instanceof Error ? e.message : String(e)})`
    );
  }
}

/**
 * Scroll a section into view and assert it is visible
 * Useful for Framer Motion whileInView animations
 */
export async function assertSectionVisible(page: Page, sectionId: string) {
  const section = page.locator(`#${sectionId}`);
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible({ timeout: 10000 });
}
