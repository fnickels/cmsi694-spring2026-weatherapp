/**
 * GeolocationDeniedNotice
 * Shown when browser geolocation fails (denied, timeout, unavailable).
 * Directs users to manual location entry without a hard error (FR-004).
 */

const MESSAGES = {
  denied:      'Location access was denied — try entering a city name below.',
  timeout:     'Location request timed out — please enter your location below.',
  unavailable: 'Location is not available in this browser — please search manually.',
  unknown:     'Location could not be detected — please try searching by city name.',
}

function GeolocationDeniedNotice({ reason = 'denied' }) {
  return (
    <div
      className="glass-card p-4 border-orange-300/40"
      role="status"
      aria-live="polite"
      aria-label="Location detection notice"
    >
      <p className="text-sm text-orange-200">
        {MESSAGES[reason] ?? MESSAGES.denied}
      </p>
    </div>
  )
}

export default GeolocationDeniedNotice
