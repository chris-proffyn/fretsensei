import { test, expect } from '@playwright/test';

test.describe('ModeWise web smoke', () => {
  test('loads the visualiser shell', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: /Guitar Mode Mastery/i }),
    ).toBeVisible();
    await expect(page.getByRole('group', { name: 'Choose key' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Choose mode' })).toBeVisible();
    await expect(page.getByTestId('fretboard-grid')).toBeVisible();
  });

  test('focuses a fret window and enables playback', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByLabel('Selected fret range 7-10'),
    ).toBeVisible();
    await expect(page.getByTestId('play-button')).toBeEnabled();

    await page.getByRole('button', { name: 'Set fret window start to 5' }).click();

    await expect(
      page.getByLabel('Selected fret range 5-8'),
    ).toBeVisible();
    await expect(page.getByTestId('play-button')).toBeEnabled();
  });

  test('changes mode and updates the scale map', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Dorian' }).click();

    await expect(page.getByLabel('Scale interval and note map')).toContainText('b3');
  });
});
