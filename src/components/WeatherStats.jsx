import {
  kmhToMph,
  metresToKilometers,
  metresToMiles,
} from '../utils/unitConversions'

function WeatherStats({ weather, unit = 'imperial' }) {
  if (!weather) return null

  const windSpeed = unit === 'imperial'
    ? `${Math.round(kmhToMph(weather.windSpeedKph))} mph`
    : `${Math.round(weather.windSpeedKph)} km/h`

  const visibility = unit === 'imperial'
    ? `${metresToMiles(weather.visibilityM).toFixed(1)} mi`
    : `${metresToKilometers(weather.visibilityM).toFixed(1)} km`

  return (
    <section className="glass-card p-4" aria-label="Weather statistics">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-gray-300">Humidity</p>
          <p className="text-lg">{weather.humidity}%</p>
        </div>
        <div>
          <p className="text-gray-300">Wind</p>
          <p className="text-lg">{windSpeed} {weather.windDirectionLabel}</p>
        </div>
        <div>
          <p className="text-gray-300">Visibility</p>
          <p className="text-lg">{visibility}</p>
        </div>
      </div>
    </section>
  )
}

export default WeatherStats
