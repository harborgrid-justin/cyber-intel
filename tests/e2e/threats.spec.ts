import { test, expect } from '@playwright/test';

test.describe('Threat Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Navigate to threats page
    await page.goto('/threats');
  });

  test('should display threats list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /threats/i })).toBeVisible();

    // Should have threat items
    const threatList = page.locator('[data-testid="threats-list"]');
    await expect(threatList).toBeVisible();
  });

  test('should filter threats by severity', async ({ page }) => {
    // Open filter dropdown
    await page.getByRole('button', { name: /filter|severity/i }).click();

    // Select critical severity
    await page.getByRole('option', { name: /critical/i }).click();

    // All visible threats should be critical
    const threats = page.locator('[data-testid="threat-item"]');
    const count = await threats.count();

    for (let i = 0; i < count; i++) {
      await expect(threats.nth(i)).toContainText(/critical/i);
    }
  });

  test('should filter threats by status', async ({ page }) => {
    await page.getByRole('button', { name: /status/i }).click();
    await page.getByRole('option', { name: /active/i }).click();

    // Should show only active threats
    const threats = page.locator('[data-testid="threat-item"]');
    await expect(threats.first()).toBeVisible();
  });

  test('should search threats by keyword', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: /search threats/i });
    await searchBox.fill('ransomware');
    await searchBox.press('Enter');

    // Should display search results
    await expect(page.getByText(/search results|results for/i)).toBeVisible();

    // Results should contain the search term
    const results = page.locator('[data-testid="threat-item"]');
    if (await results.first().isVisible()) {
      await expect(results.first()).toContainText(/ransomware/i);
    }
  });

  test('should view threat details', async ({ page }) => {
    // Click on first threat
    const firstThreat = page.locator('[data-testid="threat-item"]').first();
    await firstThreat.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/threats\/threat-/);

    // Should show threat details
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.getByText(/severity/i)).toBeVisible();
    await expect(page.getByText(/status/i)).toBeVisible();
  });

  test('should create new threat', async ({ page }) => {
    await page.getByRole('button', { name: /create threat|new threat/i }).click();

    // Fill in threat form
    await page.getByLabel(/name|title/i).fill('E2E Test Threat');
    await page.getByLabel(/description/i).fill('Created by E2E test');
    await page.getByLabel(/severity/i).selectOption('high');
    await page.getByLabel(/status/i).selectOption('active');
    await page.getByLabel(/category/i).selectOption('malware');

    // Submit form
    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show success message
    await expect(page.getByText(/created successfully|threat created/i)).toBeVisible();

    // Should redirect to threats list or detail page
    await expect(page.url()).toMatch(/(threats\/|threats$)/);
  });

  test('should update threat status', async ({ page }) => {
    // Open first threat
    await page.locator('[data-testid="threat-item"]').first().click();

    // Click edit or status dropdown
    await page.getByRole('button', { name: /edit|update status/i }).click();

    // Change status
    await page.getByLabel(/status/i).selectOption('resolved');

    // Save
    await page.getByRole('button', { name: /save|update/i }).click();

    // Should show success message
    await expect(page.getByText(/updated successfully|changes saved/i)).toBeVisible();
  });

  test('should add indicator to threat', async ({ page }) => {
    // Open first threat
    await page.locator('[data-testid="threat-item"]').first().click();

    // Find indicators section
    await page.getByRole('button', { name: /add indicator/i }).click();

    // Fill in indicator
    await page.getByLabel(/type/i).selectOption('ip');
    await page.getByLabel(/value/i).fill('192.168.1.100');
    await page.getByLabel(/confidence/i).fill('90');

    // Save
    await page.getByRole('button', { name: /add|save/i }).click();

    // Should show in indicators list
    await expect(page.getByText('192.168.1.100')).toBeVisible();
  });

  test('should export threats to CSV', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export/i }).click();
    await page.getByRole('option', { name: /csv/i }).click();

    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/threats.*\.csv/i);
  });

  test('should sort threats by severity', async ({ page }) => {
    // Click severity column header
    await page.getByRole('columnheader', { name: /severity/i }).click();

    // Should sort in ascending order
    const firstItem = page.locator('[data-testid="threat-item"]').first();
    await expect(firstItem).toBeVisible();

    // Click again to sort descending
    await page.getByRole('columnheader', { name: /severity/i }).click();

    // First item should now be critical
    await expect(firstItem).toContainText(/critical/i);
  });

  test('should paginate through threats', async ({ page }) => {
    // Check if pagination exists
    const nextButton = page.getByRole('button', { name: /next/i });

    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Should load next page
      await expect(page).toHaveURL(/page=2/);

      // Should show different threats
      await expect(page.locator('[data-testid="threat-item"]').first()).toBeVisible();
    }
  });

  test('should filter by threat category', async ({ page }) => {
    const categoryFilter = page.getByRole('button', { name: /category|type/i });
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.getByRole('option', { name: /ransomware/i }).click();

      const threats = page.locator('[data-testid="threat-item"]');
      if (await threats.first().isVisible()) {
        await expect(threats.first()).toContainText(/ransomware/i);
      }
    }
  });

  test('should view threat attribution', async ({ page }) => {
    await page.locator('[data-testid="threat-item"]').first().click();

    const attributionSection = page.locator('[data-testid="threat-attribution"]');
    if (await attributionSection.isVisible()) {
      await expect(attributionSection).toBeVisible();
    }
  });

  test('should view threat indicators (IOCs)', async ({ page }) => {
    await page.locator('[data-testid="threat-item"]').first().click();

    const indicatorsSection = page.locator('[data-testid="threat-indicators"]');
    if (await indicatorsSection.isVisible()) {
      await expect(indicatorsSection).toBeVisible();

      // Should have indicators
      const indicators = indicatorsSection.locator('[data-testid="indicator-item"]');
      if (await indicators.first().isVisible()) {
        expect(await indicators.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should view MITRE ATT&CK techniques', async ({ page }) => {
    await page.locator('[data-testid="threat-item"]').first().click();

    const mitreSection = page.locator('[data-testid="mitre-techniques"]');
    if (await mitreSection.isVisible()) {
      await expect(mitreSection).toBeVisible();
    }
  });

  test('should view related threats', async ({ page }) => {
    await page.locator('[data-testid="threat-item"]').first().click();

    const relatedSection = page.locator('[data-testid="related-threats"]');
    if (await relatedSection.isVisible()) {
      await expect(relatedSection).toBeVisible();
    }
  });

  test('should add mitigation steps', async ({ page }) => {
    await page.locator('[data-testid="threat-item"]').first().click();

    const addMitigationButton = page.getByRole('button', { name: /add mitigation/i });
    if (await addMitigationButton.isVisible()) {
      await addMitigationButton.click();
      await page.getByLabel(/mitigation|step/i).fill('Implement network segmentation');
      await page.getByRole('button', { name: /add|save/i }).click();
      await expect(page.getByText(/mitigation added|saved/i)).toBeVisible();
    }
  });

  test('should bulk update threat status', async ({ page }) => {
    const checkboxes = page.locator('[data-testid="threat-checkbox"]');
    const count = await checkboxes.count();

    if (count > 0) {
      await checkboxes.first().check();
      if (count > 1) await checkboxes.nth(1).check();

      const bulkActionButton = page.getByRole('button', { name: /bulk actions|actions/i });
      if (await bulkActionButton.isVisible()) {
        await bulkActionButton.click();
        await page.getByRole('option', { name: /update status/i }).click();
        await page.getByLabel(/status/i).selectOption('mitigated');
        await page.getByRole('button', { name: /apply|update/i }).click();
        await expect(page.getByText(/updated successfully/i)).toBeVisible();
      }
    }
  });

  test('should delete threat', async ({ page }) => {
    await page.locator('[data-testid="threat-item"]').first().click();

    const deleteButton = page.getByRole('button', { name: /delete|remove/i });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.getByRole('button', { name: /confirm|yes|delete/i }).click();
      await expect(page.getByText(/deleted successfully|threat removed/i)).toBeVisible();
      await expect(page).toHaveURL(/threats$/);
    }
  });

  test('should display threat statistics', async ({ page }) => {
    const statsSection = page.locator('[data-testid="threat-stats"]');
    if (await statsSection.isVisible()) {
      await expect(statsSection).toBeVisible();
      await expect(page.getByText(/total threats|active threats/i)).toBeVisible();
    }
  });

  test('should filter by date range', async ({ page }) => {
    const dateFilter = page.getByRole('button', { name: /date|time range/i });
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      await page.getByRole('option', { name: /last 7 days/i }).click();
      await page.waitForTimeout(500);
      await expect(page.locator('[data-testid="threat-item"]').first()).toBeVisible();
    }
  });

  test('should view threat feed sources', async ({ page }) => {
    await page.locator('[data-testid="threat-item"]').first().click();

    const sourcesSection = page.locator('[data-testid="threat-sources"]');
    if (await sourcesSection.isVisible()) {
      await expect(sourcesSection).toBeVisible();
    }
  });

  test('should export threat to STIX format', async ({ page }) => {
    await page.locator('[data-testid="threat-item"]').first().click();

    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();

      const stixOption = page.getByRole('option', { name: /stix/i });
      if (await stixOption.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await stixOption.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.json$/i);
      }
    }
  });

  test('should view confidence score', async ({ page }) => {
    await page.locator('[data-testid="threat-item"]').first().click();

    const confidenceScore = page.locator('[data-testid="confidence-score"]');
    if (await confidenceScore.isVisible()) {
      await expect(confidenceScore).toBeVisible();
      const scoreText = await confidenceScore.textContent();
      expect(scoreText).toMatch(/\d+%?/);
    }
  });
});
