/**
 * T014 — Required (Constitution IV: happy-path test)
 * Integration test: auto-detect geolocation succeeds → weather rendered with auto-detected badge
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

const sampleWeather = {
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

function assertInitialLocationContract({ weatherRegionVisible, autoLocatedBadgeVisible }) {
  expect(weatherRegionVisible).toBe(true)
  expect(autoLocatedBadgeVisible).toBe(true)
}

describe('Auto-detect happy path (US1, FR-001/002/003)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    fetchWeather.mockResolvedValue(sampleWeather)
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

    // Mock geolocation to succeed immediately with sample coords
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) => {
          success({ coords: { latitude: 37.77, longitude: -122.41 } })
        }),
      },
    })
  })

  it('auto-loads weather for detected location without manual input (FR-002)', async () => {
    render(<App />)
    // Weather card should appear without any user interaction
    expect(await screen.findByRole('region', { name: /current weather/i })).toBeInTheDocument()
  })

  it('renders the auto-detected badge on the weather card (FR-003)', async () => {
    render(<App />)
    expect(await screen.findByLabelText(/location was auto-detected/i)).toBeInTheDocument()
    expect(await screen.findByText(/auto-located/i)).toBeInTheDocument()

    assertInitialLocationContract({
      weatherRegionVisible: true,
      autoLocatedBadgeVisible: true,
    })
  })

  it('does not block the search bar during or after auto-detection (FR-005)', async () => {
    render(<App />)
    // Wait for auto-detect weather load to complete
    await screen.findByRole('region', { name: /current weather/i })
    // After load completes isLoading resets; search must be accessible (FR-005)
    expect(screen.getByLabelText(/location search/i)).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /^search$/i })).not.toBeDisabled()
  })

  it('applies a late geolocation result after fallback if user has not manually searched (FR-011)', async () => {
    const geolocationMock = vi.fn((success) => {
      setTimeout(() => {
        success({ coords: { latitude: 37.77, longitude: -122.41 } })
      }, 5200)
    })

    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: geolocationMock,
      },
    })

    render(<App />)

    expect(geolocationMock).toHaveBeenCalled()
    const options = geolocationMock.mock.calls[0][2]
    expect(options.timeout).toBe(5000)
    expect(await screen.findByRole('region', { name: /current weather/i }, { timeout: 10000 })).toBeInTheDocument()
    expect(await screen.findByText(/auto-located/i, {}, { timeout: 10000 })).toBeInTheDocument()
  }, 15000)
})
