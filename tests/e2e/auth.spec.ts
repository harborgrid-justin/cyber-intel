import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/SENTINEL/);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // Fill in login form
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');

    // Submit form
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Should see user menu
    await expect(page.getByText(/admin/i)).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.getByLabel(/username/i).fill('invalid');
    await page.getByLabel(/password/i).fill('wrongpassword');

    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid credentials|authentication failed/i)).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page).toHaveURL(/dashboard/);

    // Click logout
    await page.getByRole('button', { name: /logout|sign out/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should require MFA for admin users', async ({ page }) => {
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should show MFA prompt
    await expect(page.getByText(/enter.*code|verification code/i)).toBeVisible();

    // Enter MFA code
    await page.getByLabel(/code/i).fill('123456');
    await page.getByRole('button', { name: /verify|submit/i }).click();

    // Should complete login
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should handle session expiration', async ({ page }) => {
    // Login
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page).toHaveURL(/dashboard/);

    // Simulate session expiration
    await page.evaluate(() => localStorage.clear());

    // Navigate to another page
    await page.goto('/threats');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
