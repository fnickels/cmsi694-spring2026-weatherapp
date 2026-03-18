import { describe, it, expect } from 'vitest'
import { searchLocations } from '../../src/services/geocoding'

describe('Location search real API validation', () => {
  const cities = [
    'New York',
    'London',
    'Tokyo',
    'Paris',
    'Los Angeles',
    'Chicago',
    'Berlin',
    'Sydney',
    'Toronto',
    'Madrid',
    'Rome',
    'Seoul',
    'Singapore',
    'Dubai',
    'Mexico City',
    'Sao Paulo',
    'Mumbai',
    'Cape Town',
    'Auckland',
    'Bangkok',
  ]

  it('resolves at least 95% of 20 real valid locations', async () => {
    let success = 0

    for (const city of cities) {
      try {
        const result = await searchLocations(city)
        if (Array.isArray(result) && result.length > 0) {
          success += 1
        }
      } catch {
        // Keep counting failures toward the success threshold.
      }
    }

    expect(success / cities.length).toBeGreaterThanOrEqual(0.95)
  }, 60000)
})
