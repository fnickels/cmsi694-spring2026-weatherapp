/**
 * Geocoding Service
 * Uses Open-Meteo Geocoding API to convert location names to coordinates
 */

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const REVERSE_GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/reverse'
const TIMEOUT_MS = 8000
const CITY_FEATURE_CODES = new Set([
  'PPL',
  'PPLA',
  'PPLA2',
  'PPLA3',
  'PPLA4',
  'PPLC',
  'PPLG',
  'PPLL',
  'PPLQ',
  'PPLR',
  'PPLS',
  'PPLW',
  'PPLX',
])

/**
 * Search for locations by name
 * @param {string} query - Location search query (city name)
 * @returns {Promise<Array>} Array of matching locations with coordinates
 * @throws {Error} If API call fails or times out
 */
export async function searchLocations(query) {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const params = new URLSearchParams({
      name: query.trim(),
      count: 5,
      language: 'en',
      format: 'json'
    })

    const response = await fetch(
      `${GEOCODING_API_URL}?${params.toString()}`,
      {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    // Handle case where results key is missing
    if (!data.results || !Array.isArray(data.results)) {
      return []
    }

    // Transform API results to Location entities
    return data.results.map(result => ({
      id: result.id,
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country || '',
      countryCode: result.country_code || '',
      admin1: result.admin1 || null,
      displayName: formatDisplayName(result)
    }))
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Geolocation request timed out. Please try again.')
    }
    // Network errors, malformed response, etc.
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.')
    }
    throw error
  }
}

/**
 * Resolve a human-readable place from coordinates.
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object|null>} Best matching location or null when no place is found
 * @throws {Error} If API call fails or times out
 */
export async function reverseGeocodeLocation(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      count: 10,
      language: 'en',
      format: 'json'
    })

    const response = await fetch(
      `${REVERSE_GEOCODING_API_URL}?${params.toString()}`,
      {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      return null
    }

    const result = pickClosestCityResult(data.results, latitude, longitude)

    return {
      id: result.id ?? `${latitude},${longitude}`,
      name: result.name || 'Your Location',
      latitude,
      longitude,
      country: result.country || '',
      countryCode: result.country_code || '',
      admin1: result.admin1 || null,
      displayName: formatDisplayName(result) || 'Location (approximate)',
      approximate: false,
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Reverse geocoding request timed out. Please try again.')
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.')
    }
    throw error
  }
}

function pickClosestCityResult(results, latitude, longitude) {
  const cityCandidates = results.filter((result) => isCityLikeResult(result))
  const candidates = cityCandidates.length > 0 ? cityCandidates : results

  return candidates.reduce((closest, candidate) => {
    if (!closest) {
      return candidate
    }

    const closestDistance = coordinateDistanceSquared(closest, latitude, longitude)
    const candidateDistance = coordinateDistanceSquared(candidate, latitude, longitude)

    return candidateDistance < closestDistance ? candidate : closest
  }, null)
}

function isCityLikeResult(result) {
  const featureCode = typeof result.feature_code === 'string'
    ? result.feature_code.toUpperCase()
    : ''
  return CITY_FEATURE_CODES.has(featureCode)
}

function coordinateDistanceSquared(result, latitude, longitude) {
  const resultLat = Number(result.latitude)
  const resultLon = Number(result.longitude)

  if (Number.isNaN(resultLat) || Number.isNaN(resultLon)) {
    return Number.POSITIVE_INFINITY
  }

  const latDiff = resultLat - latitude
  const lonDiff = resultLon - longitude
  return (latDiff * latDiff) + (lonDiff * lonDiff)
}

/**
 * Format a display name from a location result
 * @param {Object} result - API location result
 * @returns {string} Formatted display name
 */
function formatDisplayName(result) {
  const parts = []
  
  if (result.name) {
    parts.push(result.name)
  }
  
  if (result.admin1) {
    parts.push(result.admin1)
  }
  
  if (result.country) {
    parts.push(result.country)
  }
  
  return parts.join(', ')
}
