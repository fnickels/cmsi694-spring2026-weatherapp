import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reverseGeocodeLocation } from '../../src/services/geocoding'

// Mock the geocoding module to provide a test API key
vi.mock('../../src/services/geocoding', async () => {
  const actual = await vi.importActual('../../src/services/geocoding')
  return {
    ...actual,
  }
})

describe('geocoding service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the first (closest) result from OpenWeather reverse geocoding', async () => {
    // Set up test API key in import.meta.env
    import.meta.env.VITE_OPENWEATHER_API_KEY = 'test-api-key'
    
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'Los Angeles',
          lat: 34.0522,
          lon: -118.2437,
          country: 'United States',
          country_code: 'US',
          state: 'California',
        },
        {
          name: 'Hollywood Hills',
          lat: 34.1205,
          lon: -118.3217,
          country: 'United States',
          country_code: 'US',
          state: 'California',
        },
      ],
    }))

    const result = await reverseGeocodeLocation(34.05, -118.24)

    expect(result.name).toBe('Los Angeles')
    expect(result.displayName).toBe('Los Angeles, California, United States')
  })

  it('handles empty results gracefully', async () => {
    import.meta.env.VITE_OPENWEATHER_API_KEY = 'test-api-key'
    
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }))

    const result = await reverseGeocodeLocation(34.05, -118.24)

    expect(result).toBeNull()
  })

  it('throws error when API key is missing', async () => {
    import.meta.env.VITE_OPENWEATHER_API_KEY = ''
    
    await expect(reverseGeocodeLocation(34.05, -118.24)).rejects.toThrow(
      /OpenWeather API key not configured/
    )
  })

  it('requests limit=10 from OpenWeather reverse geocoding', async () => {
    import.meta.env.VITE_OPENWEATHER_API_KEY = 'test-api-key'
    
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'Los Angeles',
          lat: 34.0522,
          lon: -118.2437,
          country: 'United States',
          country_code: 'US',
          state: 'California',
        },
      ],
    })
    vi.stubGlobal('fetch', fetchSpy)

    await reverseGeocodeLocation(34.05, -118.24)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [requestUrl] = fetchSpy.mock.calls[0]
    expect(requestUrl).toContain('limit=10')
    expect(requestUrl).toContain('appid=test-api-key')
  })
})
