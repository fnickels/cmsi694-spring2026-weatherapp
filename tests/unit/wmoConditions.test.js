import { describe, it, expect } from 'vitest'
import { getWmoInfo } from '../../src/utils/wmoConditions'

describe('wmoConditions', () => {
  // Canonical fixture oracle for all supported WMO codes.
  const fixture = {
    0: { label: 'Clear Sky', icon: 'clear-day' },
    1: { label: 'Mainly Clear', icon: 'mostly-clear-day' },
    2: { label: 'Partly Cloudy', icon: 'partly-cloudy-day' },
    3: { label: 'Overcast', icon: 'overcast' },
    45: { label: 'Foggy', icon: 'fog' },
    48: { label: 'Frosty', icon: 'fog' },
    51: { label: 'Light Drizzle', icon: 'drizzle' },
    53: { label: 'Moderate Drizzle', icon: 'drizzle' },
    55: { label: 'Dense Drizzle', icon: 'drizzle' },
    56: { label: 'Light Freezing Drizzle', icon: 'sleet' },
    57: { label: 'Dense Freezing Drizzle', icon: 'sleet' },
    61: { label: 'Slight Rain', icon: 'rain' },
    63: { label: 'Moderate Rain', icon: 'rain' },
    65: { label: 'Heavy Rain', icon: 'rain' },
    66: { label: 'Light Freezing Rain', icon: 'sleet' },
    67: { label: 'Heavy Freezing Rain', icon: 'sleet' },
    71: { label: 'Slight Snowfall', icon: 'snow' },
    73: { label: 'Moderate Snowfall', icon: 'snow' },
    75: { label: 'Heavy Snowfall', icon: 'snow' },
    77: { label: 'Snow Grains', icon: 'snow' },
    80: { label: 'Slight Shower', icon: 'rain' },
    81: { label: 'Moderate Shower', icon: 'rain' },
    82: { label: 'Violent Shower', icon: 'rain' },
    85: { label: 'Light Snow Showers', icon: 'snow' },
    86: { label: 'Heavy Snow Showers', icon: 'snow' },
    95: { label: 'Thunderstorm', icon: 'thunderstorm' },
    96: { label: 'Thunderstorm with Hail', icon: 'thunderstorm' },
    99: { label: 'Thunderstorm with Snow', icon: 'thunderstorm' },
  }

  const testCases = Object.keys(fixture).map(Number)

  testCases.forEach((code) => {
    it(`WMO code ${code} returns label and icon`, () => {
      const info = getWmoInfo(code)
      expect(info).toBeDefined()
      expect(info.label).toBeDefined()
      expect(typeof info.label).toBe('string')
      expect(info.label.length).toBeGreaterThan(0)
      expect(info.icon).toBeDefined()
      expect(typeof info.icon).toBe('string')
      expect(info.icon.length).toBeGreaterThan(0)
    })
  })

  it('matches canonical fixture label/icon oracle exactly', () => {
    for (const [key, expected] of Object.entries(fixture)) {
      const actual = getWmoInfo(Number(key))
      expect(actual).toEqual(expected)
    }
  })

  it('Unknown code returns fallback label and icon', () => {
    const info = getWmoInfo(999)
    expect(info).toBeDefined()
    expect(info.label).toBe('Unknown')
    expect(info.icon).toBe('unknown')
  })

  it('Returns correct object structure', () => {
    const info = getWmoInfo(0)
    expect(info).toHaveProperty('label')
    expect(info).toHaveProperty('icon')
    expect(Object.keys(info).length).toBe(2)
  })
})
