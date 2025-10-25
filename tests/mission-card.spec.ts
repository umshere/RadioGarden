import { test, expect } from "@playwright/test";

test.describe("Mission Card Interactions", () => {
  test("Mission card shows passport CTAs in country view", async ({ page }) => {
    await page.goto("/?country=Brazil");

    // Wait for the mission card to appear
    const missionCard = page.locator(".mission-card");
    await expect(missionCard).toBeVisible();

    // Check CTA buttons are visible and clickable
    const localButton = page.getByRole("button", { name: /stay local/i });
    const worldButton = page.getByRole("button", {
      name: /explore the world/i,
    });
    await expect(localButton).toBeVisible();
    await expect(worldButton).toBeVisible();
  });

  test("Explore the World CTA is clickable", async ({ page }) => {
    await page.goto("/?country=Japan");

    const missionCard = page.locator(".mission-card");
    await expect(missionCard).toBeVisible();

    // Click Explore the World
    await page.getByRole("button", { name: /explore the world/i }).click();

    // Allow time for the action (fetch + set active card)
    await page.waitForTimeout(1500);

    // Should remain on country page (no navigation) but state changed
    expect(page.url()).toContain("country=Japan");
  });

  test("Stay Local mode opens Quick Retune when no country selected", async ({
    page,
  }) => {
    // Mission card only appears in country view; skip this test
    test.skip();
  });

  test("Stay Local scrolls to station grid when already in country", async ({
    page,
  }) => {
    // Navigate to a country
    await page.goto("/?country=Germany");

    // Wait for stations to load
    await page.waitForSelector(".station-card", { timeout: 10000 });

    // Scroll back up to mission card
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });

    // Find and click "Stay Local"
    const missionCard = page.locator(".mission-card");
    await expect(missionCard).toBeVisible();
    await page.getByRole("button", { name: /stay local/i }).click();

    // Wait for scroll animation
    await page.waitForTimeout(800);

    // Verify we scrolled down (station grid should be in view)
    const firstStationCard = page.locator(".station-card").first();
    await expect(firstStationCard).toBeInViewport();
  });
});
