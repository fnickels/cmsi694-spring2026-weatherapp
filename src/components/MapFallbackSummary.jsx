function MapFallbackSummary({ location, activeOverlay, errorMessage, inspection }) {
  return (
    <section className="glass-card p-5 space-y-3" aria-label="Map fallback summary">
      <div>
        <h3 className="text-lg font-semibold text-white">Map unavailable</h3>
        <p className="text-sm text-gray-200">{errorMessage || 'The interactive map could not be displayed in this environment.'}</p>
      </div>

      {location?.displayName ? (
        <p className="text-sm text-gray-300">Selected location: {location.displayName}</p>
      ) : null}

      <p className="text-sm text-gray-300">Active overlay: {activeOverlay}</p>

      <p className="text-xs text-gray-300">
        Data sources: OpenStreetMap, RainViewer, NASA GIBS, and Open-Meteo.
      </p>

      {inspection?.summary ? (
        <p className="text-sm text-sky-200">Latest inspected value: {inspection.summary}</p>
      ) : null}
    </section>
  )
}

export default MapFallbackSummary