import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

vi.mock('../../src/services/weather', () => ({
  fetchWeather: vi.fn(),
}))

vi.mock('../../src/hooks/useInitialLocation', () => ({
  useInitialLocation: vi.fn(() => ({
    context: {
      attempted: false,
      granted: false,
      denied: false,
      timedOut: false,
      unavailable: false,
      userManuallySelected: false,
      coordinates: null,
      error: null,
    },
    markUserManuallySelected: vi.fn(),
  })),
}))

import { fetchWeather } from '../../src/services/weather'

const sampleWeather = {
  observationTime: '2026-03-18T10:00',
  timezone: 'America/Los_Angeles',
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
}

describe('App geolocation nearest-city integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()

    fetchWeather.mockResolvedValue(sampleWeather)

    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) => {
          success({ coords: { latitude: 34.05, longitude: -118.24 } })
        }),
      },
    })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 101,
              name: 'Hollywood Hills',
              latitude: 34.1205,
              longitude: -118.3217,
              feature_code: 'LCTY',
              country: 'United States',
              country_code: 'US',
              admin1: 'California',
            },
            {
              id: 102,
              name: 'Los Angeles',
              latitude: 34.0522,
              longitude: -118.2437,
              feature_code: 'PPLA',
              country: 'United States',
              country_code: 'US',
              admin1: 'California',
            },
          ],
        }),
      })
    )
  })

  it('shows the nearest city name when Use My Location is clicked', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: /use my location/i }))

    expect(await screen.findByText(/partly cloudy/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/current weather/i)).toHaveTextContent(
      'Los Angeles, California, United States'
    )

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [requestUrl] = global.fetch.mock.calls[0]
    expect(requestUrl).toContain('/v1/reverse?')
    expect(requestUrl).toContain('count=10')
  })
})
