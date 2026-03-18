import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import App from '../../src/App'

vi.mock('../../src/services/geocoding', () => ({
  searchLocations: vi.fn(),
}))

vi.mock('../../src/services/weather', () => ({
  fetchWeather: vi.fn(),
}))

import { searchLocations } from '../../src/services/geocoding'
import { fetchWeather } from '../../src/services/weather'

describe('Accessibility and responsive quality checks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) => {
          success({ coords: { latitude: 34.05, longitude: -118.24 } })
        }),
      },
    })
  })

  it('has no critical axe violations on initial render', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })

  it('supports keyboard navigation to primary controls', async () => {
    render(<App />)

    await userEvent.tab()
    expect(screen.getByRole('button', { name: /toggle temperature units/i })).toHaveFocus()

    await userEvent.tab()
    expect(screen.getByLabelText(/location search/i)).toHaveFocus()

    await userEvent.tab()
    expect(screen.getByRole('button', { name: /^search$/i })).toHaveFocus()

    await userEvent.tab()
    expect(screen.getByRole('button', { name: /use my location/i })).toHaveFocus()
  })

  it('has labels/aria for all interactive controls', async () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /toggle temperature units/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/location search/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /use my location/i })).toBeInTheDocument()
  })

  it('renders core UI without structural regressions at 320/768/1920 widths', async () => {
    const widths = [320, 768, 1920]
    for (const width of widths) {
      window.innerWidth = width
      window.dispatchEvent(new Event('resize'))
      const { unmount } = render(<App />)
      expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /use my location/i })).toBeInTheDocument()
      unmount()
    }
  })

  it('measures search pipeline under 5s with mocked latency', async () => {
    searchLocations.mockResolvedValueOnce([
      {
        id: 10,
        name: 'Los Angeles',
        displayName: 'Los Angeles, California, United States',
        latitude: 34.05,
        longitude: -118.24,
      },
    ])
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
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))
    await screen.findByText(/partly cloudy/i)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(5000)
  })
})
