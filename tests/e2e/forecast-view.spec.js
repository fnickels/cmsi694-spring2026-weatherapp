import { expect, test } from '@playwright/test'

function mockForecastApis(page) {
  page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
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
    const requestUrl = new URL(route.request().url())
    const daily = requestUrl.searchParams.get('daily')

    if (daily) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          timezone: 'America/Los_Angeles',
          daily: {
            time: ['2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27', '2026-03-28', '2026-03-29', '2026-03-30'],
            temperature_2m_max: [21, 22, 20, 19, 18, 20, 23],
            temperature_2m_min: [12, 13, 11, 10, 9, 11, 14],
            precipitation_probability_max: [10, 15, 20, 30, 40, 25, 5],
            weather_code: [2, 2, 3, 61, 63, 1, 0],
          },
          hourly: {
            time: Array.from({ length: 24 }, (_, index) => `2026-03-24T${String(index).padStart(2, '0')}:00`),
            temperature_2m: Array.from({ length: 24 }, (_, index) => 12 + index),
            precipitation_probability: Array.from({ length: 24 }, (_, index) => index + 5),
            weather_code: Array.from({ length: 24 }, () => 2),
            cloud_cover: Array.from({ length: 24 }, () => 20),
          },
        }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          time: '2026-03-24T10:00',
          temperature_2m: 20,
          apparent_temperature: 19,
          relative_humidity_2m: 60,
          weather_code: 2,
          wind_speed_10m: 18,
          wind_direction_10m: 180,
          visibility: 10000,
        },
        timezone: 'America/Los_Angeles',
      }),
    })
  })
}

test.describe('Forecast view flows', () => {
  test('shows a 7-day forecast and 24-hour outlook after opening Forecast', async ({ page }) => {
    await mockForecastApis(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()

    await page.getByRole('tab', { name: 'Forecast' }).click()

    await expect(page.getByText('7-Day Forecast')).toBeVisible()
    await expect(page.getByText('24-hour hourly outlook')).toBeVisible()
    await expect(page.getByText(/Precipitation chance 10%/i).first()).toBeVisible()
  })

  test('unit toggling updates forecast temperatures without a second forecast request', async ({ page }) => {
    let forecastCalls = 0
    await mockForecastApis(page)

    page.on('request', (request) => {
      if (request.url().includes('api.open-meteo.com/v1/forecast') && request.url().includes('daily=')) {
        forecastCalls += 1
      }
    })

    await page.goto('/')
    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByRole('tab', { name: 'Forecast' }).click()

    await expect(page.getByText(/70°F/i).first()).toBeVisible()
    await page.getByRole('button', { name: 'Toggle temperature units' }).click()
    await expect(page.getByText(/21°C/i).first()).toBeVisible()
    expect(forecastCalls).toBe(1)
  })
})