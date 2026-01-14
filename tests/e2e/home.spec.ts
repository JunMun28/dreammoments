import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect DreamMoments in the title
  await expect(page).toHaveTitle(/DreamMoments/);
});

test("homepage has hero section with headline", async ({ page }) => {
  await page.goto("/");

  // Check for the main headline
  await expect(
    page.getByRole("heading", { name: /Your love story/i }),
  ).toBeVisible();

  // Check for the subheadline accent
  await expect(page.getByText("beautifully invited")).toBeVisible();
});

test("homepage has template gallery section", async ({ page }) => {
  await page.goto("/");

  // Check for the templates section heading
  await expect(
    page.getByRole("heading", { name: "Choose Your Perfect Template" }),
  ).toBeVisible();

  // Check that at least one template card is visible
  const templateCards = page.locator('a[href^="/templates/"]');
  await expect(templateCards.first()).toBeVisible();
});

test("homepage has features section", async ({ page }) => {
  await page.goto("/");

  // Check for the features section heading
  await expect(
    page.getByRole("heading", { name: "A Complete Wedding Platform" }),
  ).toBeVisible();

  // Check for feature cards
  await expect(page.getByText("Beautiful Templates")).toBeVisible();
  await expect(page.getByText("Easy Guest Management")).toBeVisible();
  await expect(page.getByText("Seamless RSVPs")).toBeVisible();
});

test("homepage has call-to-action buttons", async ({ page }) => {
  await page.goto("/");

  // Check for the Start Creating button
  const startButton = page.getByRole("link", { name: /Start Creating/i });
  await expect(startButton).toBeVisible();

  // Check for the Browse Templates button
  const browseButton = page.getByRole("link", { name: /Browse Templates/i });
  await expect(browseButton).toBeVisible();
});

test("can navigate to template preview", async ({ page }) => {
  await page.goto("/");

  // Click on the first template card
  const templateCards = page.locator('a[href^="/templates/"]');
  await templateCards.first().click();

  // Should navigate to template preview page
  await expect(page).toHaveURL(/\/templates\//);

  // Should show the template preview with "Use This Template" button
  await expect(
    page.getByRole("link", { name: /Use This Template/i }),
  ).toBeVisible();
});
