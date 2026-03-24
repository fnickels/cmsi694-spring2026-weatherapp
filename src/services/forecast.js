import { normalizeForecastResponse, normalizeInspectionResponse } from '../utils/forecastTransform'

const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast'
const TIMEOUT_MS = 8000

function isValidCoordinate(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max
}

function validateCoordinates(latitude, longitude) {
  if (!isValidCoordinate(latitude, -90, 90) || !isValidCoordinate(longitude, -180, 180)) {
    throw new Error('Invalid coordinates provided')
  }
}

function createTimeoutController(timeoutMs) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return { controller, timeoutId }
}

function reportDiagnostic(event, details) {
  if (typeof console === 'undefined') return

  const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
  const isDev = typeof import.meta !== 'undefined' && import.meta?.env?.DEV
  if (isTest || isDev) {
    console.warn(`[weatherapp:${event}]`, details)
  }
}

async function requestForecast(params, diagnosticContext, timeoutMs = TIMEOUT_MS) {
  const { controller, timeoutId } = createTimeoutController(timeoutMs)

  try {
    const response = await fetch(`${FORECAST_API_URL}?${params.toString()}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    reportDiagnostic('request-failure', {
      ...diagnosticContext,
      message: error.message,
      name: error.name,
    })

    if (error.name === 'AbortError') {
      throw new Error('Weather request timed out. Please try again.')
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.')
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchForecast(latitude, longitude, { forecastDays = 7 } = {}) {
  validateCoordinates(latitude, longitude)

  if (!Number.isInteger(forecastDays) || forecastDays < 5 || forecastDays > 10) {
    throw new Error('forecastDays must be between 5 and 10')
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: 'auto',
    forecast_days: forecastDays.toString(),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    hourly: 'temperature_2m,precipitation_probability,weather_code,cloud_cover',
  })

  const response = await requestForecast(params, {
    provider: 'open-meteo',
    requestType: 'forecast',
    latitude,
    longitude,
  })

  return normalizeForecastResponse(response, { latitude, longitude, forecastDays })
}

export async function fetchPointInspection(latitude, longitude, overlayType) {
  validateCoordinates(latitude, longitude)

  const supportedOverlays = ['precipitation', 'temperature', 'cloud-cover']
  if (!supportedOverlays.includes(overlayType)) {
    throw new Error('Unsupported overlay type for inspection')
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: 'auto',
    forecast_days: '1',
    hourly: 'temperature_2m,precipitation_probability,cloud_cover,weather_code',
  })

  const response = await requestForecast(params, {
    provider: 'open-meteo',
    requestType: 'inspection',
    latitude,
    longitude,
    overlayType,
  })

  return normalizeInspectionResponse({ ...response, latitude, longitude }, overlayType)
}