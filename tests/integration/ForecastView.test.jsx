import { beforeEach, describe, expect, it, vi } from 'vitest'
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

vi.mock('../../src/services/forecast', () => ({
  fetchForecast: vi.fn(),
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

import { searchLocations } from '../../src/services/geocoding'
import { fetchWeather } from '../../src/services/weather'
import { fetchForecast } from '../../src/services/forecast'

const location = {
  id: 10,
  name: 'Los Angeles',
  displayName: 'Los Angeles, California, United States',
  latitude: 34.05,
  longitude: -118.24,
}

const currentWeather = {
  observationTime: '2026-03-24T10:00',
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

const forecastBundle = {
  locationKey: '34.050,-118.240|America/Los_Angeles',
  timezone: 'America/Los_Angeles',
  fetchedAt: '2026-03-24T10:00:00Z',
  status: 'ready',
  errorMessage: null,
  daily: [
    {
      date: '2026-03-24',
      label: 'Tue',
      temperatureMinC: 12,
      temperatureMaxC: 21,
      precipitationProbabilityPct: 10,
      conditionLabel: 'Partly Cloudy',
    },
    {
      date: '2026-03-25',
      label: 'Wed',
      temperatureMinC: 10,
      temperatureMaxC: 19,
      precipitationProbabilityPct: 25,
      conditionLabel: 'Overcast',
    },
  ],
  hourly: [],
  hourlyByDay: {
    '2026-03-24': [
      {
        time: '2026-03-24T10:00',
        hourLabel: '10 AM',
        temperatureC: 20,
        precipitationProbabilityPct: 10,
        conditionLabel: 'Partly Cloudy',
      },
      {
        time: '2026-03-24T11:00',
        hourLabel: '11 AM',
        temperatureC: 21,
        precipitationProbabilityPct: 15,
        conditionLabel: 'Partly Cloudy',
      },
    ],
    '2026-03-25': [
      {
        time: '2026-03-25T10:00',
        hourLabel: '10 AM',
        temperatureC: 18,
        precipitationProbabilityPct: 35,
        conditionLabel: 'Overcast',
      },
    ],
  },
  defaultHourlyWindow: [
    {
      time: '2026-03-24T10:00',
      hourLabel: '10 AM',
      temperatureC: 20,
      precipitationProbabilityPct: 10,
      conditionLabel: 'Partly Cloudy',
    },
  ],
}

describe('ForecastView integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    searchLocations.mockResolvedValue([location])
    fetchWeather.mockResolvedValue(currentWeather)
    fetchForecast.mockResolvedValue(forecastBundle)
  })

  it('loads and displays forecast data when the Forecast tab is opened', async () => {
    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    await screen.findByRole('tab', { name: 'Forecast' })
    await userEvent.click(screen.getByRole('tab', { name: 'Forecast' }))

    expect(fetchForecast).toHaveBeenCalledWith(34.05, -118.24)
    expect(await screen.findByText(/7-Day Forecast/i)).toBeInTheDocument()
    expect(await screen.findByText(/24-hour hourly outlook/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Precipitation chance/i).length).toBeGreaterThan(0)
  })

  it('updates forecast temperatures when the unit toggle changes', async () => {
    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))
    await userEvent.click(await screen.findByRole('tab', { name: 'Forecast' }))

    expect((await screen.findAllByText(/70°F/i)).length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: /toggle temperature units/i }))
    expect((await screen.findAllByText(/21°C/i)).length).toBeGreaterThan(0)
  })
})