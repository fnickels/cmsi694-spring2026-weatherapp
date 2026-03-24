import { describe, expect, it } from 'vitest'
import { normalizeForecastResponse, normalizeInspectionResponse } from '../../src/utils/forecastTransform'

function buildForecastFixture() {
  return {
    timezone: 'America/Los_Angeles',
    daily: {
      time: ['2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27', '2026-03-28', '2026-03-29', '2026-03-30'],
      temperature_2m_max: [21, 19, 18, 20, 23, 24, 22],
      temperature_2m_min: [11, 10, 9, 12, 13, 14, 12],
      precipitation_probability_max: [10, 15, 20, 25, 30, 35, 40],
      weather_code: [1, 2, 3, 61, 63, 0, 2],
    },
    hourly: {
      time: Array.from({ length: 30 }, (_, index) => `2026-03-24T${String(index % 24).padStart(2, '0')}:00`),
      temperature_2m: Array.from({ length: 30 }, (_, index) => 10 + index),
      precipitation_probability: Array.from({ length: 30 }, (_, index) => index),
      weather_code: Array.from({ length: 30 }, () => 2),
      cloud_cover: Array.from({ length: 30 }, (_, index) => index + 5),
    },
  }
}

describe('forecastTransform', () => {
  it('normalizes forecast payload into the expected bundle shape', () => {
    const bundle = normalizeForecastResponse(buildForecastFixture(), {
      latitude: 34.05,
      longitude: -118.24,
      forecastDays: 7,
    })

    expect(bundle.timezone).toBe('America/Los_Angeles')
    expect(bundle.daily).toHaveLength(7)
    expect(bundle.defaultHourlyWindow).toHaveLength(24)
    expect(bundle.hourlyByDay['2026-03-24']).toBeDefined()
    expect(bundle.daily[0]).toMatchObject({
      date: '2026-03-24',
      temperatureMaxC: 21,
      temperatureMinC: 11,
      conditionLabel: 'Mainly Clear',
    })
  })

  it('throws when required sections are missing', () => {
    expect(() => normalizeForecastResponse({ timezone: 'UTC' }, { latitude: 0, longitude: 0 })).toThrow(
      /missing required forecast sections/i
    )
  })

  it('normalizes point inspection values for the selected overlay', () => {
    const inspection = normalizeInspectionResponse(
      {
        ...buildForecastFixture(),
        latitude: 34.05,
        longitude: -118.24,
      },
      'cloud-cover'
    )

    expect(inspection.overlayType).toBe('cloud-cover')
    expect(inspection.unit).toBe('%')
    expect(inspection.summary).toMatch(/cloud cover/i)
  })
})