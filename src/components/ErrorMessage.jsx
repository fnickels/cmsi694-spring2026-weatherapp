/**
 * User-facing messages for geolocation-specific errors (FR-008).
 * Distinguishes location-access failures from weather-service failures.
 */
const GEO_ERROR_MESSAGES = {
  denied:          'Location access was denied — try entering a city name below.',
  timeout:         'Location request timed out — please enter your location.',
  unavailable:     'Location is unavailable in this browser — please search manually.',
  'weather-service': 'Weather service is temporarily unavailable. Please try again.',
}

function ErrorMessage({ message, geoErrorType, onDismiss }) {
  const displayMessage = geoErrorType
    ? (GEO_ERROR_MESSAGES[geoErrorType] ?? message)
    : message

  if (!displayMessage) return null

  return (
    <div className="glass-card border-red-300/40 p-4" role="alert" aria-live="assertive">
      <p className="text-error text-sm">{displayMessage}</p>
      {onDismiss && (
        <button type="button" className="btn-secondary mt-3" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
