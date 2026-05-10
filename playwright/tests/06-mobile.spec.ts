import { test, expect } from '@playwright/test'

// Runs on Mobile Chrome project only (configured in playwright.config.ts)
test.describe('Mobile layout', () => {
  test('home page renders correctly on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('HomeBase').first()).toBeVisible()
    // Filters should still be accessible on mobile (stacked layout)
    await expect(page.getByText('Filters')).toBeVisible()
  })

  test('navbar is visible and functional on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()
  })
})
