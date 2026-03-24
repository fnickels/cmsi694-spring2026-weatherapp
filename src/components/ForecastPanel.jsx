import ErrorMessage from './ErrorMessage'
import LoadingSpinner from './LoadingSpinner'
import DailyForecastStrip from './DailyForecastStrip'
import HourlyForecastPanel from './HourlyForecastPanel'
import { useForecastData } from '../hooks/useForecastData'

function ForecastPanel({ location, unitPreference, isActive }) {
  const {
    forecastBundle,
    isLoading,
    errorMessage,
    selectedDay,
    selectDay,
    retry,
  } = useForecastData(location, isActive)

  const selectedHours = selectedDay && forecastBundle?.hourlyByDay[selectedDay]
    ? forecastBundle.hourlyByDay[selectedDay].slice(0, 24)
    : forecastBundle?.defaultHourlyWindow ?? []

  return (
    <section
      id="results-panel-forecast"
      role="tabpanel"
      aria-labelledby="results-tab-forecast"
      className="space-y-4"
    >
      {isLoading ? <LoadingSpinner message="Loading forecast data..." /> : null}

      {errorMessage ? (
        <div className="space-y-3">
          <ErrorMessage message={errorMessage} geoErrorType="weather-service" />
          <button type="button" className="btn-secondary" onClick={retry}>
            Retry forecast
          </button>
        </div>
      ) : null}

      {forecastBundle ? (
        <div className="space-y-4">
          <DailyForecastStrip
            days={forecastBundle.daily}
            selectedDay={selectedDay}
            onSelectDay={selectDay}
            unitPreference={unitPreference}
          />
          <HourlyForecastPanel
            hours={selectedHours}
            unitPreference={unitPreference}
            heading="24-hour hourly outlook"
          />
        </div>
      ) : null}
    </section>
  )
}

export default ForecastPanel