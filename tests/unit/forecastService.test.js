import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchForecast, fetchPointInspection } from '../../src/services/forecast'

describe('forecast service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests and normalizes forecast data', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Los_Angeles',
        daily: {
          time: ['2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27', '2026-03-28', '2026-03-29', '2026-03-30'],
          temperature_2m_max: [20, 21, 22, 23, 24, 25, 26],
          temperature_2m_min: [10, 11, 12, 13, 14, 15, 16],
          precipitation_probability_max: [5, 10, 15, 20, 25, 30, 35],
          weather_code: [2, 2, 2, 2, 2, 2, 2],
        },
        hourly: {
          time: Array.from({ length: 24 }, (_, index) => `2026-03-24T${String(index).padStart(2, '0')}:00`),
          temperature_2m: Array.from({ length: 24 }, (_, index) => 10 + index),
          precipitation_probability: Array.from({ length: 24 }, () => 10),
          weather_code: Array.from({ length: 24 }, () => 2),
          cloud_cover: Array.from({ length: 24 }, () => 20),
        },
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const bundle = await fetchForecast(34.05, -118.24)

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0][0]).toContain('forecast_days=7')
    expect(bundle.daily).toHaveLength(7)
  })

  it('rejects invalid coordinates before requesting data', async () => {
    await expect(fetchForecast('bad', -118.24)).rejects.toThrow(/invalid coordinates/i)
  })

  it('maps aborts to timeout errors', async () => {
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    await expect(fetchForecast(34.05, -118.24)).rejects.toThrow(/timed out/i)
  })

  it('returns point inspection data for a supported overlay', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Los_Angeles',
        hourly: {
          time: ['2026-03-24T00:00'],
          temperature_2m: [18],
          precipitation_probability: [40],
          cloud_cover: [60],
          weather_code: [2],
        },
      }),
    }))

    const inspection = await fetchPointInspection(34.05, -118.24, 'temperature')
    expect(inspection.overlayType).toBe('temperature')
    expect(inspection.summary).toMatch(/temperature/i)
  })
})