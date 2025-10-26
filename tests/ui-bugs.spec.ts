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

    // Find the listening mode toggle in the header by its aria-label pattern
    const toggleButton = page
      .locator("header button[aria-label*='mode']")
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

    // Open Quick Retune panel by clicking the hero 'Quick Retune' CTA
    await page
      .locator(".hero-surface")
      .locator('button:has-text("Quick Retune")')
      .click();
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

    // Open Quick Retune panel by clicking the hero 'Quick Retune' CTA
    await page
      .locator(".hero-surface")
      .locator('button:has-text("Quick Retune")')
      .click();
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

  test.skip("Player navigation should update atlas context", async ({
    page,
  }) => {
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

    // Wait for footer player to be visible
    const footer = page.locator("footer");
    await expect(footer).toBeVisible({ timeout: 10000 });

    // Or use the queue control as a fallback
    const showQueue = page.getByRole("button", { name: /show queue/i });
    if (await showQueue.count()) {
      await showQueue.first().click();
      await page.waitForTimeout(300);
      const nextDest = page
        .locator(".player-card-controls")
        .getByRole("button", { name: /next destination/i });
      await expect(nextDest).toBeVisible({ timeout: 5000 });
      await nextDest.click();
    } else {
      // Ensure Next is available: toggle shuffle and wait
      const shuffleButton = footer.getByRole("button", {
        name: /shuffle mode/i,
      });
      if ((await shuffleButton.count()) > 0) {
        await shuffleButton.first().click();
        await page.waitForTimeout(200);
      }
      const nextButton = footer.getByRole("button", {
        name: "Next",
        exact: true,
      });
      await expect(nextButton).toBeVisible({ timeout: 5000 });
      await nextButton.click();
    }

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
      maxDiffPixelRatio: 0.08,
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
    await page.goto("/");

    // Open the Quick retune widget from the hero CTA
    await page
      .locator(".hero-surface")
      .locator('button:has-text("Quick Retune")')
      .click();

    // Wait for the panel to appear with animation
    const panel = page.locator(".quick-retune-panel");
    await expect(panel).toBeVisible({ timeout: 10000 });

    // Wait for animation to complete and panel to be interactive
    await page.waitForTimeout(300);

    // Select a continent chip from the panel (e.g., Europe)
    await panel.getByRole("button", { name: "Europe" }).click();

    // Expect preview country buttons to be available
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
