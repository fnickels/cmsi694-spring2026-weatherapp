import ErrorMessage from './ErrorMessage'
import LoadingSpinner from './LoadingSpinner'
import MapFallbackSummary from './MapFallbackSummary'
import WeatherLayerLegend from './WeatherLayerLegend'
import WeatherMapCanvas from './WeatherMapCanvas'
import { useMapOverlayState } from '../hooks/useMapOverlayState'

const OVERLAY_OPTIONS = [
  { value: 'precipitation', label: 'Precipitation' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'cloud-cover', label: 'Cloud Cover' },
]

function WeatherMapPanel({ location, unitPreference, isActive }) {
  const {
    mapStatus,
    activeOverlay,
    overlayConfig,
    overlayTileUrl,
    overlayError,
    isOverlayLoading,
    inspection,
    setActiveOverlay,
    inspectPoint,
    handleMapReady,
    handleMapError,
    retry,
  } = useMapOverlayState(location, isActive)

  if (mapStatus === 'error' || mapStatus === 'unsupported') {
    return (
      <div className="space-y-3">
        <MapFallbackSummary
          location={location}
          activeOverlay={overlayConfig.title}
          errorMessage={overlayError}
          inspection={inspection}
        />
        <button type="button" className="btn-secondary" onClick={retry}>
          Retry map
        </button>
      </div>
    )
  }

  return (
    <section
      id="results-panel-map"
      role="tabpanel"
      aria-labelledby="results-tab-map"
      className="space-y-4"
    >
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Regional Weather Map</h3>
          <p className="text-xs text-gray-300">Data sources: OpenStreetMap, RainViewer, NASA GIBS, Open-Meteo</p>
        </div>

        <div className="flex flex-wrap items-center gap-2" aria-label="Map overlay controls">
          {OVERLAY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={activeOverlay === option.value ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveOverlay(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {mapStatus === 'loading' ? <LoadingSpinner message="Loading map view..." /> : null}
        {overlayError ? <ErrorMessage message={overlayError} /> : null}

        <WeatherMapCanvas
          center={[location.latitude, location.longitude]}
          zoom={8}
          activeOverlay={activeOverlay}
          overlayTileUrl={overlayTileUrl}
          onReady={handleMapReady}
          onError={handleMapError}
          onInspectPoint={inspectPoint}
        />

        {isOverlayLoading ? <p className="text-xs text-gray-300">Refreshing overlay imagery...</p> : null}

        <p className="text-xs text-gray-300">
          Map attribution: OpenStreetMap contributors, RainViewer, and NASA GIBS imagery.
        </p>
      </div>

      <WeatherLayerLegend
        overlayType={activeOverlay}
        legendItems={overlayConfig.legendItems}
        unitPreference={unitPreference}
      />

      <section className="glass-card p-4 space-y-2" aria-label="Map inspection summary">
        <h3 className="text-sm font-semibold text-white">Inspected value</h3>
        {inspection.status === 'loading' ? <p className="text-sm text-gray-200">Inspecting selected map point...</p> : null}
        {inspection.status === 'error' ? <p className="text-sm text-error">{inspection.errorMessage}</p> : null}
        {inspection.status === 'ready' ? <p className="text-sm text-sky-200">{inspection.summary}</p> : null}
        {inspection.status === 'idle' ? <p className="text-sm text-gray-300">Click or tap the map to inspect the active overlay.</p> : null}
      </section>
    </section>
  )
}

export default WeatherMapPanel