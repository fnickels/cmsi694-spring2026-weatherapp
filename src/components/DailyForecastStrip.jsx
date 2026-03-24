import { celsiusToFahrenheit } from '../utils/unitConversions'

function formatTemperature(valueC, unitPreference) {
  if (!Number.isFinite(valueC)) return '--'
  return unitPreference === 'imperial'
    ? `${Math.round(celsiusToFahrenheit(valueC))}°F`
    : `${Math.round(valueC)}°C`
}

function DailyForecastStrip({ days, selectedDay, onSelectDay, unitPreference }) {
  if (!Array.isArray(days) || days.length === 0) {
    return null
  }

  return (
    <section aria-label="7-day forecast summary" className="space-y-3">
      <h3 className="text-lg font-semibold text-white">7-Day Forecast</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {days.map((day) => {
          const isSelected = selectedDay === day.date

          return (
            <button
              key={day.date}
              type="button"
              className={`glass-card-hover p-4 text-left ${isSelected ? 'ring-2 ring-sky-300' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelectDay(day.date)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{day.label}</p>
                  <p className="text-xs text-gray-300">{day.date}</p>
                </div>
                <span className="text-xs text-gray-200">{day.conditionLabel}</span>
              </div>
              <p className="mt-4 text-sm text-gray-100">
                High {formatTemperature(day.temperatureMaxC, unitPreference)}
              </p>
              <p className="text-sm text-gray-200">
                Low {formatTemperature(day.temperatureMinC, unitPreference)}
              </p>
              <p className="mt-2 text-xs text-sky-200">
                Precipitation chance {day.precipitationProbabilityPct}%
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default DailyForecastStrip