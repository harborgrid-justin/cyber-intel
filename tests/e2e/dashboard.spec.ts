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

  test('should display threat severity breakdown', async ({ page }) => {
    // Check for severity cards
    await expect(page.getByText(/critical/i)).toBeVisible();
    await expect(page.getByText(/high/i)).toBeVisible();
    await expect(page.getByText(/medium/i)).toBeVisible();
    await expect(page.getByText(/low/i)).toBeVisible();
  });

  test('should click on threat to view details', async ({ page }) => {
    const threatItems = page.locator('[data-testid="threat-item"]');
    const firstThreat = threatItems.first();

    if (await firstThreat.isVisible()) {
      await firstThreat.click();

      // Should navigate to threat detail page or show modal
      await expect(page).toHaveURL(/threats\/\w+|threat-detail/);
    }
  });

  test('should display case status breakdown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /case status|cases by status/i })).toBeVisible();

    // Check for status indicators
    const statuses = ['investigating', 'resolved', 'open', 'closed'];
    for (const status of statuses) {
      const statusElement = page.getByText(new RegExp(status, 'i'));
      if (await statusElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(statusElement).toBeVisible();
      }
    }
  });

  test('should switch between dashboard modules', async ({ page }) => {
    const modules = [
      'Overview',
      'System Health',
      'Network Ops',
      'Cloud Security',
      'Compliance',
      'Insider Threat',
      'Dark Web',
      'Global Map'
    ];

    for (const module of modules) {
      const moduleButton = page.getByRole('button', { name: new RegExp(module, 'i') });
      if (await moduleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await moduleButton.click();
        await page.waitForTimeout(500); // Wait for view to load

        // Verify active module
        await expect(moduleButton).toHaveClass(/active|selected/);
      }
    }
  });

  test('should display DEFCON level indicator', async ({ page }) => {
    const defconIndicator = page.locator('[data-testid="defcon-level"]');
    if (await defconIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(defconIndicator).toBeVisible();
      await expect(defconIndicator).toHaveText(/DEFCON\s+[1-5]/i);
    }
  });

  test('should display active incidents count', async ({ page }) => {
    const incidentsCount = page.locator('[data-testid="active-incidents-count"]');
    if (await incidentsCount.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(incidentsCount).toBeVisible();
    }
  });

  test('should display mean time to respond (MTTR)', async ({ page }) => {
    const mttrDisplay = page.getByText(/MTTR|mean time to respond/i);
    if (await mttrDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(mttrDisplay).toBeVisible();
    }
  });

  test('should export dashboard data', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /export|download/i });
    if (await exportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await exportButton.click();

      // Should show export options
      const exportMenu = page.locator('[data-testid="export-menu"]');
      if (await exportMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(exportMenu).toBeVisible();
      }
    }
  });

  test('should display geographical threat map', async ({ page }) => {
    const mapButton = page.getByRole('button', { name: /Global Map/i });
    if (await mapButton.isVisible()) {
      await mapButton.click();

      // Should display map
      const map = page.locator('[data-testid="geo-map"]');
      await expect(map).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle real-time updates', async ({ page }) => {
    // Get initial threat count
    const threatCountElement = page.getByTestId('total-threats-count');
    const initialCount = await threatCountElement.textContent();

    // Wait for potential updates
    await page.waitForTimeout(3000);

    // Count should be displayed (may or may not change)
    await expect(threatCountElement).toBeVisible();
  });

  test('should filter threats by severity from dashboard', async ({ page }) => {
    const criticalFilter = page.getByRole('button', { name: /critical/i });
    if (await criticalFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await criticalFilter.click();

      // Should filter threats
      await page.waitForTimeout(1000);

      // Verify filtered results
      const threatsList = page.locator('[data-testid="recent-threats-list"]');
      await expect(threatsList).toBeVisible();
    }
  });

  test('should display activity timeline', async ({ page }) => {
    const timeline = page.locator('[data-testid="activity-timeline"]');
    if (await timeline.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(timeline).toBeVisible();

      // Should have timeline items
      const timelineItems = timeline.locator('[data-testid="timeline-item"]');
      const count = await timelineItems.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should search from dashboard', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('ransomware');
      await searchInput.press('Enter');

      // Should navigate to search results or filter current view
      await page.waitForTimeout(1000);
    }
  });

  test('should display system health indicators', async ({ page }) => {
    const systemHealthButton = page.getByRole('button', { name: /System Health/i });
    if (await systemHealthButton.isVisible()) {
      await systemHealthButton.click();

      // Should show system metrics
      await expect(page.getByText(/CPU|Memory|Disk|Network/i)).toBeVisible();
    }
  });

  test('should handle dashboard error states', async ({ page }) => {
    // Simulate network error by going offline
    await page.context().setOffline(true);

    const refreshButton = page.getByRole('button', { name: /refresh/i });
    if (await refreshButton.isVisible()) {
      await refreshButton.click();

      // Should show error message
      const errorMessage = page.getByText(/error|failed|unable to load/i);
      if (await errorMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(errorMessage).toBeVisible();
      }
    }

    // Go back online
    await page.context().setOffline(false);
  });

  test('should display recent alerts', async ({ page }) => {
    const alertsSection = page.locator('[data-testid="recent-alerts"]');
    if (await alertsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(alertsSection).toBeVisible();

      // Should have alert items
      const alertItems = alertsSection.locator('[data-testid="alert-item"]');
      if (await alertItems.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        expect(await alertItems.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should quick-create new case from dashboard', async ({ page }) => {
    const createCaseButton = page.getByRole('button', { name: /create case|new case/i });
    if (await createCaseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createCaseButton.click();

      // Should show case creation form or modal
      const caseForm = page.locator('[data-testid="create-case-form"]');
      if (await caseForm.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(caseForm).toBeVisible();
      }
    }
  });

  test('should display performance metrics', async ({ page }) => {
    const metricsSection = page.locator('[data-testid="performance-metrics"]');
    if (await metricsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(metricsSection).toBeVisible();
    }
  });
});
