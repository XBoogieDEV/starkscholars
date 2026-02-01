import { Page } from "@playwright/test";

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
