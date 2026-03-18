import {
  celsiusToFahrenheit,
} from '../utils/unitConversions'

function formatTemperature(valueC, unit) {
  if (typeof valueC !== 'number') return '--'
  if (unit === 'imperial') return `${Math.round(celsiusToFahrenheit(valueC))}°F`
  return `${Math.round(valueC)}°C`
}

function WeatherCard({ weather, location, unit = 'imperial' }) {
  if (!weather) return null

  return (
    <section className="glass-card p-5" aria-label="Current weather">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-300">{location?.displayName || 'Selected Location'}</p>
          <h2 className="text-3xl font-semibold mt-1">{formatTemperature(weather.temperatureC, unit)}</h2>
          <p className="text-sm text-gray-200">Feels like {formatTemperature(weather.feelsLikeC, unit)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium">{weather.conditionLabel}</p>
          <p className="text-xs text-gray-300">WMO {weather.weatherCode}</p>
        </div>
      </div>
      <p className="text-xs text-gray-300 mt-3">Observed: {weather.observationTime}</p>
    </section>
  )
}

export default WeatherCard
