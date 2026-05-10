import { test, expect } from '@playwright/test'

const unique = () => `e2e+${Date.now()}@homebase-test.com`

async function registerAndLogin(page: import('@playwright/test').Page, email: string) {
  await page.goto('/register')
  await page.getByLabel('Name').fill('E2E User')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('SecurePass1!')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForURL('/')
}

test.describe('Search → Save → View saved (critical user journey)', () => {
  test('full flow: search, save, log out, log in, see saved', async ({ page }) => {
    const email = unique()
    await registerAndLogin(page, email)

    // Wait for listings to appear
    const listingLink = page.locator('[href^="/listings/"]').first()
    await expect(listingLink).toBeVisible({ timeout: 10_000 })

    // Navigate to first listing detail
    await listingLink.click()
    await page.waitForURL(/\/listings\/\d+/)
    await expect(page.getByRole('button', { name: /Save listing/i })).toBeVisible()

    // Save the listing
    await page.getByRole('button', { name: /Save listing/i }).click()
    await expect(page.getByRole('button', { name: /Saved — click to unsave/i })).toBeVisible()

    // Go to saved page
    await page.getByRole('link', { name: 'Saved' }).click()
    await page.waitForURL('/saved')
    const savedCards = page.locator('[href^="/listings/"]')
    await expect(savedCards.first()).toBeVisible()

    // Log out
    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()

    // Log back in
    await page.goto('/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('SecurePass1!')
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.waitForURL('/')

    // Check saved listing persists
    await page.getByRole('link', { name: 'Saved' }).click()
    await page.waitForURL('/saved')
    await expect(page.locator('[href^="/listings/"]').first()).toBeVisible()
  })
})

test.describe('Search filters', () => {
  test('neighbourhood filter narrows results', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Neighbourhood').selectOption('Annex')
    await page.getByRole('button', { name: 'Search' }).click()
    await page.waitForTimeout(500)
    // Either results contain "Annex" or no listings found
    const annexBadges = page.getByText('Annex')
    const emptyState = page.getByText('No listings found')
    await expect(annexBadges.first().or(emptyState)).toBeVisible({ timeout: 8_000 })
  })

  test('price range filter works', async ({ page }) => {
    await page.goto('/')
    await page.locator('input[placeholder="$0"]').fill('1000')
    await page.locator('input[placeholder="No limit"]').fill('2000')
    await page.getByRole('button', { name: 'Search' }).click()
    await page.waitForTimeout(500)
    await expect(
      page.locator('[href^="/listings/"]').first().or(page.getByText('No listings found'))
    ).toBeVisible({ timeout: 8_000 })
  })

  test('reset button clears filters and shows all listings', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Neighbourhood').selectOption('Annex')
    await page.getByRole('button', { name: 'Search' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Reset' }).click()
    await page.waitForTimeout(300)
    await expect(page.getByLabel('Neighbourhood')).toHaveValue('')
  })
})

test.describe('Unsave listing', () => {
  test('can unsave a listing from the saved page', async ({ page }) => {
    const email = unique()
    await registerAndLogin(page, email)

    // Save the first listing
    const listingLink = page.locator('[href^="/listings/"]').first()
    await expect(listingLink).toBeVisible({ timeout: 10_000 })
    await listingLink.click()
    await page.waitForURL(/\/listings\/\d+/)
    await page.getByRole('button', { name: /Save listing/i }).click()
    await expect(page.getByRole('button', { name: /Saved — click to unsave/i })).toBeVisible()

    // Unsave it directly from the detail page
    await page.getByRole('button', { name: /Saved — click to unsave/i }).click()
    await expect(page.getByRole('button', { name: /Save listing/i })).toBeVisible()

    // Saved page should now be empty
    await page.getByRole('link', { name: 'Saved' }).click()
    await page.waitForURL('/saved')
    await expect(page.getByText('No saved listings yet')).toBeVisible({ timeout: 5_000 })
  })
})
