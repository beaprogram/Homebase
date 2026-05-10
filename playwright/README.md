# HomeBase — Playwright E2E Tests

## Run locally

```bash
# Prerequisites: docker-compose up --build must be running
cd playwright
npm install
npx playwright install chromium

# Run all tests headless
npm test

# Run with browser visible
npm run test:headed

# Interactive Playwright UI
npm run test:ui
```

## Test suites

| File | Coverage |
|------|----------|
| `01-home.spec.ts` | Home page load, listing cards, type filter, pagination |
| `02-auth.spec.ts` | Register, login, logout, duplicate email, wrong password, redirect |
| `03-search-save.spec.ts` | **Critical journey**: search → save → logout → login → see saved, unsave |
| `04-listing-detail.spec.ts` | Detail page load, back nav, AI panel visible, save button auth-gated |
| `05-ai-qa.spec.ts` | AI panel visible, query submit, empty query no-op |
| `06-mobile.spec.ts` | Mobile Chrome responsive layout |

## Environment

Set `BASE_URL` env var to target a different environment:

```bash
BASE_URL=https://homebase-frontend.azurewebsites.net npm test
```
