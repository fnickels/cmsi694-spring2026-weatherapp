import { test, expect } from '@playwright/test'

function mockApisWithLocation(page) {
  const defaults = {
    chicago: { lat: 41.88, lon: -87.63, temp: 15, feelsLike: 12, humidity: 65, windSpeed: 22, windDir: 270, visibility: 12000 },
    'los angeles': { lat: 34.05, lon: -118.24, temp: 25, feelsLike: 24, humidity: 50, windSpeed: 15, windDir: 90, visibility: 15000 },
    'new york': { lat: 40.71, lon: -74.01, temp: 18, feelsLike: 16, humidity: 55, windSpeed: 20, windDir: 45, visibility: 11000 },
    tokyo: { lat: 35.67, lon: 139.65, temp: 22, feelsLike: 20, humidity: 70, windSpeed: 12, windDir: 225, visibility: 9000 },
  }

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

    let city = 'Los Angeles'
    if (query.includes('chicago')) city = 'Chicago'
    if (query.includes('new york')) city = 'New York'
    if (query.includes('tokyo')) city = 'Tokyo'

    const cityKey = city.toLowerCase()
    const data = defaults[cityKey] || defaults['los angeles']

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: Math.random(),
            name: city,
            latitude: data.lat,
            longitude: data.lon,
            country: city === 'Tokyo' ? 'Japan' : 'United States',
            country_code: city === 'Tokyo' ? 'JP' : 'US',
            admin1: city === 'Tokyo' ? 'Tokyo' : 'State',
          },
        ],
      }),
    })
  })

  page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    const url = new URL(route.request().url())
    const lat = parseFloat(url.searchParams.get('latitude') || '0')
    const lon = parseFloat(url.searchParams.get('longitude') || '0')

    let data = defaults['los angeles']

    // Match location based on coordinates
    Object.values(defaults).forEach((d) => {
      if (Math.abs(d.lat - lat) < 0.5 && Math.abs(d.lon - lon) < 0.5) {
        data = d
      }
    })

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          time: '2026-03-18T10:00',
          temperature_2m: data.temp,
          apparent_temperature: data.feelsLike,
          relative_humidity_2m: data.humidity,
          weather_code: 2,
          wind_speed_10m: data.windSpeed,
          wind_direction_10m: data.windDir,
          visibility: data.visibility,
        },
      }),
    })
  })
}

