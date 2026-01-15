import { test as setup, expect } from '@playwright/test';

// Test user credentials from .env
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test-admin@teachy.local';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestAdmin123!';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Wait for the login form to be visible
  await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();

  // Fill in credentials
  await page.getByRole('textbox', { name: /email/i }).fill(TEST_USER_EMAIL);
  await page.getByRole('textbox', { name: /password/i }).fill(TEST_USER_PASSWORD);

  // Click sign in
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for navigation to dashboard or home
  await page.waitForURL(/\/(dashboard|$)/, { timeout: 30000 });

  // Verify we're logged in by checking for user-specific content
  // This could be checking for a user menu, dashboard content, etc.
  await expect(page).not.toHaveURL(/\/login/);

  // Save the authentication state
  await page.context().storageState({ path: authFile });
});
