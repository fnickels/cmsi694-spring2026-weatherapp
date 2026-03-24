import { test, expect } from '@playwright/test'

function mockWeatherApis(page) {
  const locationsByName = {
    'new york': {
      id: 201,
      name: 'New York',
      displayName: 'New York, New York, United States',
      latitude: 40.71,
      longitude: -74.01,
      country: 'United States',
      country_code: 'US',
      admin1: 'New York',
      temperature: 10,
      feelsLike: 8,
    },
    chicago: {
      id: 202,
      name: 'Chicago',
      displayName: 'Chicago, Illinois, United States',
      latitude: 41.88,
      longitude: -87.63,
      country: 'United States',
      country_code: 'US',
      admin1: 'Illinois',
      temperature: 15,
      feelsLike: 12,
    },
  }

  const reverseByCoordinate = [
    {
      match: ({ latitude, longitude }) => Math.abs(latitude - 41.88) < 0.2 && Math.abs(longitude + 87.63) < 0.2,
      result: {
        id: 202,
        name: 'Chicago',
        latitude: 41.88,
        longitude: -87.63,
        country: 'United States',
        country_code: 'US',
        admin1: 'Illinois',
      },
      temperature: 15,
      feelsLike: 12,
    },
    {
      match: ({ latitude, longitude }) => Math.abs(latitude - 34.05) < 0.2 && Math.abs(longitude + 118.24) < 0.2,
      result: {
        id: 203,
        name: 'Los Angeles',
        latitude: 34.05,
        longitude: -118.24,
        country: 'United States',
        country_code: 'US',
        admin1: 'California',
      },
      temperature: 25,
      feelsLike: 24,
    },
  ]

  // OpenWeather direct geocoding — search by name
  page.route('https://api.openweathermap.org/geo/1.0/direct**', async (route) => {
    const url = new URL(route.request().url())
    const query = (url.searchParams.get('q') || '').toLowerCase().trim()
    const location = locationsByName[query]

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        location
          ? [{
              name: location.name,
              lat: location.latitude,
              lon: location.longitude,
              country: location.country_code,
              state: location.admin1,
            }]
          : []
      ),
    })
  })

  // OpenWeather reverse geocoding — resolve coordinates to place name
  page.route('https://api.openweathermap.org/geo/1.0/reverse**', async (route) => {
    const url = new URL(route.request().url())
    const lat = Number(url.searchParams.get('lat'))
    const lon = Number(url.searchParams.get('lon'))
    const matched = reverseByCoordinate.find((entry) => entry.match({ latitude: lat, longitude: lon }))

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        matched
          ? [{
              name: matched.result.name,
              lat: matched.result.latitude,
              lon: matched.result.longitude,
              country: matched.result.country_code,
              state: matched.result.admin1,
            }]
          : []
      ),
    })
  })

  page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    const url = new URL(route.request().url())
    const latitude = Number(url.searchParams.get('latitude'))
    const longitude = Number(url.searchParams.get('longitude'))

    const reverseMatch = reverseByCoordinate.find((entry) => entry.match({ latitude, longitude }))
    const searchMatch = Object.values(locationsByName).find(
      (entry) => Math.abs(entry.latitude - latitude) < 0.2 && Math.abs(entry.longitude - longitude) < 0.2
    )
    const data = reverseMatch || searchMatch || reverseByCoordinate[0]

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          time: '2026-03-24T10:00',
          temperature_2m: data.temperature,
          apparent_temperature: data.feelsLike,
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

async function installGeolocationBehavior(page, behavior) {
  await page.addInitScript((selectedBehavior) => {
    let calls = 0

    Object.defineProperty(Navigator.prototype, 'geolocation', {
      configurable: true,
      get() {
        return {
          getCurrentPosition: (success, error) => {
            calls += 1

            if (selectedBehavior === 'success-chicago') {
              success({ coords: { latitude: 41.88, longitude: -87.63 } })
              return
            }

            if (selectedBehavior === 'denied') {
              error({ code: 1, PERMISSION_DENIED: 1, message: 'Denied' })
              return
            }

            if (selectedBehavior === 'timeout') {
              error({ code: 3, TIMEOUT: 3, message: 'Timeout' })
              return
            }

            if (selectedBehavior === 'deny-then-success') {
              // React StrictMode can invoke mount effects twice in development,
              // so deny initial auto-detect attempts and succeed on explicit retry.
              if (calls <= 2) {
                error({ code: 1, PERMISSION_DENIED: 1, message: 'Denied' })
                return
              }
              success({ coords: { latitude: 34.05, longitude: -118.24 } })
            }
          },
        }
      },
    })
  }, behavior)
}

test.describe('Auto geolocation flows', () => {
  test('auto-detects weather on first load within 6 seconds and shows auto-located badge', async ({ page }) => {
    mockWeatherApis(page)
    await installGeolocationBehavior(page, 'success-chicago')

    const start = Date.now()
    await page.goto('/')

    const weatherCard = page.getByLabel('Current weather')
    await expect(weatherCard).toContainText('Chicago', { timeout: 30000 })
    await expect(weatherCard).toContainText('Auto-located', { timeout: 30000 })
    expect(Date.now() - start).toBeLessThan(6000)
  })

  test('shows fallback notice and keeps search usable when permission is denied', async ({ page }) => {
    mockWeatherApis(page)
    await installGeolocationBehavior(page, 'denied')

    await page.goto('/')

    await expect(page.getByText(/location access was denied/i)).toBeVisible({ timeout: 30000 })
    await expect(page.getByLabel('Location search')).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Search' })).toBeEnabled()

    await page.getByLabel('Location search').fill('New York')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather')).toContainText('New York', { timeout: 30000 })
  })

  test('falls back after geolocation timeout without blocking manual search', async ({ page }) => {
    mockWeatherApis(page)
    await installGeolocationBehavior(page, 'timeout')

    await page.goto('/')

    await expect(page.getByText(/location request timed out/i)).toBeVisible({ timeout: 30000 })
    await expect(page.getByLabel('Location search')).toBeEnabled()

    await page.getByLabel('Location search').fill('New York')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather')).toContainText('New York', { timeout: 30000 })
  })

  test('manual search overrides auto-detected weather and does not revert', async ({ page }) => {
    mockWeatherApis(page)
    await installGeolocationBehavior(page, 'success-chicago')

    await page.goto('/')

    const weatherCard = page.getByLabel('Current weather')
    await expect(weatherCard).toContainText('Chicago', { timeout: 30000 })
    await expect(weatherCard).toContainText('Auto-located', { timeout: 30000 })

    await page.getByLabel('Location search').fill('New York')
    await page.getByRole('button', { name: 'Search' }).click()

    await expect(weatherCard).toContainText('New York', { timeout: 30000 })
    await expect(weatherCard).not.toContainText('Auto-located')
    await page.waitForTimeout(250)
    await expect(weatherCard).toContainText('New York', { timeout: 30000 })
  })

  test('clicking Use My Location after denial re-prompts and loads weather', async ({ page }) => {
    mockWeatherApis(page)
    await installGeolocationBehavior(page, 'deny-then-success')

    await page.goto('/')

    await expect(page.getByText(/location access was denied/i)).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /use my location/i }).click()

    const weatherCard = page.getByLabel('Current weather')
    await expect(weatherCard).toContainText('Los Angeles', { timeout: 30000 })
  })
})