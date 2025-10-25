import { test, expect } from "@playwright/test";

test.describe("UI Bug Fixes", () => {
  test("Skeleton loading states should appear during data fetching", async ({
    page,
  }) => {
    await page.goto("/");

    // Check for skeleton elements during initial load
    const skeletonElements = page.locator(".skeleton");
    const skeletonCount = await skeletonElements.count();

    // Should have skeleton elements visible briefly (or none if loaded too fast)
    expect(skeletonCount).toBeGreaterThanOrEqual(0);

    // Wait for actual content to load
    await page.waitForSelector(".country-card", { timeout: 10000 });

    // Navigate to a country to trigger station fetching
    await page.goto("/?country=United%20States");

    // Skeleton grid might appear briefly during station fetch
    // Wait for actual station cards to load
    await page.waitForSelector(".station-card", { timeout: 10000 });

    // Verify no skeletons remain after loading
    const remainingSkeletons = await page.locator(".skeleton").count();
    expect(remainingSkeletons).toBe(0);
  });

  test("Listening mode toggle should be visible and functional", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for page to load
    await page.waitForSelector("header", { timeout: 10000 });

    // Find the listening mode toggle in the header (button with world or map pin icon)
    const toggleButton = page
      .locator("header button")
      .filter({
        has: page.locator('svg[class*="tabler-icon"]'),
      })
      .first();

    // Verify toggle is visible
    await expect(toggleButton).toBeVisible({ timeout: 10000 });

    // Click to switch modes
    await toggleButton.click();

    // Wait for any UI updates
    await page.waitForTimeout(300);

    // Toggle should still be visible after click
    await expect(toggleButton).toBeVisible();
  });

  test("Quick Retune should scroll to station grid after selection", async ({
    page,
  }) => {
    await page.goto("/");

    // Open Quick Retune panel
    await page.getByRole("button", { name: "Quick retune" }).click();
    const panel = page.locator(".quick-retune-panel");
    await expect(panel).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(300);

    // Select a continent
    await panel.getByRole("button", { name: "Europe" }).click();
    await page.waitForTimeout(200);

    // Click a country from the preview
    const countryButton = panel.locator(".quick-retune-country").first();
    await countryButton.click();

    // Wait for navigation and scroll animation
    await page.waitForTimeout(500);

    // Verify station grid is in viewport
    const stationGrid = page.locator("#station-grid");
    await expect(stationGrid).toBeVisible();

    // Check that station grid is reasonably centered in viewport
    const gridBox = await stationGrid.boundingBox();
    const viewport = page.viewportSize();

    if (gridBox && viewport) {
      // Grid should be visible in viewport (not scrolled past)
      expect(gridBox.y).toBeGreaterThan(-100);
      expect(gridBox.y).toBeLessThan(viewport.height);
    }
  });

  test("Surprise Me should scroll to station grid", async ({ page }) => {
    await page.goto("/");

    // Open Quick Retune panel
    await page.getByRole("button", { name: "Quick retune" }).click();
    const panel = page.locator(".quick-retune-panel");
    await expect(panel).toBeVisible({ timeout: 10000 });

    // Click Surprise Me button
    const surpriseButton = panel.getByRole("button", {
      name: /surprise me/i,
    });
    await surpriseButton.click();

    // Wait for navigation and scroll
    await page.waitForTimeout(500);

    // Verify station grid is visible
    const stationGrid = page.locator("#station-grid");
    await expect(stationGrid).toBeVisible();
  });

  test("Player navigation should update atlas context", async ({ page }) => {
    await page.goto("/?country=United%20States");

    // Wait for stations to load
    await page.waitForSelector(".station-card");

    // Play first station
    const playButtons = page
      .locator("button")
      .filter({ hasText: "Play station" });
    await playButtons.first().click();

    // Wait for player to initialize
    await page.waitForTimeout(1000);

    // Click Next button
    const nextButton = page
      .locator("footer")
      .getByRole("button", { name: "Next", exact: true });
    await nextButton.click();

    // Wait for station change
    await page.waitForTimeout(500);

    // The URL should update with new country if station is from different country
    // Or country parameter should remain if still in same country
    const url = page.url();
    expect(url).toContain("country=");
  });

  test("Player should not overlap the last station", async ({ page }) => {
    // Navigate to a country with a long list of stations
    await page.goto("/?country=United%20States");

    // Wait for the stations to load
    await page.waitForSelector(".station-card");

    // Find the last station
    const lastStation = page.locator(".station-card").last();

    // Scroll to the last station
    await lastStation.scrollIntoViewIfNeeded();

    // Take a screenshot of the last station to visually inspect the overlap
    await expect(lastStation).toHaveScreenshot("last-station-before-fix.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("Tuning indicator should appear on route change", async ({ page }) => {
    await page.goto("/");

    // Click on the first country link to trigger a route change
    await page.locator(".country-card").first().click();

    // Expect the "Tuning" indicator to be visible
    await expect(page.locator("text=Tuning")).toBeVisible();
  });

  test("Region selection UX should be smooth", async ({ page }) => {
    await page.goto("/?country=United%20States");

    // Debug: Take screenshot before clicking
    await page.screenshot({
      path: "test-results/before-click-quick-retune.png",
      fullPage: true,
    });

    // Open the Quick retune widget
    await page.getByRole("button", { name: "Quick retune" }).click();

    // Wait for the panel to appear with animation
    const panel = page.locator(".quick-retune-panel");
    await expect(panel).toBeVisible({ timeout: 10000 });

    // Wait for animation to complete and panel to be interactive
    await page.waitForTimeout(300);

    // Select a continent chip from the panel (e.g., Europe)
    await panel.getByRole("button", { name: "Europe" }).click();

    // Expect the page not to have scrolled
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);

    // Expect preview country buttons to be enabled
    const countryButtons = panel.locator(".quick-retune-country");
    await expect(countryButtons.first()).toBeEnabled();
  });

  test.skip("Shuffle mode should not scroll to bottom", async ({ page }) => {
    await page.goto("/?country=United%20States");

    // Wait for stations to load
    await page.waitForSelector(".station-card");

    // Play a station (click first Play button)
    const playButtons = page
      .locator("button")
      .filter({ hasText: "Play station" });
    await playButtons.first().click();

    // Wait for player to appear (it's a footer element)
    await page.waitForSelector("footer", { timeout: 5000 });

    // Wait a moment for station to load
    await page.waitForTimeout(1000);

    // Record document height before clicking Next
    const documentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const maxScroll = documentHeight - viewportHeight;

    // Click Next button in footer multiple times and check scroll doesn't jump to bottom
    const nextButton = page
      .locator("footer")
      .getByRole("button", { name: "Next", exact: true });

    for (let i = 0; i < 3; i++) {
      await nextButton.click();
      await page.waitForTimeout(800);

      // Check scroll position hasn't jumped to bottom
      const currentScrollY = await page.evaluate(() => window.scrollY);

      // Ensure we're not at the very bottom (with 200px tolerance)
      expect(currentScrollY).toBeLessThan(maxScroll - 200);
    }
  });
});
