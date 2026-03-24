const CACHE_PREFIX = 'weatherapp.cache.'
const memoryCache = new Map()

function isValidEntry(entry) {
  return Boolean(
    entry &&
      typeof entry === 'object' &&
      typeof entry.cacheKey === 'string' &&
      typeof entry.kind === 'string' &&
      typeof entry.storedAt === 'string' &&
      typeof entry.expiresAt === 'string' &&
      Object.prototype.hasOwnProperty.call(entry, 'payload')
  )
}

function isExpired(entry) {
  return Date.parse(entry.expiresAt) <= Date.now()
}

function storageKey(cacheKey) {
  return `${CACHE_PREFIX}${cacheKey}`
}

function removeStoredEntry(cacheKey) {
  try {
    sessionStorage.removeItem(storageKey(cacheKey))
  } catch {
    // Ignore storage cleanup failures and continue using in-memory cache.
  }
}

function readStoredEntry(cacheKey) {
  try {
    const rawValue = sessionStorage.getItem(storageKey(cacheKey))
    if (!rawValue) return null

    const parsed = JSON.parse(rawValue)
    if (!isValidEntry(parsed)) {
      removeStoredEntry(cacheKey)
      return null
    }

    if (isExpired(parsed)) {
      removeStoredEntry(cacheKey)
      return null
    }

    return parsed
  } catch {
    removeStoredEntry(cacheKey)
    return null
  }
}

function writeStoredEntry(entry) {
  try {
    sessionStorage.setItem(storageKey(entry.cacheKey), JSON.stringify(entry))
  } catch {
    // Ignore storage write failures; memory cache still serves the session.
  }
}

export function buildCoordinateCacheKey(kind, {
  latitude,
  longitude,
  unit = 'metric',
  overlayType = null,
  timezone = null,
  dayKey = null,
} = {}) {
  if (typeof kind !== 'string' || kind.length === 0) {
    throw new Error('Cache kind is required')
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Valid coordinates are required to build a cache key')
  }

  const normalized = {
    lat: latitude.toFixed(3),
    lon: longitude.toFixed(3),
    unit,
    overlayType,
    timezone,
    dayKey,
  }

  const dimensionString = Object.entries(normalized)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}:${value}`)
    .join('|')

  return `${kind}|${dimensionString}`
}

export function setCachedValue(cacheKey, kind, payload, ttlMs) {
  if (typeof cacheKey !== 'string' || cacheKey.length === 0) {
    throw new Error('cacheKey is required')
  }

  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new Error('ttlMs must be a positive number')
  }

  const nowIso = new Date().toISOString()
  const entry = {
    cacheKey,
    kind,
    storedAt: nowIso,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    payload,
  }

  memoryCache.set(cacheKey, entry)
  writeStoredEntry(entry)
  return entry.payload
}

export function getCachedValue(cacheKey) {
  if (typeof cacheKey !== 'string' || cacheKey.length === 0) {
    return null
  }

  const inMemory = memoryCache.get(cacheKey)
  if (inMemory) {
    if (isExpired(inMemory)) {
      memoryCache.delete(cacheKey)
      removeStoredEntry(cacheKey)
      return null
    }

    return inMemory.payload
  }

  const storedEntry = readStoredEntry(cacheKey)
  if (!storedEntry) {
    return null
  }

  memoryCache.set(cacheKey, storedEntry)
  return storedEntry.payload
}

export function clearExpiredCache() {
  for (const [cacheKey, entry] of memoryCache.entries()) {
    if (isExpired(entry)) {
      memoryCache.delete(cacheKey)
    }
  }

  try {
    const keys = []
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index)
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key)
      }
    }

    keys.forEach((key) => {
      const rawValue = sessionStorage.getItem(key)
      if (!rawValue) {
        sessionStorage.removeItem(key)
        return
      }

      try {
        const parsed = JSON.parse(rawValue)
        if (!isValidEntry(parsed) || isExpired(parsed)) {
          sessionStorage.removeItem(key)
        }
      } catch {
        sessionStorage.removeItem(key)
      }
    })
  } catch {
    // Ignore storage enumeration failures.
  }
}

export function clearRequestCache() {
  memoryCache.clear()

  try {
    const keys = []
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index)
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key)
      }
    }

    keys.forEach((key) => sessionStorage.removeItem(key))
  } catch {
    // Ignore storage cleanup failures.
  }
}