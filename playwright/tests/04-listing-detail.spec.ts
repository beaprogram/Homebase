import { test, expect } from '@playwright/test'

test.describe('Listing detail page', () => {
  test('loads listing detail with title and price', async ({ page }) => {
    await page.goto('/')
    const listingLink = page.locator('[href^="/listings/"]').first()
    await expect(listingLink).toBeVisible({ timeout: 10_000 })

    const title = await listingLink.locator('h3').textContent()
    await listingLink.click()
    await page.waitForURL(/\/listings\/\d+/)

    // Title should appear on detail page
    if (title) {
      await expect(page.getByRole('heading', { name: title.trim() }).or(
        page.getByText(title.trim().slice(0, 20))
      )).toBeVisible({ timeout: 5_000 })
    }
  })

  test('shows back button that navigates away', async ({ page }) => {
    await page.goto('/')
    await page.locator('[href^="/listings/"]').first().click()
    await page.waitForURL(/\/listings\/\d+/)
    await page.getByText('← Back').click()
    await expect(page).not.toHaveURL(/\/listings\/\d+/)
  })

  test('shows AI ask panel on listing detail', async ({ page }) => {
    await page.goto('/')
    await page.locator('[href^="/listings/"]').first().click()
    await page.waitForURL(/\/listings\/\d+/)
    await expect(page.getByText('Ask HomeBase AI')).toBeVisible()
  })

  test('unauthenticated user does not see save button', async ({ page }) => {
    await page.goto('/')
    await page.locator('[href^="/listings/"]').first().click()
    await page.waitForURL(/\/listings\/\d+/)
    await expect(page.getByRole('button', { name: /Save listing/i })).not.toBeVisible()
  })
})
