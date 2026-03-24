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
  fetchPointInspection: vi.fn(),
}))

vi.mock('../../src/services/overlays', () => ({
  getOverlayConfig: vi.fn((overlayType) => ({
    id: overlayType,
    title: overlayType,
    legendItems: [{ label: 'Demo', color: '#60a5fa', value: 'demo' }],
  })),
  resolveOverlayTileUrl: vi.fn().mockResolvedValue('https://example.com/overlay.png'),
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

vi.mock('../../src/components/WeatherMapCanvas', () => ({
  default: function MockWeatherMapCanvas({ center, onReady, onError, onInspectPoint }) {
    return (
      <div aria-label="Mock weather map canvas">
        <p>{center.join(',')}</p>
        <button type="button" onClick={() => onReady()}>
          Mark map ready
        </button>
        <button type="button" onClick={() => onInspectPoint({ latitude: center[0], longitude: center[1] })}>
          Inspect point
        </button>
        <button type="button" onClick={() => onError('Map runtime unavailable')}>
          Trigger map error
        </button>
      </div>
    )
  },
}))

import { searchLocations } from '../../src/services/geocoding'
import { fetchWeather } from '../../src/services/weather'
import { resolveOverlayTileUrl } from '../../src/services/overlays'

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

describe('MapView integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    searchLocations.mockResolvedValue([location])
    fetchWeather.mockResolvedValue(currentWeather)
  })

  it('does not initialize the map overlay until the Map tab is opened', async () => {
    render(<App />)
    await userEvent.type(screen.getByLabelText(/location search/i), 'Los Angeles')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(resolveOverlayTileUrl).not.toHaveBeenCalled()

    await userEvent.click(await screen.findByRole('tab', { name: 'Map' }))
    expect(await screen.findByText(/loading map view/i)).toBeInTheDocument()
  })
})