import { test, expect } from '@playwright/test'

const unique = () => `e2e+${Date.now()}@homebase-test.com`

test.describe('Registration', () => {
  test('registers a new user and redirects home', async ({ page }) => {
    const email = unique()
    await page.goto('/register')
    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('SecurePass1!')
    await page.getByRole('button', { name: 'Create account' }).click()

    await page.waitForURL('/')
    await expect(page.getByText('Hi, Test User')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Saved' })).toBeVisible()
  })

  test('shows error for duplicate email', async ({ page }) => {
    const email = unique()

    // Register once
    await page.goto('/register')
    await page.getByLabel('Name').fill('First')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('SecurePass1!')
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.waitForURL('/')

    // Log out
    await page.getByRole('button', { name: 'Log out' }).click()

    // Try registering again with same email
    await page.goto('/register')
    await page.getByLabel('Name').fill('Second')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('SecurePass1!')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText(/Registration failed|already registered/i)).toBeVisible()
  })

  test('validates short password', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Name').fill('Alice')
    await page.getByLabel('Email').fill(unique())
    await page.getByLabel('Password').fill('short')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('Min 8 characters')).toBeVisible()
  })
})

test.describe('Login', () => {
  test('logs in with valid credentials', async ({ page }) => {
    const email = unique()

    // Register first
    await page.goto('/register')
    await page.getByLabel('Name').fill('Alice')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('SecurePass1!')
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.waitForURL('/')

    // Log out
    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()

    // Log back in
    await page.goto('/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('SecurePass1!')
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.waitForURL('/')
    await expect(page.getByText('Hi, Alice')).toBeVisible()
  })

  test('shows error for wrong password', async ({ page }) => {
    const email = unique()

    await page.goto('/register')
    await page.getByLabel('Name').fill('Bob')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('SecurePass1!')
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.waitForURL('/')
    await page.getByRole('button', { name: 'Log out' }).click()

    await page.goto('/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('WrongPassword!')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible()
  })

  test('redirects unauthenticated user from /saved to /login', async ({ page }) => {
    await page.goto('/saved')
    await page.waitForURL('/login')
    await expect(page).toHaveURL('/login')
  })
})
