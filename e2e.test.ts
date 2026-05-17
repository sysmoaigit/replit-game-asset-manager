import { test, expect } from '@playwright/test';

test('StartScreen and Journey screen redesign', async ({ page }) => {
  // 1. Load the home page. Verify [data-testid="screen-start"] is visible.
  await page.goto('/');
  await expect(page.getByTestId('screen-start')).toBeVisible();

  // 2. Verify the AAA tile grid: [data-testid="tile-grid"] is visible and contains tiles.
  await expect(page.getByTestId('tile-grid')).toBeVisible();
  await expect(page.getByTestId('btn-new-game')).toBeVisible();
  await expect(page.getByTestId('btn-tutorial')).toBeVisible();
  await expect(page.getByTestId('btn-album')).toBeVisible();
  await expect(page.getByTestId('btn-settings-tile')).toBeVisible();
  await expect(page.getByTestId('btn-journey')).toBeVisible();
  await expect(page.getByTestId('btn-story-mode')).toBeVisible();

  // 3. Verify btn-continue exists and is disabled when there's no save.
  const btnContinue = page.getByTestId('btn-continue');
  await expect(btnContinue).toBeVisible();
  await expect(btnContinue).toBeDisabled();

  // Capture screenshot: home with tiles
  await page.screenshot({ path: 'home-tiles.png' });

  // 4. Click [data-testid="btn-journey"]. Verify [data-testid="screen-journey"] appears.
  await page.getByTestId('btn-journey').click();
  await expect(page.getByTestId('screen-journey')).toBeVisible();
  
  // Verify Journey screen content
  await expect(page.getByText('My Journey')).toBeVisible();
  await expect(page.getByText('Overall completion')).toBeVisible();
  await expect(page.getByTestId('tab-endings')).toBeVisible();
  await expect(page.getByTestId('tab-achievements')).toBeVisible();
  await expect(page.getByTestId('tab-eggs')).toBeVisible();
  
  // At least one ending-row (locked silhouettes)
  await expect(page.locator('[data-testid^="ending-row-"]').first()).toBeVisible();

  // Capture screenshot: journey screen endings tab
  await page.screenshot({ path: 'journey-endings.png' });

  // 5. Click [data-testid="tab-eggs"]. Verify at least one [data-testid^="egg-"] element is visible.
  await page.getByTestId('tab-eggs').click();
  await expect(page.locator('[data-testid^="egg-"]').first()).toBeVisible();
  
  // Capture screenshot: journey screen eggs tab
  await page.screenshot({ path: 'journey-eggs.png' });

  // 6. Click [data-testid="tab-achievements"]. Verify at least one [data-testid^="ach-"] element appears.
  await page.getByTestId('tab-achievements').click();
  await expect(page.locator('[data-testid^="ach-"]').first()).toBeVisible();

  // 7. Click [data-testid="btn-journey-close"]. Verify we return to [data-testid="screen-start"].
  await page.getByTestId('btn-journey-close').click();
  await expect(page.getByTestId('screen-start')).toBeVisible();

  // 8. Click [data-testid="btn-tutorial"] from the home. Verify the tutorial loads (no crash).
  await page.getByTestId('btn-tutorial').click();
  await expect(page.getByTestId('screen-tutorial')).toBeVisible();
});
