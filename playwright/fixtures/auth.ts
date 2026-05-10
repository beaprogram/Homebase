import { test as base, Page } from '@playwright/test'

const TEST_USER = {
  name: 'E2E Tester',
  email: `e2e+${Date.now()}@homebase-test.com`,
  password: 'TestPass123!',
}

export { TEST_USER }

export type AuthFixtures = {
  registeredPage: Page
  loggedInPage: Page
}

export const test = base.extend<AuthFixtures>({
  registeredPage: async ({ page }, use) => {
    await page.goto('/register')
    await page.getByLabel('Name').fill(TEST_USER.name)
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.waitForURL('/')
    await use(page)
  },

  loggedInPage: async ({ page }, use) => {
    // Register first, then use that session
    await page.goto('/register')
    await page.getByLabel('Name').fill(TEST_USER.name)
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.waitForURL('/')
    await use(page)
  },
})

export { expect } from '@playwright/test'
