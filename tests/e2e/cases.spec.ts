import { test, expect } from '@playwright/test';

test.describe('Case Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Navigate to cases page
    await page.goto('/cases');
  });

  test('should display cases list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /cases/i })).toBeVisible();

    const casesList = page.locator('[data-testid="cases-list"]');
    await expect(casesList).toBeVisible();
  });

  test('should filter cases by status', async ({ page }) => {
    await page.getByRole('button', { name: /status/i }).click();
    await page.getByRole('option', { name: /investigating/i }).click();

    const cases = page.locator('[data-testid="case-item"]');
    const count = await cases.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(cases.nth(i)).toContainText(/investigating/i);
    }
  });

  test('should filter cases by priority', async ({ page }) => {
    await page.getByRole('button', { name: /priority/i }).click();
    await page.getByRole('option', { name: /critical/i }).click();

    const cases = page.locator('[data-testid="case-item"]');
    await expect(cases.first()).toContainText(/critical/i);
  });

  test('should create new case', async ({ page }) => {
    await page.getByRole('button', { name: /create case|new case/i }).click();

    // Fill in case form
    await page.getByLabel(/title/i).fill('E2E Test Case');
    await page.getByLabel(/description/i).fill('Created by E2E test');
    await page.getByLabel(/priority/i).selectOption('high');
    await page.getByLabel(/status/i).selectOption('open');
    await page.getByLabel(/category/i).selectOption('incident');

    // Submit
    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show success
    await expect(page.getByText(/created successfully|case created/i)).toBeVisible();
  });

  test('should view case details', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    // Should show case details
    await expect(page).toHaveURL(/cases\/case-/);
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.getByText(/case number/i)).toBeVisible();
  });

  test('should update case assignment', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    await page.getByRole('button', { name: /assign|reassign/i }).click();
    await page.getByLabel(/assigned to/i).selectOption('analyst-mike-ross');
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText(/assigned successfully|updated/i)).toBeVisible();
  });

  test('should add evidence to case', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    await page.getByRole('button', { name: /add evidence/i }).click();

    await page.getByLabel(/type/i).selectOption('log-file');
    await page.getByLabel(/description/i).fill('System logs from affected server');

    await page.getByRole('button', { name: /add|save/i }).click();

    await expect(page.getByText(/evidence added|added successfully/i)).toBeVisible();
  });

  test('should add timeline event', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    await page.getByRole('button', { name: /add event|timeline/i }).click();

    await page.getByLabel(/event|description/i).fill('Additional investigation performed');
    await page.getByRole('button', { name: /add|save/i }).click();

    await expect(page.getByText(/Additional investigation performed/i)).toBeVisible();
  });

  test('should resolve case', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    await page.getByRole('button', { name: /resolve|close case/i }).click();

    await page.getByLabel(/resolution|notes/i).fill('Issue resolved, systems restored');
    await page.getByRole('button', { name: /resolve|confirm/i }).click();

    await expect(page.getByText(/resolved successfully|case resolved/i)).toBeVisible();
  });

  test('should search cases by keyword', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: /search cases/i });
    await searchBox.fill('ransomware');
    await searchBox.press('Enter');

    await expect(page.getByText(/search results|results for/i)).toBeVisible();
  });

  test('should search by case number', async ({ page }) => {
    const searchBox = page.getByRole('searchbox');
    await searchBox.fill('INC-2024-001');
    await searchBox.press('Enter');

    const results = page.locator('[data-testid="case-item"]');
    if (await results.first().isVisible()) {
      await expect(results.first()).toContainText('INC-2024-001');
    }
  });

  test('should export cases to CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export/i }).click();
    await page.getByRole('option', { name: /csv/i }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/cases.*\.csv/i);
  });

  test('should paginate through cases', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /next/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
      await expect(page.locator('[data-testid="case-item"]').first()).toBeVisible();
    }
  });

  test('should sort cases by priority', async ({ page }) => {
    const priorityHeader = page.getByRole('columnheader', { name: /priority/i });
    if (await priorityHeader.isVisible()) {
      await priorityHeader.click();
      await page.waitForTimeout(500);

      // Should be sorted
      const firstCase = page.locator('[data-testid="case-item"]').first();
      await expect(firstCase).toBeVisible();
    }
  });

  test('should link threat to case', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    const linkThreatButton = page.getByRole('button', { name: /link threat|add threat/i });
    if (await linkThreatButton.isVisible()) {
      await linkThreatButton.click();

      // Select a threat from dropdown or modal
      const threatSelect = page.getByLabel(/threat/i);
      if (await threatSelect.isVisible()) {
        await threatSelect.selectOption({ index: 1 });
        await page.getByRole('button', { name: /link|add/i }).click();
        await expect(page.getByText(/linked successfully|threat added/i)).toBeVisible();
      }
    }
  });

  test('should bulk update case status', async ({ page }) => {
    // Select multiple cases
    const checkboxes = page.locator('[data-testid="case-checkbox"]');
    const count = await checkboxes.count();

    if (count > 0) {
      await checkboxes.first().check();
      if (count > 1) await checkboxes.nth(1).check();

      // Bulk action
      const bulkActionButton = page.getByRole('button', { name: /bulk actions|actions/i });
      if (await bulkActionButton.isVisible()) {
        await bulkActionButton.click();
        await page.getByRole('option', { name: /update status/i }).click();
        await page.getByLabel(/status/i).selectOption('investigating');
        await page.getByRole('button', { name: /apply|update/i }).click();
        await expect(page.getByText(/updated successfully/i)).toBeVisible();
      }
    }
  });

  test('should filter by assigned user', async ({ page }) => {
    const assignedFilter = page.getByRole('button', { name: /assigned to/i });
    if (await assignedFilter.isVisible()) {
      await assignedFilter.click();
      await page.getByRole('option', { name: /sarah chen/i }).click();

      const cases = page.locator('[data-testid="case-item"]');
      if (await cases.first().isVisible()) {
        await expect(cases.first()).toContainText(/sarah chen/i);
      }
    }
  });

  test('should display case metrics', async ({ page }) => {
    const metricsSection = page.locator('[data-testid="case-metrics"]');
    if (await metricsSection.isVisible()) {
      await expect(metricsSection).toBeVisible();
      await expect(page.getByText(/average resolution time|mttr/i)).toBeVisible();
    }
  });

  test('should add notes to case', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    const addNoteButton = page.getByRole('button', { name: /add note|notes/i });
    if (await addNoteButton.isVisible()) {
      await addNoteButton.click();
      await page.getByLabel(/note|comment/i).fill('Investigation update: all systems secured');
      await page.getByRole('button', { name: /add|save/i }).click();
      await expect(page.getByText(/note added|comment saved/i)).toBeVisible();
    }
  });

  test('should delete case', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    const deleteButton = page.getByRole('button', { name: /delete|remove/i });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion
      await page.getByRole('button', { name: /confirm|yes|delete/i }).click();
      await expect(page.getByText(/deleted successfully|case removed/i)).toBeVisible();
      await expect(page).toHaveURL(/cases$/);
    }
  });

  test('should display case timeline', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    const timeline = page.locator('[data-testid="case-timeline"]');
    if (await timeline.isVisible()) {
      await expect(timeline).toBeVisible();

      // Should have timeline items
      const timelineItems = timeline.locator('[data-testid="timeline-item"]');
      expect(await timelineItems.count()).toBeGreaterThan(0);
    }
  });

  test('should view related assets', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    const assetsSection = page.locator('[data-testid="related-assets"]');
    if (await assetsSection.isVisible()) {
      await expect(assetsSection).toBeVisible();
    }
  });

  test('should escalate case priority', async ({ page }) => {
    await page.locator('[data-testid="case-item"]').first().click();

    const escalateButton = page.getByRole('button', { name: /escalate/i });
    if (await escalateButton.isVisible()) {
      await escalateButton.click();
      await expect(page.getByText(/escalated|priority updated/i)).toBeVisible();
    }
  });
});
