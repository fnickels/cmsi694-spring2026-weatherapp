import { celsiusToFahrenheit } from '../utils/unitConversions'

function formatTemperature(valueC, unitPreference) {
  if (!Number.isFinite(valueC)) return '--'
  return unitPreference === 'imperial'
    ? `${Math.round(celsiusToFahrenheit(valueC))}°F`
    : `${Math.round(valueC)}°C`
}

function HourlyForecastPanel({ hours, unitPreference, heading }) {
  if (!Array.isArray(hours) || hours.length === 0) {
    return null
  }

  return (
    <section aria-label="24-hour hourly forecast" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{heading}</h3>
        <p className="text-xs text-gray-300">Next 24 hours</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hours.map((hour) => (
          <article key={hour.time} className="glass-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{hour.hourLabel}</p>
                <p className="text-xs text-gray-300">{hour.conditionLabel}</p>
              </div>
              <p className="text-base font-medium text-white">
                {formatTemperature(hour.temperatureC, unitPreference)}
              </p>
            </div>
            <p className="mt-3 text-xs text-sky-200">
              Precipitation chance {hour.precipitationProbabilityPct}%
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HourlyForecastPanel