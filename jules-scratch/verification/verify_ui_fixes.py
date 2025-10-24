from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # 1. Verify player overlap fix
    page.goto('http://localhost:3000/?country=United%20States')
    page.wait_for_selector('.station-card')
    last_station = page.locator('.station-card').last
    last_station.scroll_into_view_if_needed()
    last_station.get_by_role('button', name='Play station').click()
    expect(page.locator('footer')).to_be_visible()
    page.screenshot(path='jules-scratch/verification/player-overlap-fix.png')

    # 2. Verify region selection UX
    page.get_by_role('button', name='Change region').click()
    page.screenshot(path='jules-scratch/verification/region-selection-ux.png')

    # 3. Verify tuning indicator
    page.goto('http://localhost:3000/')
    page.wait_for_selector('.country-card')
    page.locator('a.country-card').first.click()
    expect(page.locator('text=Tuning')).to_be_visible()
    page.screenshot(path='jules-scratch/verification/tuning-indicator.png')

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
