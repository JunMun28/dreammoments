import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // Note: Adjust the expected title based on your actual app title
  await expect(page).toHaveTitle(/TanStack Start/);
});

test('homepage has main heading', async ({ page }) => {
  await page.goto('/');

  // Expects page to have a heading with the name of "TANSTACK START".
  await expect(page.getByRole('heading', { name: 'TANSTACK START' })).toBeVisible();
});

test('navigation to documentation', async ({ page }) => {
  await page.goto('/');
  
  // Click the documentation link
  const docLink = page.getByRole('link', { name: 'Documentation' });
  await expect(docLink).toBeVisible();
});
