import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SearchBar from './components/SearchBar'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorMessage from './components/ErrorMessage'
import WeatherCard from './components/WeatherCard'
import WeatherStats from './components/WeatherStats'
import InitialLoadingIndicator from './components/InitialLoadingIndicator'
import LocationPicker from './components/LocationPicker'
import UnitToggle from './components/UnitToggle'
import RecentSearches from './components/RecentSearches'
import GeolocationDeniedNotice from './components/GeolocationDeniedNotice'
import ResultsViewTabs from './components/ResultsViewTabs'
import ForecastPanel from './components/ForecastPanel'
import { useWeather } from './hooks/useWeather'
import { useRecentSearches } from './hooks/useRecentSearches'
import { useInitialLocation } from './hooks/useInitialLocation'

const WeatherMapPanel = lazy(() => import('./components/WeatherMapPanel'))

function App() {
  const [activeView, setActiveView] = useState('current')
  const {
    isLoading,
    error,
    currentWeather,
    selectedLocation,
    disambiguationList,
    unitPreference,
    search,
    selectLocation,
    requestGeolocation,
    fetchWeatherByCoordinates,
    toggleUnits,
    setUnitPreference,
  } = useWeather()

  const { searches, addSearch, clear, unit, setUnit } = useRecentSearches()
  const { context: geoContext, markUserManuallySelected } = useInitialLocation()

  // Guard: ensure auto-detect weather fetch fires at most once per session
  const autoFetchedRef = useRef(false)

  // Sync saved unit preference from session storage
  useEffect(() => {
    if (unit) {
      setUnitPreference(unit)
    }
  }, [unit, setUnitPreference])

  // Track recent searches
  useEffect(() => {
    if (currentWeather && selectedLocation) {
      addSearch(selectedLocation)
    }
  }, [currentWeather, selectedLocation, addSearch])

  // Auto-detect: when coordinates arrive and user has not manually chosen a location,
  // fetch weather immediately (FR-001, FR-002). Guard prevents double-fire (FR-007).
  useEffect(() => {
    if (
      !autoFetchedRef.current &&
      geoContext.granted &&
      geoContext.coordinates &&
      !geoContext.userManuallySelected
    ) {
      autoFetchedRef.current = true
      fetchWeatherByCoordinates(geoContext.coordinates)
    }
  }, [geoContext.granted, geoContext.coordinates, geoContext.userManuallySelected, fetchWeatherByCoordinates])

  // True while geolocation is still pending (no outcome yet)
  const initialGeoInProgress =
    geoContext.attempted &&
    !geoContext.granted &&
    !geoContext.denied &&
    !geoContext.timedOut &&
    !geoContext.unavailable

  // Show fallback notice when geo failed and no weather has loaded yet
  const showGeoFailureNotice =
    geoContext.attempted &&
    (geoContext.denied || geoContext.timedOut || geoContext.unavailable) &&
    !currentWeather

  const searchLoading = isLoading && selectedLocation?.source !== 'auto-detected'
  const geolocationLoading = initialGeoInProgress || (isLoading && !selectedLocation && !currentWeather)

  const helperMessage = useMemo(() => {
    if (error && error.toLowerCase().includes('location')) return 'Location access failed. You can still search manually.'
    return ''
  }, [error])

  const onToggleUnit = () => {
    const next = unitPreference === 'imperial' ? 'metric' : 'imperial'
    toggleUnits()
    setUnit(next)
  }

  // Wrap search/select to mark manual selection and prevent auto-override (FR-007)
  const handleManualSearch = useCallback((query) => {
    markUserManuallySelected()
    search(query)
  }, [markUserManuallySelected, search])

  const handleSelectLocation = useCallback((location) => {
    markUserManuallySelected()
    selectLocation(location)
  }, [markUserManuallySelected, selectLocation])

  return (
    <div className="min-h-screen bg-gradient-dark p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Current Weather</h1>
          <UnitToggle unit={unitPreference} onToggle={onToggleUnit} />
        </header>

        {/* FR-005: SearchBar is never disabled by geolocation state */}
        <SearchBar
          onSearch={handleManualSearch}
          onUseMyLocation={requestGeolocation}
          searchLoading={searchLoading}
          geolocationLoading={geolocationLoading}
          helperMessage={helperMessage}
        />

        <RecentSearches searches={searches} onSelect={handleSelectLocation} />

        {/* Initial geo detection in progress — separate from weather loading (FR-009) */}
        {initialGeoInProgress && !isLoading ? (
          <InitialLoadingIndicator />
        ) : null}

        {/* Geo failed: soft notice — not a hard error, search still available (FR-004) */}
        {showGeoFailureNotice ? (
          <GeolocationDeniedNotice reason={geoContext.error ?? 'denied'} />
        ) : null}

        {isLoading ? <LoadingSpinner /> : null}
        <ErrorMessage message={error} />
        <LocationPicker locations={disambiguationList} onSelect={handleSelectLocation} />

        {currentWeather ? (
          <div className="space-y-3">
            <ResultsViewTabs
              activeView={activeView}
              onChange={setActiveView}
              availableViews={['current', 'forecast', 'map']}
            />

            {activeView === 'current' ? (
              <div
                id="results-panel-current"
                role="tabpanel"
                aria-labelledby="results-tab-current"
                className="space-y-3"
              >
                <WeatherCard
                  weather={currentWeather}
                  location={selectedLocation}
                  unit={unitPreference}
                  source={selectedLocation?.source}
                />
                <WeatherStats weather={currentWeather} unit={unitPreference} />
              </div>
            ) : null}

            {activeView === 'forecast' ? (
              <ForecastPanel
                location={selectedLocation}
                unitPreference={unitPreference}
                isActive={activeView === 'forecast'}
              />
            ) : null}

            {activeView === 'map' ? (
              <Suspense fallback={<LoadingSpinner message="Loading map view..." />}>
                <WeatherMapPanel
                  location={selectedLocation}
                  unitPreference={unitPreference}
                  isActive={activeView === 'map'}
                />
              </Suspense>
            ) : null}
          </div>
        ) : null}

        {searches.length > 0 ? (
          <div className="text-right">
            <button type="button" className="text-xs text-gray-300 underline" onClick={clear}>
              Clear recent
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default App
