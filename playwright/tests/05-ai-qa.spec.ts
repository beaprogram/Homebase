import { test, expect } from '@playwright/test'

test.describe('AI Q&A panel', () => {
  test('ask panel is visible on home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Ask HomeBase AI')).toBeVisible()
    await expect(page.getByPlaceholder(/2-bedroom rentals/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ask' })).toBeVisible()
  })

  test('submitting a query shows a response or error (smoke test)', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder(/2-bedroom rentals/i).fill('cheap rentals near downtown')
    await page.getByRole('button', { name: 'Ask' }).click()

    // Either gets an AI answer or shows the service-unavailable error
    await expect(
      page.getByText(/Unable to reach the AI service/).or(
        page.locator('.bg-violet-50') // answer box
      )
    ).toBeVisible({ timeout: 30_000 })
  })

  test('empty query does not submit', async ({ page }) => {
    await page.goto('/')
    const askBtn = page.getByRole('button', { name: 'Ask' })
    await askBtn.click()
    // No loading spinner should appear for empty query
    await expect(page.locator('.animate-spin')).not.toBeVisible()
  })
})
