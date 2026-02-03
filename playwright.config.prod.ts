import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for testing PRODUCTION only
 * Use: npx playwright test --config=playwright.config.prod.ts
 */

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: false,
  retries: 1,
  workers: 2,
  reporter: "html",
  use: {
    baseURL: "https://starkscholars.com",
    trace: "on-first-retry",
    screenshot: "on",
    video: "retain-on-failure",
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
    {
      name: "tablet",
      use: { ...devices["iPad (gen 7)"] },
    },
  ],
  // NO webServer - tests run against production directly
});
