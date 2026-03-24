import { getWmoInfo } from './wmoConditions'

function assertArrayLength(values, fieldName) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`Invalid forecast data: missing ${fieldName}`)
  }
}

function clampProbability(value) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

function formatDayLabel(dateString, timezone) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: timezone,
  }).format(new Date(`${dateString}T12:00:00Z`))
}

function formatHourLabel(dateTime, timezone) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone: timezone,
  }).format(new Date(dateTime))
}

function buildDailyPeriods(data, timezone, forecastDays) {
  const daily = data.daily
  const fields = [
    ['time', daily.time],
    ['temperature_2m_max', daily.temperature_2m_max],
    ['temperature_2m_min', daily.temperature_2m_min],
    ['precipitation_probability_max', daily.precipitation_probability_max],
    ['weather_code', daily.weather_code],
  ]

  fields.forEach(([fieldName, values]) => assertArrayLength(values, `daily.${fieldName}`))

  return daily.time.slice(0, forecastDays).map((date, index) => {
    const weatherCode = daily.weather_code[index]
    const wmoInfo = getWmoInfo(weatherCode)

    return {
      date,
      label: formatDayLabel(date, timezone),
      temperatureMinC: daily.temperature_2m_min[index],
      temperatureMaxC: daily.temperature_2m_max[index],
      precipitationProbabilityPct: clampProbability(daily.precipitation_probability_max[index]),
      weatherCode,
      conditionLabel: wmoInfo.label,
      conditionIcon: wmoInfo.icon,
      cloudCoverAvgPct: null,
    }
  })
}

function buildHourlyPoints(data, timezone) {
  const hourly = data.hourly
  const fields = [
    ['time', hourly.time],
    ['temperature_2m', hourly.temperature_2m],
    ['precipitation_probability', hourly.precipitation_probability],
    ['weather_code', hourly.weather_code],
    ['cloud_cover', hourly.cloud_cover],
  ]

  fields.forEach(([fieldName, values]) => assertArrayLength(values, `hourly.${fieldName}`))

  const lengths = fields.map(([, values]) => values.length)
  const uniqueLengths = new Set(lengths)
  if (uniqueLengths.size !== 1) {
    throw new Error('Invalid forecast data: hourly arrays must be the same length')
  }

  return hourly.time.map((time, index) => {
    const weatherCode = hourly.weather_code[index]
    const wmoInfo = getWmoInfo(weatherCode)

    return {
      time,
      hourLabel: formatHourLabel(time, timezone),
      temperatureC: hourly.temperature_2m[index],
      precipitationProbabilityPct: clampProbability(hourly.precipitation_probability[index]),
      cloudCoverPct: clampProbability(hourly.cloud_cover[index]),
      weatherCode,
      conditionLabel: wmoInfo.label,
      conditionIcon: wmoInfo.icon,
    }
  })
}

export function normalizeForecastResponse(data, { latitude, longitude, forecastDays = 7 } = {}) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid forecast data: response body is required')
  }

  if (!data.daily || !data.hourly || typeof data.timezone !== 'string') {
    throw new Error('Invalid forecast data: missing required forecast sections')
  }

  if (!Number.isInteger(forecastDays) || forecastDays < 5 || forecastDays > 10) {
    throw new Error('forecastDays must be between 5 and 10')
  }

  const timezone = data.timezone
  const daily = buildDailyPeriods(data, timezone, forecastDays)
  const hourly = buildHourlyPoints(data, timezone)

  if (daily.length === 0) {
    throw new Error('Invalid forecast data: at least one daily period is required')
  }

  const hourlyByDay = hourly.reduce((groups, point) => {
    const dayKey = point.time.slice(0, 10)
    groups[dayKey] = groups[dayKey] ? [...groups[dayKey], point] : [point]
    return groups
  }, {})

  return {
    locationKey: `${Number(latitude).toFixed(3)},${Number(longitude).toFixed(3)}|${timezone}`,
    timezone,
    fetchedAt: new Date().toISOString(),
    daily,
    hourly,
    hourlyByDay,
    defaultHourlyWindow: hourly.slice(0, 24),
    status: 'ready',
    errorMessage: null,
  }
}

export function normalizeInspectionResponse(data, overlayType) {
  if (!data?.hourly?.time?.length) {
    throw new Error('Invalid inspection data: hourly series is required')
  }

  const point = buildHourlyPoints(data, data.timezone || 'UTC')[0]
  const overlayMapping = {
    precipitation: {
      value: point.precipitationProbabilityPct,
      unit: '%',
      summary: `Precipitation chance near this point is ${point.precipitationProbabilityPct}%.`,
    },
    temperature: {
      value: point.temperatureC,
      unit: 'C',
      summary: `Temperature near this point is ${Math.round(point.temperatureC)}°C.`,
    },
    'cloud-cover': {
      value: point.cloudCoverPct,
      unit: '%',
      summary: `Cloud cover near this point is ${point.cloudCoverPct}%.`,
    },
  }

  const selected = overlayMapping[overlayType]
  if (!selected) {
    throw new Error('Unsupported overlay type for inspection')
  }

  return {
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    inspectedAt: new Date().toISOString(),
    overlayType,
    value: selected.value,
    unit: selected.unit,
    summary: selected.summary,
    point,
    status: 'ready',
    errorMessage: null,
  }
}