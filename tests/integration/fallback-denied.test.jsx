/**
 * T024 — Required (Constitution IV: failure-path test)
 * Integration test: geolocation permission denied → notice shown, search still functional
 */

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

import { searchLocations } from '../../src/services/geocoding'
import { fetchWeather } from '../../src/services/weather'

const sampleLocation = {
  id: 1,
  name: 'Chicago',
  displayName: 'Chicago, Illinois, United States',
  latitude: 41.85,
  longitude: -87.65,
}

const sampleWeather = {
  observationTime: '2026-03-23T10:00',
  temperatureC: 5,
  feelsLikeC: 2,
  humidity: 70,
  windSpeedKph: 20,
  windDirectionDeg: 270,
  windDirectionLabel: 'W',
  visibilityM: 8000,
  weatherCode: 3,
  conditionLabel: 'Overcast',
  conditionIcon: 'overcast',
}

describe('Fallback when permission denied (US2, FR-004/005/008)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()

    // Mock geolocation to deny permission (code 1 = PERMISSION_DENIED)
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((_success, error) => {
          error({ code: 1, message: 'User denied Geolocation' })
        }),
      },
    })
  })

  it('shows location-denied notice when permission is denied (FR-004)', async () => {
    render(<App />)
    expect(
      await screen.findByText(/location access was denied/i)
    ).toBeInTheDocument()
  })

  it('keeps the search bar enabled after permission denial (FR-005)', async () => {
    render(<App />)
    await screen.findByText(/location access was denied/i)
    expect(screen.getByLabelText(/location search/i)).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /^search$/i })).not.toBeDisabled()
  })

  it('allows manual search to succeed after denial (FR-004, FR-006)', async () => {
    searchLocations.mockResolvedValueOnce([sampleLocation])
    fetchWeather.mockResolvedValue(sampleWeather)

    render(<App />)
    await screen.findByText(/location access was denied/i)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/location search/i), 'Chicago')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByRole('region', { name: /current weather/i })).toBeInTheDocument()
  })
})

describe('Fallback when geolocation unavailable (US2, FR-001)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()

    // Simulate browser without geolocation support
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    })
  })

  it('skips auto-detection and does not error when geolocation is unsupported', async () => {
    render(<App />)
    // No crash, no error alert, no auto-loaded weather — page loads normally
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/location search/i)).toBeInTheDocument()
  })
})

describe('Fallback when geolocation times out (US2, FR-005)', () => {
  let getCurrentPositionMock

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()

    getCurrentPositionMock = vi.fn((_success, error) => {
      error({ code: 3, TIMEOUT: 3, message: 'Timeout' })
    })

    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
    })
  })

  it('shows timeout fallback and requests geolocation with 5-second timeout', async () => {
    render(<App />)

    expect(await screen.findByText(/location request timed out/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location search/i)).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /^search$/i })).not.toBeDisabled()

    expect(getCurrentPositionMock).toHaveBeenCalled()
    const options = getCurrentPositionMock.mock.calls[0][2]
    expect(options.timeout).toBe(5000)
  })
})
