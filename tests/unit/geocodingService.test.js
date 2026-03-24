import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reverseGeocodeLocation } from '../../src/services/geocoding'

describe('geocoding service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('chooses the closest city-like result when reverse geocoding', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            name: 'Hollywood Hills',
            latitude: 34.1205,
            longitude: -118.3217,
            feature_code: 'LCTY',
            country: 'United States',
            country_code: 'US',
            admin1: 'California',
          },
          {
            id: 2,
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
    }))

    const result = await reverseGeocodeLocation(34.05, -118.24)

    expect(result.name).toBe('Los Angeles')
    expect(result.displayName).toBe('Los Angeles, California, United States')
  })

  it('chooses the nearest city when multiple city candidates exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 10,
            name: 'Pasadena',
            latitude: 34.1478,
            longitude: -118.1445,
            feature_code: 'PPL',
            country: 'United States',
            country_code: 'US',
            admin1: 'California',
          },
          {
            id: 11,
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
    }))

    const result = await reverseGeocodeLocation(34.05, -118.24)

    expect(result.name).toBe('Los Angeles')
  })

  it('falls back to closest non-city result when no city results are returned', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 20,
            name: 'Local Area One',
            latitude: 34.1,
            longitude: -118.3,
            feature_code: 'AREA',
            country: 'United States',
            country_code: 'US',
            admin1: 'California',
          },
          {
            id: 21,
            name: 'Local Area Two',
            latitude: 34.0501,
            longitude: -118.2402,
            feature_code: 'AREA',
            country: 'United States',
            country_code: 'US',
            admin1: 'California',
          },
        ],
      }),
    }))

    const result = await reverseGeocodeLocation(34.05, -118.24)

    expect(result.name).toBe('Local Area Two')
  })

  it('requests multiple reverse geocoding candidates', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 30,
            name: 'Los Angeles',
            latitude: 34.0522,
            longitude: -118.2437,
            feature_code: 'PPLA',
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    await reverseGeocodeLocation(34.05, -118.24)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [requestUrl] = fetchSpy.mock.calls[0]
    expect(requestUrl).toContain('count=10')
  })
})
