import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildCoordinateCacheKey,
  clearExpiredCache,
  clearRequestCache,
  getCachedValue,
  setCachedValue,
} from '../../src/utils/requestCache'

describe('requestCache', () => {
  beforeEach(() => {
    clearRequestCache()
    sessionStorage.clear()
  })

  it('builds a stable coordinate cache key', () => {
    expect(
      buildCoordinateCacheKey('forecast', {
        latitude: 34.0522,
        longitude: -118.2437,
        unit: 'metric',
      })
    ).toBe('forecast|lat:34.052|lon:-118.244|unit:metric')
  })

  it('stores and retrieves cached payloads', () => {
    setCachedValue('forecast|demo', 'forecast', { value: 42 }, 30_000)

    expect(getCachedValue('forecast|demo')).toEqual({ value: 42 })
  })

  it('hydrates from sessionStorage when memory cache is empty', () => {
    setCachedValue('inspection|demo', 'inspection', { summary: 'ready' }, 30_000)
    clearRequestCache()

    sessionStorage.setItem(
      'weatherapp.cache.inspection|demo',
      JSON.stringify({
        cacheKey: 'inspection|demo',
        kind: 'inspection',
        storedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30_000).toISOString(),
        payload: { summary: 'ready' },
      })
    )

    expect(getCachedValue('inspection|demo')).toEqual({ summary: 'ready' })
  })

  it('returns null and removes expired entries', () => {
    sessionStorage.setItem(
      'weatherapp.cache.forecast|expired',
      JSON.stringify({
        cacheKey: 'forecast|expired',
        kind: 'forecast',
        storedAt: new Date(Date.now() - 60_000).toISOString(),
        expiresAt: new Date(Date.now() - 10_000).toISOString(),
        payload: { stale: true },
      })
    )

    clearExpiredCache()

    expect(getCachedValue('forecast|expired')).toBeNull()
    expect(sessionStorage.getItem('weatherapp.cache.forecast|expired')).toBeNull()
  })
})