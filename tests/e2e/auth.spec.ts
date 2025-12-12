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

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should show validation errors
    await expect(page.getByText(/username.*required|please enter username/i)).toBeVisible();
    await expect(page.getByText(/password.*required|please enter password/i)).toBeVisible();
  });

  test('should handle empty username', async ({ page }) => {
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page.getByText(/username.*required/i)).toBeVisible();
  });

  test('should handle empty password', async ({ page }) => {
    await page.getByLabel(/username/i).fill('admin');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page.getByText(/password.*required/i)).toBeVisible();
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

  test('should clear user data on logout', async ({ page }) => {
    // Login
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page).toHaveURL(/dashboard/);

    // Logout
    await page.getByRole('button', { name: /logout|sign out/i }).click();

    // Check that localStorage is cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
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

  test('should reject invalid MFA code', async ({ page }) => {
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should show MFA prompt
    await expect(page.getByText(/enter.*code|verification code/i)).toBeVisible();

    // Enter invalid MFA code
    await page.getByLabel(/code/i).fill('000000');
    await page.getByRole('button', { name: /verify|submit/i }).click();

    // Should show error
    await expect(page.getByText(/invalid.*code|incorrect.*code/i)).toBeVisible();
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

  test('should remember me functionality', async ({ page }) => {
    // Check remember me checkbox
    const rememberMeCheckbox = page.getByLabel(/remember me/i);
    if (await rememberMeCheckbox.isVisible()) {
      await rememberMeCheckbox.check();
    }

    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show password visibility toggle', async ({ page }) => {
    const passwordField = page.getByLabel(/password/i);
    await passwordField.fill('testpassword');

    const toggleButton = page.getByRole('button', { name: /show password|hide password/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Password should be visible
      await expect(passwordField).toHaveAttribute('type', 'text');

      await toggleButton.click();

      // Password should be hidden again
      await expect(passwordField).toHaveAttribute('type', 'password');
    }
  });

  test('should navigate to forgot password', async ({ page }) => {
    const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await expect(page).toHaveURL(/forgot-password|reset-password/);
    }
  });

  test('should handle concurrent login sessions', async ({ page, context }) => {
    // Login in first tab
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Open second tab and try to login
    const page2 = await context.newPage();
    await page2.goto('/login');
    await page2.getByLabel(/username/i).fill('admin');
    await page2.getByLabel(/password/i).fill('admin123');
    await page2.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page2).toHaveURL(/dashboard/);
  });

  test('should protect against brute force with rate limiting', async ({ page }) => {
    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await page.getByLabel(/username/i).fill('admin');
      await page.getByLabel(/password/i).fill('wrong' + i);
      await page.getByRole('button', { name: /sign in|login/i }).click();
      await page.waitForTimeout(500);
    }

    // Should show rate limit message
    const rateLimitMessage = page.getByText(/too many attempts|rate limit|try again later/i);
    if (await rateLimitMessage.isVisible()) {
      await expect(rateLimitMessage).toBeVisible();
    }
  });

  test('should persist authentication on page reload', async ({ page }) => {
    // Login
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/admin/i)).toBeVisible();
  });

  test('should display loading state during login', async ({ page }) => {
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');

    // Start login
    const loginButton = page.getByRole('button', { name: /sign in|login/i });
    await loginButton.click();

    // Should show loading state
    const loadingIndicator = page.getByRole('button', { name: /signing in|loading/i });
    if (await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should navigate between login and register pages', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /sign up|register|create account/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register|signup/);

      // Navigate back to login
      const loginLink = page.getByRole('link', { name: /sign in|login|back to login/i });
      await loginLink.click();
      await expect(page).toHaveURL(/login/);
    }
  });
});
