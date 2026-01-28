import { test, expect } from "@playwright/test";

// TC-002-001: Login page renders correctly
test("login page renders correctly", async ({ page }) => {
  await page.goto("/login");

  // Verify login page loads successfully
  await expect(page).toHaveURL("/login");

  // Verify Google sign-in button is visible
  await expect(
    page.getByRole("button", { name: /Sign in with Google/i }),
  ).toBeVisible();

  // Verify DreamMoments branding is displayed
  await expect(
    page.getByRole("heading", { name: /Welcome to DreamMoments/i }),
  ).toBeVisible();
});

// TC-002-004: Unauthenticated user cannot access builder
test("unauthenticated user is redirected from builder to login", async ({
  page,
}) => {
  // Try to navigate directly to builder without auth
  await page.goto("/builder");

  // Should be redirected to login page
  await expect(page).toHaveURL(/\/login/);
});

// TC-002-005: OAuth error is handled gracefully
test("auth callback with error shows friendly message", async ({ page }) => {
  // Navigate to callback with error param
  await page.goto("/auth/callback?error=access_denied");

  // Should show error message to user
  const errorMessage = page.getByText(/error|denied|failed/i);
  await expect(errorMessage).toBeVisible({ timeout: 10000 });
});

// Test login with template parameter preserves URL
test("login page preserves template parameter", async ({ page }) => {
  await page.goto("/login?template=elegant-minimal");

  // Verify login page loads with template parameter
  await expect(page).toHaveURL(/template=elegant-minimal/);
});
