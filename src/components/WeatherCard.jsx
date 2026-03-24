import {
  celsiusToFahrenheit,
} from '../utils/unitConversions'

function formatTemperature(valueC, unit) {
  if (typeof valueC !== 'number') return '--'
  if (unit === 'imperial') return `${Math.round(celsiusToFahrenheit(valueC))}°F`
  return `${Math.round(valueC)}°C`
}

function formatCoordinate(value, positiveLabel, negativeLabel) {
  if (typeof value !== 'number') return null

  const absoluteValue = Math.abs(value).toFixed(2)
  const direction = value >= 0 ? positiveLabel : negativeLabel
  return `${absoluteValue}° ${direction}`
}

function buildAreaDetails(location) {
  const parts = []
  const hasMeaningfulCity = location?.name && location.name !== 'Your Location'

  if (hasMeaningfulCity) {
    parts.push(`City: ${location.name}`)
  }

  if (location?.admin1) {
    parts.push(`State/Region: ${location.admin1}`)
  }

  if (location?.country) {
    parts.push(`Country: ${location.country}`)
  }

  return parts.length > 0 ? parts.join(' | ') : null
}

function formatLocalTime(observationTime, timezone) {
  if (!observationTime || typeof observationTime !== 'string') {
    return null
  }

  const [datePart, timePart] = observationTime.split('T')
  if (!datePart || !timePart) {
    return observationTime
  }

  const [year, month, day] = datePart.split('-').map(Number)
  const [hour = 0, minute = 0] = timePart.split(':').map(Number)

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
    return observationTime
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const formattedDate = `${monthNames[month - 1]} ${day}, ${year}`

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day, hour, minute)))

  const tzAbbr = timezone
    ? new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      })
        .formatToParts(new Date(Date.UTC(year, month - 1, day, hour, minute)))
        .find((p) => p.type === 'timeZoneName')?.value ?? null
    : null

  return timezone
    ? `${formattedDate}, ${formattedTime} ${tzAbbr ?? ''} (${timezone})`.replace(/\s+\(/, ' (').trim()
    : `${formattedDate}, ${formattedTime}`
}

function WeatherCard({ weather, location, unit = 'imperial', source }) {
  if (!weather) return null

  const isAutoDetected = source === 'auto-detected'
  const locationLabel =
    (location?.approximate ? 'Location (approximate)' : null) ||
    location?.displayName ||
    'Selected Location'
  const latitudeLabel = formatCoordinate(location?.latitude, 'N', 'S')
  const longitudeLabel = formatCoordinate(location?.longitude, 'E', 'W')
  const areaDetails = buildAreaDetails(location)
  const localTimeLabel = formatLocalTime(weather?.observationTime, weather?.timezone)

  return (
    <section className="glass-card p-5" aria-label="Current weather">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs uppercase tracking-wide text-gray-300">{locationLabel}</p>
            {isAutoDetected && (
              <span
                className="inline-block text-xs px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/40"
                aria-label="Location was auto-detected"
              >
                Auto-located
              </span>
            )}
          </div>
          <h2 className="text-3xl font-semibold mt-1">{formatTemperature(weather.temperatureC, unit)}</h2>
          <p className="text-sm text-gray-200">Feels like {formatTemperature(weather.feelsLikeC, unit)}</p>
          {latitudeLabel && longitudeLabel ? (
            <p className="text-xs text-gray-300 mt-2" aria-label="Location coordinates">
              Latitude: {latitudeLabel} | Longitude: {longitudeLabel}
            </p>
          ) : null}
          {areaDetails ? (
            <p className="text-xs text-gray-300 mt-1" aria-label="Resolved location area">
              Coordinates fall within: {areaDetails}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-lg font-medium">{weather.conditionLabel}</p>
          <p className="text-xs text-gray-300">WMO {weather.weatherCode}</p>
        </div>
      </div>
      {localTimeLabel ? (
        <p className="text-xs text-gray-300 mt-3" aria-label="Local time at location">
          Location's Local Time: {localTimeLabel}
        </p>
      ) : null}
    </section>
  )
}

export default WeatherCard
