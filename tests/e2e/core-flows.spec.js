import { test, expect } from '@playwright/test'

function mockApis(page) {
  page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    const url = new URL(route.request().url())
    const query = (url.searchParams.get('name') || '').toLowerCase()

    if (query.includes('invalid')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [] }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 1,
            name: 'Los Angeles',
            latitude: 34.05,
            longitude: -118.24,
            country: 'United States',
            country_code: 'US',
            admin1: 'California',
          },
        ],
      }),
    })
  })

  page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          time: '2026-03-18T10:00',
          temperature_2m: 20,
          apparent_temperature: 19,
          relative_humidity_2m: 60,
          weather_code: 2,
          wind_speed_10m: 18,
          wind_direction_10m: 180,
          visibility: 10000,
        },
      }),
    })
  })
}

test.describe('Core weather app flows', () => {
  test('search success shows weather fields', async ({ page }) => {
    await mockApis(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()

    await expect(page.getByText('Partly Cloudy')).toBeVisible()
    await expect(page.getByText('Humidity')).toBeVisible()
    await expect(page.getByText('Wind')).toBeVisible()
    await expect(page.getByText('Visibility')).toBeVisible()
  })

  test('invalid search shows error', async ({ page }) => {
    await mockApis(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('InvalidXYZ')
    await page.getByRole('button', { name: 'Search' }).click()

    await expect(page.getByRole('alert')).toContainText(/location not found/i)
  })

  test('unit toggle converts and persists after refresh', async ({ page }) => {
    await mockApis(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()

    await expect(page.getByText(/68°F/i)).toBeVisible()
    await page.getByRole('button', { name: 'Toggle temperature units' }).click()
    await expect(page.getByText(/20°C/i)).toBeVisible()

    await page.reload()
    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByText(/20°C/i)).toBeVisible()
  })

  test('recent searches populate and chip reselect works', async ({ page }) => {
    await mockApis(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()

    const chip = page.getByRole('button', { name: /show weather for los angeles/i })
    await expect(chip).toBeVisible()

    await page.getByRole('button', { name: 'Clear recent' }).click()
    await expect(chip).toHaveCount(0)
  })
})
