import { test, expect } from "@playwright/test";

test.describe("Landing Page > CTA Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display heading 'Ready to Shape Your Future?'", async ({ page }) => {
    const heading = page.getByText("Ready to Shape Your Future?");
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("should display deadline text 'April 15, 2026'", async ({ page }) => {
    const deadline = page.getByText("April 15, 2026");
    await deadline.scrollIntoViewIfNeeded();
    await expect(deadline).toBeVisible({ timeout: 10000 });
  });

  test("should have 'Create Account & Apply' button linking to /register", async ({ page }) => {
    const btn = page.getByRole("link", { name: "Create Account & Apply" });
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await expect(btn).toHaveAttribute("href", "/register");
  });

  test("should have 'Resume Application' button linking to /login", async ({ page }) => {
    const btn = page.getByRole("link", { name: "Resume Application" });
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await expect(btn).toHaveAttribute("href", "/login");
  });

  test("'Create Account & Apply' should navigate to /register", async ({ page }) => {
    const btn = page.getByRole("link", { name: "Create Account & Apply" });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL("**/register**", { timeout: 15000 });
    expect(page.url()).toContain("/register");
  });

  test("'Resume Application' should navigate to /login", async ({ page }) => {
    const btn = page.getByRole("link", { name: "Resume Application" });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL("**/login**", { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });
});

test.describe("Landing Page > Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("footer").scrollIntoViewIfNeeded();
  });

  test("should display footer logo", async ({ page }) => {
    const logo = page.locator("footer img[alt='Stark Scholars Logo']");
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test("should display 'Stark Scholars' brand text", async ({ page }) => {
    await expect(page.locator("footer").getByText("Stark Scholars", { exact: true })).toBeVisible();
  });

  test("should display 'Est. 2023'", async ({ page }) => {
    await expect(page.locator("footer").getByText("Est. 2023")).toBeVisible();
  });

  test("should display Michigan description", async ({ page }) => {
    await expect(
      page.locator("footer").getByText("Michigan leaders")
    ).toBeVisible();
  });

  test("should have navigation links: Sign In, Apply Now, Terms, Privacy", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Apply Now" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Terms of Service" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  });

  test("Sign In link should point to /login", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/login");
  });

  test("Apply Now link should point to /register", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Apply Now" })).toHaveAttribute("href", "/register");
  });

  test("Terms link should point to /terms", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms");
  });

  test("Privacy link should point to /privacy", async ({ page }) => {
    await expect(page.locator("footer").getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  });

  test("should display contact email", async ({ page }) => {
    await expect(
      page.locator("footer").getByText("blackgoldmine@sbcglobal.net")
    ).toBeVisible();
  });

  test("should display 'Detroit, MI'", async ({ page }) => {
    await expect(page.locator("footer").getByText("Detroit, MI")).toBeVisible();
  });

  test("should display copyright text", async ({ page }) => {
    await expect(
      page.locator("footer").getByText("© 2026 Stark Scholars. All rights reserved.")
    ).toBeVisible();
  });

  test("footer Sign In link navigates to /login", async ({ page }) => {
    await page.locator("footer").getByRole("link", { name: "Sign In" }).click();
    await page.waitForURL("**/login**", { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("footer Apply Now link navigates to /register", async ({ page }) => {
    await page.locator("footer").getByRole("link", { name: "Apply Now" }).click();
    await page.waitForURL("**/register**", { timeout: 10000 });
    expect(page.url()).toContain("/register");
  });
});
