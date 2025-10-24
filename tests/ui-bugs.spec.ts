import { test, expect } from '@playwright/test';

test.describe('UI Bug Fixes', () => {
  test('Player should not overlap the last station', async ({ page }) => {
    // Navigate to a country with a long list of stations
    await page.goto('/?country=United%20States');

    // Wait for the stations to load
    await page.waitForSelector('.station-card');

    // Find the last station
    const lastStation = page.locator('.station-card').last();

    // Scroll to the last station
    await lastStation.scrollIntoViewIfNeeded();

    // Take a screenshot of the last station to visually inspect the overlap
    await expect(lastStation).toHaveScreenshot('last-station-before-fix.png');
  });

  test('Tuning indicator should appear on route change', async ({ page }) => {
    await page.goto('/');

    // Click on the first country link to trigger a route change
    await page.locator('.country-card').first().click();

    // Expect the "Tuning" indicator to be visible
    await expect(page.locator('text=Tuning')).toBeVisible();
  });

  test('Region selection UX should be smooth', async ({ page }) => {
    await page.goto('/?country=United%20States');

    // Click the "Change region" button
    await page.getByRole('button', { name: 'Change region' }).click();

    // Select a continent
    await page.getByPlaceholder('Continent').click();
    await page.getByText('Europe').click();

    // Expect the page not to have scrolled
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);

    // Expect the country selector to be enabled
    await expect(page.getByPlaceholder('Country')).toBeEnabled();
  });
});
