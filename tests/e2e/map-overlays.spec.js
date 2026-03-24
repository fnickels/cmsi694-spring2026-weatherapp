import { expect, test } from '@playwright/test'

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP+e0Ur2QAAAABJRU5ErkJggg==',
  'base64'
)

function mockMapApis(page) {
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
    const hasCurrent = requestUrl.searchParams.has('current')
    const hasDaily = requestUrl.searchParams.has('daily')

    if (hasCurrent) {
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
      return
    }

    if (hasDaily) {
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
        timezone: 'America/Los_Angeles',
        hourly: {
          time: ['2026-03-24T12:00'],
          temperature_2m: [18],
          precipitation_probability: [40],
          weather_code: [2],
          cloud_cover: [60],
        },
      }),
    })
  })

  page.route('https://api.rainviewer.com/public/weather-maps.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        radar: {
          nowcast: [{ path: '/v2/radar/9999' }],
        },
      }),
    })
  })

  page.route('https://tile.openstreetmap.org/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: TRANSPARENT_PNG,
    })
  })

  page.route('https://gibs.earthdata.nasa.gov/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: TRANSPARENT_PNG,
    })
  })

  page.route('https://tilecache.rainviewer.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: TRANSPARENT_PNG,
    })
  })
}

test.describe('Map overlay flows', () => {
  test('switches overlays and updates the visible legend', async ({ page }) => {
    await mockMapApis(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByRole('tab', { name: 'Map' }).click()

    await expect(page.getByLabel('Weather map canvas')).toBeVisible()
    await expect(page.getByLabel('Precipitation legend')).toBeVisible()

    await page.getByRole('button', { name: 'Temperature', exact: true }).click()
    await expect(page.getByLabel('Temperature legend')).toBeVisible()

    await page.getByRole('button', { name: 'Cloud Cover', exact: true }).click()
    await expect(page.getByLabel('Cloud cover legend')).toBeVisible()
  })

  test('clicking the map shows an inspected overlay summary', async ({ page }) => {
    await mockMapApis(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByRole('tab', { name: 'Map' }).click()

    const leafletMap = page.locator('[aria-label="Weather map canvas"] .leaflet-container')
    await expect(leafletMap).toBeVisible()
    await leafletMap.click({ position: { x: 200, y: 140 } })

    await expect(page.getByLabel('Map inspection summary')).toContainText(/precipitation chance near this point is 40%/i)
  })
})