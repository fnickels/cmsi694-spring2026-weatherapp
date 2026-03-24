import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

vi.mock('../../src/services/geocoding', () => ({
  searchLocations: vi.fn(),
  reverseGeocodeLocation: vi.fn(),
}))

vi.mock('../../src/services/weather', () => ({
  fetchWeather: vi.fn(),
}))

import { reverseGeocodeLocation } from '../../src/services/geocoding'
import { fetchWeather } from '../../src/services/weather'

describe('Performance validations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    reverseGeocodeLocation.mockResolvedValue({
      id: 10,
      name: 'Los Angeles',
      displayName: 'Los Angeles, California, United States',
      latitude: 34.05,
      longitude: -118.24,
      country: 'United States',
      countryCode: 'US',
      admin1: 'California',
      approximate: false,
    })
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) => {
          setTimeout(() => success({ coords: { latitude: 34.05, longitude: -118.24 } }), 10)
        }),
      },
    })
  })

  it('initial auto-detect flow renders weather in less than 8 seconds (mocked)', async () => {
    fetchWeather.mockResolvedValueOnce({
      observationTime: '2026-03-18T10:00',
      temperatureC: 20,
      feelsLikeC: 19,
      humidity: 60,
      windSpeedKph: 18,
      windDirectionDeg: 180,
      windDirectionLabel: 'S',
      visibilityM: 10000,
      weatherCode: 2,
      conditionLabel: 'Partly Cloudy',
      conditionIcon: 'partly-cloudy-day',
    })

    const start = performance.now()

    render(<App />)
    await screen.findByText(/partly cloudy/i)

    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(8000)
  })
})
