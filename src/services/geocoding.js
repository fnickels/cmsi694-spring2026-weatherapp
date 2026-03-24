/**
 * Geocoding Service
 * Uses OpenWeather Geocoding API for location name search and reverse geocoding
 */

const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const REVERSE_GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/reverse'
const TIMEOUT_MS = 8000

function getOpenWeatherApiKey() {
  return import.meta.env.VITE_OPENWEATHER_API_KEY || ''
}

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

  const apiKey = getOpenWeatherApiKey()
  if (!apiKey) {
    throw new Error('OpenWeather API key not configured. Set VITE_OPENWEATHER_API_KEY environment variable.')
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const params = new URLSearchParams({
      q: query.trim(),
      limit: '5',
      appid: apiKey
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

    // Handle case where results key is missing or not an array
    if (!Array.isArray(data)) {
      return []
    }

    // Transform API results to Location entities
    return data.map(result => ({
      id: `${result.lat},${result.lon}`,
      name: result.name,
      latitude: result.lat,
      longitude: result.lon,
      country: result.country || '',
      countryCode: result.country_code || '',
      admin1: result.state || null,
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

  const apiKey = getOpenWeatherApiKey()
  if (!apiKey) {
    throw new Error('OpenWeather API key not configured. Set VITE_OPENWEATHER_API_KEY environment variable.')
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      limit: '10',
      appid: apiKey
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

    if (!Array.isArray(data) || data.length === 0) {
      return null
    }

    // OpenWeather returns results ordered by proximity
    // First result is the closest/most relevant
    const result = data[0]

    return {
      id: `${result.lat},${result.lon}`,
      name: result.name || 'Your Location',
      latitude,
      longitude,
      country: result.country || '',
      countryCode: result.country_code || '',
      admin1: result.state || null,
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
  
  if (result.state) {
    parts.push(result.state)
  }
  
  if (result.country) {
    parts.push(result.country)
  }
  
  return parts.join(', ')
}