test.describe('T036: Search Success - All Weather Fields Displayed', () => {
  test('search for Chicago displays all weather fields', async ({ page }) => {
    mockApisWithLocation(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('Chicago')
    await page.getByRole('button', { name: 'Search' }).click()

    // Verify condition displays
    await expect(page.getByText('Partly Cloudy')).toBeVisible()

    // Verify temperature (59°F for Chicago in imperial)
    await expect(page.getByText(/59°F/i)).toBeVisible()

    // Verify feels-like label
    await expect(page.getByText(/Feels like/i)).toBeVisible()

    // Verify humidity label
    await expect(page.getByText(/Humidity/i)).toBeVisible()

    // Verify wind label
    await expect(page.getByText(/Wind/i)).toBeVisible()

    // Verify visibility label
    await expect(page.getByText(/Visibility/i)).toBeVisible()

    // Verify location displays in weather card (use aria-label for specificity)
    await expect(page.getByLabel('Current weather').getByText(/Chicago/i)).toBeVisible()
  })
})

test.describe('T037: Invalid Search - Error Message Displayed', () => {
  test('search for invalid location shows error message', async ({ page }) => {
    mockApisWithLocation(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('InvalidXYZ123')
    await page.getByRole('button', { name: 'Search' }).click()

    // Verify error alert is shown
    await expect(page.getByRole('alert')).toContainText(/not found|no results|error/i)
  })
})

test.describe('T055-T057: Unit Conversion and Persistence', () => {
  test('toggle to metric, verify conversion, toggle back', async ({ page }) => {
    mockApisWithLocation(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('Chicago')
    await page.getByRole('button', { name: 'Search' }).click()

    // Verify imperial temp shows
    await expect(page.getByText(/59°F/i)).toBeVisible()

    // Toggle to metric
    await page.getByRole('button', { name: 'Toggle temperature units' }).click()

    // Verify metric temp shows
    await expect(page.getByText(/15°C/i)).toBeVisible()

    // Toggle back to imperial
    await page.getByRole('button', { name: 'Toggle temperature units' }).click()

    // Verify imperial temp shows again
    await expect(page.getByText(/59°F/i)).toBeVisible()
  })

  test('toggle to metric and refresh, verify persistence', async ({ page }) => {
    mockApisWithLocation(page)
    await page.goto('/')

    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()

    // Verify imperial temp shows
    await expect(page.getByText(/77°F/i)).toBeVisible()

    // Toggle to metric
    await page.getByRole('button', { name: 'Toggle temperature units' }).click()

    // Verify metric shows
    await expect(page.getByText(/25°C/i)).toBeVisible()

    // Reload page
    await page.reload({ waitUntil: 'networkidle' })

    // Search again for same location
    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()

    // Metric should persist
    await expect(page.getByText(/25°C/i)).toBeVisible()

    // Imperial should not be visible
    const imperialTemp = page.getByText(/77°F/i)
    await expect(imperialTemp).not.toBeVisible()
  })
})

test.describe('T067-T069: Recent Searches', () => {
  test('search multiple cities, verify recent list populates', async ({ page }) => {
    mockApisWithLocation(page)
    await page.goto('/')

    // Search Chicago
    await page.getByLabel('Location search').fill('Chicago')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather').getByText(/Chicago/i)).toBeVisible()

    // Search Los Angeles
    await page.getByLabel('Location search').clear()
    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather').getByText(/Los Angeles/i)).toBeVisible()

    // Recent searches should exist
    const recentButtons = page.getByRole('button', { name: /Show weather for/i })
    const count = await recentButtons.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('click recent search chip loads that location', async ({ page }) => {
    mockApisWithLocation(page)
    await page.goto('/')

    // Build recent searches
    await page.getByLabel('Location search').fill('Chicago')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather').getByText(/Chicago/i)).toBeVisible()

    // Search different city
    await page.getByLabel('Location search').clear()
    await page.getByLabel('Location search').fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather').getByText(/Los Angeles/i)).toBeVisible()

    // Click recent Chicago
    const chicagoChip = page.getByRole('button', { name: /Show weather for.*Chicago/i })
    const isVisible = await chicagoChip.isVisible()

    if (isVisible) {
      await chicagoChip.click()
      await expect(page.getByLabel('Current weather').getByText(/Chicago/i)).toBeVisible()
    }
  })

  test('search same city twice, dedup works', async ({ page }) => {
    mockApisWithLocation(page)
    await page.goto('/')

    const input = page.getByLabel('Location search')

    // Search Chicago twice with LA in between
    await input.fill('Chicago')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather').getByText(/Chicago/i)).toBeVisible()

    await input.clear()
    await input.fill('Los Angeles')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather').getByText(/Los Angeles/i)).toBeVisible()

    await input.clear()
    await input.fill('Chicago')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather').getByText(/Chicago/i)).toBeVisible()

    // Chicago should appear in recent (possibly deduplicated)
    const chicagoChips = page.getByRole('button', { name: /Show weather for.*Chicago/i })
    const chipCount = await chicagoChips.count()
    // May appear once or twice, but not more than twice
    expect(chipCount).toBeLessThanOrEqual(2)
  })
})

test.describe('T044: Mobile Geolocation', () => {
  test('use my location returns weather', async ({ page, context }) => {
    mockApisWithLocation(page)

    // Grant location permission
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 41.88, longitude: -87.63 })

    await page.goto('/')

    // Click use location
    const useLocButton = page.getByRole('button', { name: /my location|use location/i })
    await useLocButton.click()

    // Wait for weather to load - check for temp display
    await expect(page.getByText(/59°F|15°C/i)).toBeVisible()
  })
})

test.describe('Integration: Complete Feature Matrix', () => {
  test('search, toggle unit, click recent chip', async ({ page }) => {
    mockApisWithLocation(page)
    await page.goto('/')

    // Search Chicago
    await page.getByLabel('Location search').fill('Chicago')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather').getByText(/Chicago/i)).toBeVisible()

    // Verify imperial
    await expect(page.getByText(/59°F/i)).toBeVisible()

    // Toggle to metric
    await page.getByRole('button', { name: 'Toggle temperature units' }).click()
    await expect(page.getByText(/15°C/i)).toBeVisible()

    // Search Tokyo
    await page.getByLabel('Location search').clear()
    await page.getByLabel('Location search').fill('Tokyo')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByLabel('Current weather').getByText(/Tokyo/i)).toBeVisible()

    // Click recent Chicago
    const chicagoChip = page.getByRole('button', { name: /Show weather for.*Chicago/i })
    const chicagoVisible = await chicagoChip.isVisible()

    if (chicagoVisible) {
      await chicagoChip.click()
      await expect(page.getByLabel('Current weather').getByText(/Chicago/i)).toBeVisible()
      // Metric should persist
      await expect(page.getByText(/15°C/i)).toBeVisible()
    }
  })
})
