import { useEffect, useMemo, useState } from 'react'
import SearchBar from './components/SearchBar'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorMessage from './components/ErrorMessage'
import WeatherCard from './components/WeatherCard'
import WeatherStats from './components/WeatherStats'
import LocationPicker from './components/LocationPicker'
import UnitToggle from './components/UnitToggle'
import RecentSearches from './components/RecentSearches'
import { useWeather } from './hooks/useWeather'
import { useRecentSearches } from './hooks/useRecentSearches'

function App() {
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
    toggleUnits,
    setUnitPreference,
  } = useWeather()

  const { searches, addSearch, clear, unit, setUnit } = useRecentSearches()

  useEffect(() => {
    if (unit) {
      setUnitPreference(unit)
    }
  }, [unit, setUnitPreference])

  useEffect(() => {
    if (currentWeather && selectedLocation) {
      addSearch(selectedLocation)
    }
  }, [currentWeather, selectedLocation, addSearch])

  const helperMessage = useMemo(() => {
    if (error && error.toLowerCase().includes('location')) return 'Location access failed. You can still search manually.'
    return ''
  }, [error])

  const onToggleUnit = () => {
    const next = unitPreference === 'imperial' ? 'metric' : 'imperial'
    toggleUnits()
    setUnit(next)
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Current Weather</h1>
          <UnitToggle unit={unitPreference} onToggle={onToggleUnit} />
        </header>

        <SearchBar
          onSearch={search}
          onUseMyLocation={requestGeolocation}
          isLoading={isLoading}
          geolocationLoading={false}
          helperMessage={helperMessage}
        />

        <RecentSearches searches={searches} onSelect={selectLocation} />

        {isLoading ? <LoadingSpinner /> : null}
        <ErrorMessage message={error} />
        <LocationPicker locations={disambiguationList} onSelect={selectLocation} />

        {currentWeather ? (
          <div className="space-y-3">
            <WeatherCard weather={currentWeather} location={selectedLocation} unit={unitPreference} />
            <WeatherStats weather={currentWeather} unit={unitPreference} />
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
