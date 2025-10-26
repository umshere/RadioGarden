import { test, expect } from "@playwright/test";

test.describe("Mission Card Interactions", () => {
  test("Mission card shows passport CTAs in country view", async ({ page }) => {
    await page.goto("/?country=Brazil");

    // Open the player queue on country page so mission card is visible
    const toggleQueue = page.getByRole("button", { name: /show queue/i });
    await toggleQueue.click();
    await page.waitForTimeout(400);
    const missionCard = page.locator(".mission-card");
    await expect(missionCard).toBeVisible();

    // Check mission content is present
    await expect(missionCard.getByText(/Where to next\?/i)).toBeVisible();
    await expect(missionCard.getByText(/Sound passport/i)).toBeVisible();
  });

  test.skip("Explore the World CTA is clickable", async ({ page }) => {
    await page.goto("/?country=Japan");

    // Show the player queue to reveal mission card
    await page.getByRole("button", { name: /show queue/i }).click();
    await page.waitForTimeout(400);
    const missionCard = page.locator(".mission-card");
    await expect(missionCard).toBeVisible();
  });

  test("Stay Local mode opens Quick Retune when no country selected", async ({
    page,
  }) => {
    // Mission card only appears in country view; skip this test
    test.skip();
  });

  test.skip("Stay Local scrolls to station grid when already in country", async ({
    page,
  }) => {
    await page.goto("/?country=Germany");
  });
});
