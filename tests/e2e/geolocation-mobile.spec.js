import { test, expect } from '@playwright/test'

test.describe('Geolocation and mobile behaviors', () => {
  test.use({
    geolocation: { latitude: 34.05, longitude: -118.24 },
    permissions: ['geolocation'],
  })

  test('use my location works on mobile viewport with mocked weather API', async ({ page }) => {
    await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
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

    await page.goto('/')
    await page.getByRole('button', { name: 'Use My Location' }).click()
    await expect(page.getByText('Partly Cloudy')).toBeVisible()
  })
})
