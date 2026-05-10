import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('loads and shows search UI', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/HomeBase/)
    await expect(page.getByRole('heading', { name: /Find your next home/i })).toBeVisible()
    await expect(page.getByText('Filters')).toBeVisible()
    await expect(page.getByText('Ask HomeBase AI')).toBeVisible()
  })

  test('shows listings after load', async ({ page }) => {
    await page.goto('/')
    // Wait for at least one listing card to appear (or empty state)
    await expect(
      page.locator('[href^="/listings/"]').first().or(page.getByText('No listings found'))
    ).toBeVisible({ timeout: 10_000 })
  })

  test('navbar has logo and login link', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('HomeBase').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible()
  })

  test('filter by type changes results', async ({ page }) => {
    await page.goto('/')
    // Click "Rental" filter button
    await page.getByRole('button', { name: 'Rental' }).click()
    await page.getByRole('button', { name: 'Search' }).click()
    // Only RENTAL badges should appear
    const badges = page.getByText('Rental')
    await expect(badges.first()).toBeVisible({ timeout: 8_000 })
    const saleCount = await page.getByText('For Sale').count()
    expect(saleCount).toBe(0)
  })

  test('pagination controls work when there are multiple pages', async ({ page }) => {
    await page.goto('/')
    const nextBtn = page.getByRole('button', { name: 'Next' })
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await expect(page.getByText('Page 2')).toBeVisible()
      await page.getByRole('button', { name: 'Previous' }).click()
      await expect(page.getByText('Page 1')).toBeVisible()
    }
  })
})
