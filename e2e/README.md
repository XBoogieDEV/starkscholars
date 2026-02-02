# E2E Testing with Playwright

This directory contains end-to-end tests for the Stark Scholars Platform using Playwright.

## Test Coverage

### 1. Dashboard Tests (`dashboard.spec.ts`)
- Layout verification
- Navigation functionality
- Progress tracking display
- Step card interactions
- Responsive behavior

### 2. Application Steps Tests (`application-steps.spec.ts`)
- **Step 1**: Personal Information form validation, phone formatting
- **Step 2**: Address validation, Michigan ZIP verification
- **Step 3**: Education form, GPA validation (≥3.0)
- **Step 4**: Eligibility questions, requirement warnings
- **Step 5**: Essay word count validation (450-550 words), file upload
- **Step 6**: Recommendations management
- **Step 7**: Review & Submit, signature validation

### 3. Recommender Portal Tests (`recommender-portal.spec.ts`)
- Token validation
- Recommendation form structure
- File upload functionality
- Responsive design

### 4. Responsive Design Tests (`responsive-design.spec.ts`)
- Breakpoints tested:
  - Mobile Small: 375x667 (iPhone SE)
  - Mobile Large: 414x896 (iPhone 11 Pro Max)
  - Tablet: 768x1024 (iPad)
  - Laptop: 1366x768
  - Desktop: 1920x1080
- Cross-page responsive verification
- Navigation adaptation
- Form layout changes
- Card grid/stack behavior

### 5. Accessibility Tests (`accessibility.spec.ts`)
- Heading structure validation
- Form label associations
- ARIA attributes
- Keyboard navigation
- Color contrast

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test e2e/dashboard.spec.ts
```

### Run tests with specific tag
```bash
npx playwright test --grep "@desktop"
npx playwright test --grep "@mobile"
```

### Run tests on specific project
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Desktop Chrome"
```

### Generate and view HTML report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

### Debug tests
```bash
npx playwright test --debug
```

## Test Configuration

Tests are configured in `playwright.config.ts` with the following browsers/devices:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- iPad (gen 7)

## Writing New Tests

### Basic Test Structure
```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/path-to-page");
  });

  test("should do something", async ({ page }) => {
    // Arrange
    
    // Act
    
    // Assert
    await expect(page.locator("selector")).toBeVisible();
  });
});
```

### Using Test Utilities
```typescript
import { fillPersonalInfo, waitForNetworkIdle } from "./utils";

await fillPersonalInfo(page, {
  firstName: "John",
  lastName: "Doe",
  phone: "5551234567",
  dateOfBirth: "2000-01-01",
});

await waitForNetworkIdle(page);
```

## CI/CD Integration

Tests are configured to run in CI mode with:
- Parallel execution disabled (`workers: 1`)
- Retries enabled (`retries: 2`)
- Screenshots on failure
- Video recording on failure
- HTML report generation

## Environment Variables

- `PLAYWRIGHT_BASE_URL`: Override the base URL for tests (default: `http://localhost:3000`)
- `CI`: Set to enable CI mode (slower but more reliable)

## Screenshots

Screenshots are automatically captured on test failures and saved to `e2e/screenshots/`. You can also manually capture screenshots using the utility function:

```typescript
import { takeScreenshot } from "./utils";

await takeScreenshot(page, "dashboard-desktop");
```
