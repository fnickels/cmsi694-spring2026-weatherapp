import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

vi.mock('../../src/services/geocoding', () => ({
  searchLocations: vi.fn(),
}))

vi.mock('../../src/services/weather', () => ({
  fetchWeather: vi.fn(),
}))

import { searchLocations } from '../../src/services/geocoding'
import { fetchWeather } from '../../src/services/weather'

const sampleLocation = {
  id: 10,
  name: 'Los Angeles',
  displayName: 'Los Angeles, California, United States',
  latitude: 34.05,
  longitude: -118.24,
}

const sampleWeather = {
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
}

describe('App integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) => {
          success({ coords: { latitude: 34.05, longitude: -118.24 } })
        }),
      },
    })
  })

  it('shows location-not-found when geocoding returns empty list', async () => {
    searchLocations.mockResolvedValueOnce([])

    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'InvalidXYZ')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/location not found/i)
  })

  it('shows service error when geocoding throws', async () => {
    searchLocations.mockRejectedValueOnce(new Error('Geocoding API error: 503'))

    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Chicago')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/503/i)
  })

  it('handles malformed weather payload as service unavailable', async () => {
    searchLocations.mockResolvedValueOnce([sampleLocation])
    fetchWeather.mockRejectedValueOnce(new Error('Invalid weather data: missing current field'))

    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid weather data/i)
  })

  it('supports disambiguation list and selection', async () => {
    searchLocations.mockResolvedValueOnce([
      { ...sampleLocation, id: 11, displayName: 'Springfield, Illinois, United States' },
      { ...sampleLocation, id: 12, displayName: 'Springfield, Missouri, United States' },
    ])
    fetchWeather.mockResolvedValueOnce(sampleWeather)

    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Springfield')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    await userEvent.click(await screen.findByRole('button', { name: /springfield, illinois/i }))
    expect(await screen.findByText(/partly cloudy/i)).toBeInTheDocument()
  })

  it('toggles units without additional network requests', async () => {
    searchLocations.mockResolvedValueOnce([sampleLocation])
    fetchWeather.mockResolvedValueOnce(sampleWeather)

    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByText(/68°f/i)).toBeInTheDocument()

    const initialFetchCalls = fetchWeather.mock.calls.length
    await userEvent.click(screen.getByRole('button', { name: /toggle temperature units/i }))

    expect(fetchWeather.mock.calls.length).toBe(initialFetchCalls)
    expect(await screen.findByText(/20°c/i)).toBeInTheDocument()
  })

  it('toggles unit twice and returns to original display values', async () => {
    searchLocations.mockResolvedValueOnce([sampleLocation])
    fetchWeather.mockResolvedValueOnce(sampleWeather)

    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByText(/68°f/i)).toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: /toggle temperature units/i })
    expect(toggle).toHaveTextContent('°F')

    await userEvent.click(toggle)
    expect(await screen.findByText(/20°c/i)).toBeInTheDocument()
    expect(toggle).toHaveTextContent('°C')

    await userEvent.click(toggle)
    expect(await screen.findByText(/68°f/i)).toBeInTheDocument()
    expect(toggle).toHaveTextContent('°F')
  })

  it('persists unit preference in sessionStorage across reloads', async () => {
    searchLocations.mockResolvedValueOnce([sampleLocation])
    fetchWeather.mockResolvedValueOnce(sampleWeather)

    const { unmount } = render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))
    await screen.findByText(/68°f/i)
    const toggle = screen.getByRole('button', { name: /toggle temperature units/i })
    await userEvent.click(toggle)
    await screen.findByText(/20°c/i)
    expect(sessionStorage.getItem('weatherapp.unitPreference')).toBe('metric')
    unmount()

    searchLocations.mockResolvedValueOnce([sampleLocation])
    fetchWeather.mockResolvedValueOnce(sampleWeather)
    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))
    expect(await screen.findByText(/20°c/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle temperature units/i })).toHaveTextContent('°C')
  })

  it('uses geolocation flow when clicking Use My Location', async () => {
    fetchWeather.mockResolvedValueOnce(sampleWeather)

    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /use my location/i }))

    expect(await screen.findByText(/partly cloudy/i)).toBeInTheDocument()
  })

  it('uses timezone-derived geolocation label and fallback when unavailable', async () => {
    const originalDateTimeFormat = Intl.DateTimeFormat
    fetchWeather.mockResolvedValue(sampleWeather)

    Intl.DateTimeFormat = vi.fn(() => ({
      resolvedOptions: () => ({ timeZone: 'America/Chicago' }),
    }))

    const { unmount } = render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /use my location/i }))
    expect(await screen.findByText(/partly cloudy/i)).toBeInTheDocument()
    unmount()

    Intl.DateTimeFormat = vi.fn(() => ({
      resolvedOptions: () => ({ timeZone: '' }),
    }))

    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /use my location/i }))
    expect(await screen.findByText(/partly cloudy/i)).toBeInTheDocument()

    Intl.DateTimeFormat = originalDateTimeFormat
  })

  it('shows geolocation permission denied error', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((_, error) => {
          error({ code: 1, PERMISSION_DENIED: 1 })
        }),
      },
    })

    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /use my location/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/enable location access/i)
  })

  it('shows unsupported geolocation message in older browsers', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    })

    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /use my location/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/not supported/i)
  })

  it('maps timeout/offline to user-facing errors', async () => {
    searchLocations.mockResolvedValueOnce([sampleLocation])
    fetchWeather.mockRejectedValueOnce(new Error('Weather request timed out. Please try again.'))

    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/timed out/i)
  })

  it('shows initial actionable control and label text', async () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /use my location/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('tracks and reuses recent searches up to 5 items with dedupe', async () => {
    const locations = [
      { ...sampleLocation, id: 1, name: 'A', displayName: 'A, US' },
      { ...sampleLocation, id: 2, name: 'B', displayName: 'B, US' },
      { ...sampleLocation, id: 3, name: 'C', displayName: 'C, US' },
      { ...sampleLocation, id: 4, name: 'D', displayName: 'D, US' },
      { ...sampleLocation, id: 5, name: 'E', displayName: 'E, US' },
      { ...sampleLocation, id: 6, name: 'F', displayName: 'F, US' },
    ]

    render(<App />)
    for (const loc of locations) {
      searchLocations.mockResolvedValueOnce([loc])
      fetchWeather.mockResolvedValueOnce(sampleWeather)
      await userEvent.clear(screen.getByLabelText(/location search/i))
      await userEvent.type(screen.getByLabelText(/location search/i), loc.name)
      await userEvent.click(screen.getByRole('button', { name: /^search$/i }))
      await screen.findByText(/partly cloudy|mainly clear/i)
    }

    expect(screen.queryByRole('button', { name: /show weather for a, us/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show weather for f, us/i })).toBeInTheDocument()

    searchLocations.mockResolvedValueOnce([locations[3]])
    fetchWeather.mockResolvedValueOnce(sampleWeather)
    await userEvent.clear(screen.getByLabelText(/location search/i))
    await userEvent.type(screen.getByLabelText(/location search/i), 'D')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))
    await screen.findByRole('button', { name: /show weather for d, us/i })

    const storage = JSON.parse(sessionStorage.getItem('weatherapp.recentSearches') || '[]')
    const dEntries = storage.filter((item) => item.displayName === 'D, US')
    expect(dEntries).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: /show weather for d, us/i }))
    expect(fetchWeather).toHaveBeenCalled()
  })
})
