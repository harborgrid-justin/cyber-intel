import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display dashboard statistics', async ({ page }) => {
    // Check for key statistics
    await expect(page.getByText(/total threats/i)).toBeVisible();
    await expect(page.getByText(/active cases/i)).toBeVisible();
    await expect(page.getByText(/critical alerts/i)).toBeVisible();

    // Verify numbers are displayed
    await expect(page.getByTestId('total-threats-count')).toBeVisible();
    await expect(page.getByTestId('active-cases-count')).toBeVisible();
  });

  test('should display threat severity chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /threat severity/i })).toBeVisible();

    // Check for chart elements
    const chart = page.locator('[data-testid="severity-chart"]');
    await expect(chart).toBeVisible();
  });

  test('should display recent threats list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recent threats/i })).toBeVisible();

    // Check for threat items
    const threatList = page.locator('[data-testid="recent-threats-list"]');
    await expect(threatList).toBeVisible();

    // Should have at least one threat
    const threatItems = threatList.locator('[data-testid="threat-item"]');
    await expect(threatItems.first()).toBeVisible();
  });

  test('should navigate to threats page from dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /view all threats/i }).click();

    await expect(page).toHaveURL(/threats/);
  });

  test('should navigate to cases page from dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /view all cases/i }).click();

    await expect(page).toHaveURL(/cases/);
  });

  test('should refresh dashboard data', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /refresh/i });
    await refreshButton.click();

    // Should show loading indicator
    await expect(page.getByTestId('loading-indicator')).toBeVisible();

    // Should update data
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible({ timeout: 5000 });
  });

  test('should filter dashboard by date range', async ({ page }) => {
    await page.getByRole('button', { name: /date range|filter/i }).click();

    // Select last 7 days
    await page.getByRole('option', { name: /last 7 days/i }).click();

    // Dashboard should update
    await expect(page.getByTestId('date-range-display')).toContainText(/7 days/i);
  });

  test('should display threat trends chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /threat trends/i })).toBeVisible();

    const trendsChart = page.locator('[data-testid="trends-chart"]');
    await expect(trendsChart).toBeVisible();
  });

  test('should show notification bell with count', async ({ page }) => {
    const notificationBell = page.getByRole('button', { name: /notifications/i });
    await expect(notificationBell).toBeVisible();

    // May have notification count badge
    const badge = page.locator('[data-testid="notification-count"]');
    if (await badge.isVisible()) {
      await expect(badge).toHaveText(/\d+/);
    }
  });

  test('should open notification panel', async ({ page }) => {
    await page.getByRole('button', { name: /notifications/i }).click();

    await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible();
  });
});
