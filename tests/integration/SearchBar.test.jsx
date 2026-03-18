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

const baseWeather = {
  observationTime: '2026-03-18T10:00',
  temperatureC: 20,
  feelsLikeC: 19,
  humidity: 60,
  windSpeedKph: 18,
  windDirectionDeg: 90,
  windDirectionLabel: 'E',
  visibilityM: 10000,
  weatherCode: 1,
  conditionLabel: 'Mainly Clear',
  conditionIcon: 'mostly-clear-day',
}

describe('SearchBar integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searches and displays weather for valid city', async () => {
    searchLocations.mockResolvedValueOnce([
      {
        id: 1,
        name: 'Chicago',
        displayName: 'Chicago, Illinois, United States',
        latitude: 41.8781,
        longitude: -87.6298,
      },
    ])
    fetchWeather.mockResolvedValueOnce(baseWeather)

    render(<App />)

    await userEvent.type(screen.getByLabelText(/location search/i), 'Chicago')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByText(/mainly clear/i)).toBeInTheDocument()
    expect(fetchWeather).toHaveBeenCalledTimes(1)
  })

  it('empty or whitespace query does not call geocoding and shows helper', async () => {
    render(<App />)

    await userEvent.type(screen.getByLabelText(/location search/i), '   ')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(searchLocations).not.toHaveBeenCalled()
    expect(screen.getByText(/enter a city or town to search/i)).toBeInTheDocument()
  })

  it('special characters are passed through to geocoding request', async () => {
    searchLocations.mockResolvedValueOnce([])

    render(<App />)

    const specialQuery = 'São Paulo'
    await userEvent.type(screen.getByLabelText(/location search/i), specialQuery)
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(searchLocations).toHaveBeenCalledWith(specialQuery)
  })
})
