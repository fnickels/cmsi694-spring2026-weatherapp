import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

vi.mock('../../src/services/geocoding', () => ({
  searchLocations: vi.fn(),
  reverseGeocodeLocation: vi.fn(),
}))

vi.mock('../../src/services/weather', () => ({
  fetchWeather: vi.fn(),
}))

import { reverseGeocodeLocation, searchLocations } from '../../src/services/geocoding'
import { fetchWeather } from '../../src/services/weather'

const autoDetectedWeather = {
  observationTime: '2026-03-23T10:00',
  temperatureC: 18,
  feelsLikeC: 16,
  humidity: 55,
  windSpeedKph: 12,
  windDirectionDeg: 90,
  windDirectionLabel: 'E',
  visibilityM: 10000,
  weatherCode: 1,
  conditionLabel: 'Mainly Clear',
  conditionIcon: 'clear-day',
}

const manualWeather = {
  observationTime: '2026-03-23T12:00',
  temperatureC: 10,
  feelsLikeC: 8,
  humidity: 65,
  windSpeedKph: 14,
  windDirectionDeg: 180,
  windDirectionLabel: 'S',
  visibilityM: 10000,
  weatherCode: 3,
  conditionLabel: 'Overcast',
  conditionIcon: 'overcast',
}

describe('User control after auto-detect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()

    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) => {
          success({ coords: { latitude: 37.77, longitude: -122.41 } })
        }),
      },
    })

    reverseGeocodeLocation.mockResolvedValue({
      id: 1,
      name: 'San Francisco',
      displayName: 'San Francisco, California, United States',
      latitude: 37.77,
      longitude: -122.41,
      country: 'United States',
      countryCode: 'US',
      admin1: 'California',
      approximate: false,
    })
  })

  it('preserves a manual search after auto-detect completes', async () => {
    searchLocations.mockResolvedValueOnce([
      {
        id: 2,
        name: 'New York',
        displayName: 'New York, New York, United States',
        latitude: 40.71,
        longitude: -74.01,
      },
    ])
    fetchWeather
      .mockResolvedValueOnce(autoDetectedWeather)
      .mockResolvedValueOnce(manualWeather)

    render(<App />)

    expect(await screen.findByText(/auto-located/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/current weather/i)).toHaveTextContent('San Francisco, California, United States')

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/location search/i), 'New York')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByLabelText(/current weather/i)).toHaveTextContent('New York, New York, United States')
    expect(screen.queryByText(/auto-located/i)).not.toBeInTheDocument()

    await waitFor(() => {
      expect(fetchWeather).toHaveBeenCalledTimes(2)
    })
  })

  it('re-requests browser geolocation after an initial denial', async () => {
    fetchWeather.mockResolvedValueOnce(autoDetectedWeather)

    const geolocationMock = vi
      .fn()
      .mockImplementationOnce((_success, error) => {
        error({ code: 1, PERMISSION_DENIED: 1 })
      })
      .mockImplementationOnce((success) => {
        success({ coords: { latitude: 41.88, longitude: -87.63 } })
      })

    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: geolocationMock,
      },
    })

    reverseGeocodeLocation.mockResolvedValueOnce({
      id: 3,
      name: 'Chicago',
      displayName: 'Chicago, Illinois, United States',
      latitude: 41.88,
      longitude: -87.63,
      country: 'United States',
      countryCode: 'US',
      admin1: 'Illinois',
      approximate: false,
    })

    render(<App />)

    expect(await screen.findByText(/location access was denied/i)).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /use my location/i }))

    expect(geolocationMock).toHaveBeenCalledTimes(2)
    expect(await screen.findByLabelText(/current weather/i)).toHaveTextContent('Chicago, Illinois, United States')
  })

  it('retries geolocation after an initial timeout when user clicks Use My Location', async () => {
    fetchWeather.mockResolvedValueOnce(autoDetectedWeather)

    const geolocationMock = vi
      .fn()
      .mockImplementationOnce((_success, error) => {
        error({ code: 3, TIMEOUT: 3, message: 'Timeout' })
      })
      .mockImplementationOnce((success) => {
        success({ coords: { latitude: 41.88, longitude: -87.63 } })
      })

    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: geolocationMock,
      },
    })

    reverseGeocodeLocation.mockResolvedValueOnce({
      id: 3,
      name: 'Chicago',
      displayName: 'Chicago, Illinois, United States',
      latitude: 41.88,
      longitude: -87.63,
      country: 'United States',
      countryCode: 'US',
      admin1: 'Illinois',
      approximate: false,
    })

    render(<App />)

    expect(await screen.findByText(/location request timed out/i)).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /use my location/i }))

    expect(geolocationMock).toHaveBeenCalledTimes(2)
    expect(await screen.findByLabelText(/current weather/i)).toHaveTextContent('Chicago, Illinois, United States')
  })
})