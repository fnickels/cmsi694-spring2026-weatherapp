/**
 * Weather Service
 * Fetches current weather conditions from Open-Meteo Weather API
 */

import { getWmoInfo } from '../utils/wmoConditions'
import { getWindDirectionLabel } from '../utils/unitConversions'

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'
const TIMEOUT_MS = 8000

/**
 * Fetch current weather for given coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} unit - Unit preference: 'imperial' or 'metric'
 * @returns {Promise<Object>} Current weather object
 * @throws {Error} If API call fails or data is invalid
 */
export async function fetchWeather(latitude, longitude, unit = 'metric') {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Invalid coordinates provided')
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    // Always fetch metric data; conversion happens client-side per SC-004
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,visibility',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      forecast_days: 1
    })

    const response = await fetch(
      `${WEATHER_API_URL}?${params.toString()}`,
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
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    // Validate response structure
    if (!data.current) {
      throw new Error('Invalid weather data: missing current field')
    }

    const current = data.current
    const wmoInfo = getWmoInfo(current.weather_code)

    // Build weather object with normalized metric storage
    const weather = {
      locationId: null, // Will be set by caller
      observationTime: current.time || new Date().toISOString(),
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeedKph: current.wind_speed_10m,
      windDirectionDeg: current.wind_direction_10m,
      windDirectionLabel: getWindDirectionLabel(current.wind_direction_10m),
      visibilityM: current.visibility, // Always metres from API
      weatherCode: current.weather_code,
      conditionLabel: wmoInfo.label,
      conditionIcon: wmoInfo.icon
    }

    return weather
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Weather request timed out. Please try again.')
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.')
    }
    throw error
  }
}
