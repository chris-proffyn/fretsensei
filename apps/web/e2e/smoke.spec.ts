import { test, expect } from '@playwright/test';

test.describe('ModeWise web smoke', () => {
  test('loads the homepage at /', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: /Welcome to ModeWise/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Mode Practice/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /How to use ModeWise/i })).toBeVisible();
    await expect(page.getByText(/Free v1: no sign-up, no account, just open and play/i)).toBeVisible();
  });

  test('navigates from homepage to practice', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Mode Practice/i }).click();

    await expect(page).toHaveURL(/\/practice$/);
    await expect(page.getByTestId('fretboard-grid')).toBeVisible();
  });

  test('loads the how-to guide at /how-to', async ({ page }) => {
    await page.goto('/how-to');

    await expect(
      page.getByRole('heading', { level: 1, name: /How to use ModeWise/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Quick start' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Current v1 limits' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Start Mode Practice/i }).first()).toBeVisible();
  });

  test('loads the visualiser shell at /practice', async ({ page }) => {
    await page.goto('/practice');

    await expect(
      page.getByRole('heading', { level: 1, name: /Guitar Mode Mastery/i }),
    ).toBeVisible();
    await expect(page.getByRole('group', { name: 'Choose key' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Choose mode' })).toBeVisible();
    await expect(page.getByTestId('fretboard-grid')).toBeVisible();
  });

  test('returns home from practice via the Home control', async ({ page }) => {
    await page.goto('/practice');

    await page.getByRole('link', { name: /Return to homepage/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /Welcome to ModeWise/i }),
    ).toBeVisible();
  });

  test('opens how-to guide from practice via the help control', async ({ page }) => {
    await page.goto('/practice');

    await page.getByRole('link', { name: /How to use ModeWise/i }).click();

    await expect(page).toHaveURL(/\/how-to$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /How to use ModeWise/i }),
    ).toBeVisible();
  });

  test('focuses a fret window and enables playback', async ({ page }) => {
    await page.goto('/practice');

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

  test('changes mode from the toolbar modal', async ({ page }) => {
    await page.goto('/practice');

    await page.getByTestId('toolbar-mode-button').click();
    await page.getByRole('button', { name: 'Dorian' }).click();

    await expect(page.getByTestId('toolbar-mode-button')).toHaveTextContent('Dorian');
    await expect(page.getByLabel('Scale interval and note map')).toHaveCount(0);
  });
});
