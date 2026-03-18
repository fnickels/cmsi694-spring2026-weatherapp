/**
 * useWeather Hook
 * Orchestrates the flow: search query → geocoding → weather fetch
 * Manages disambiguation when multiple locations match
 */

import { useState, useCallback } from 'react'
import { searchLocations } from '../services/geocoding'
import { fetchWeather } from '../services/weather'

export function useWeather() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentWeather, setCurrentWeather] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [disambiguationList, setDisambiguationList] = useState([])
  const [unitPreference, setUnitPreference] = useState('imperial')

  const search = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setError('Please enter a location name')
      return
    }

    setIsLoading(true)
    setError(null)
    setCurrentWeather(null)
    setSelectedLocation(null)
    setDisambiguationList([])

    try {
      // Step 1: Search for locations
      const locations = await searchLocations(query)

      if (locations.length === 0) {
        setError('Location not found. Try a different search.')
        setIsLoading(false)
        return
      }

      // Step 2a: If single result, fetch weather immediately
      if (locations.length === 1) {
        const location = locations[0]
        setSelectedLocation(location)
        await fetchWeatherForLocation(location)
      } else {
        // Step 2b: If multiple results, show disambiguation list
        setDisambiguationList(locations)
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while searching for the location'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [])

  const selectLocation = useCallback(async (location) => {
    setIsLoading(true)
    setError(null)
    setCurrentWeather(null)
    setDisambiguationList([])

    try {
      setSelectedLocation(location)
      await fetchWeatherForLocation(location)
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while fetching weather'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [])

  const requestGeolocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in your browser')
      return
    }

    setIsLoading(true)
    setError(null)
    setDisambiguationList([])

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
          const cityGuess = timezone.split('/').pop()?.replaceAll('_', ' ') || 'Your Location'
          const location = {
            id: Date.now(),
            name: cityGuess,
            displayName: cityGuess,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            country: '',
            countryCode: '',
            admin1: null,
          }
          setSelectedLocation(location)
          await fetchWeatherForLocation(location)
        } catch (err) {
          setError(err.message || 'Failed to fetch weather for your location')
          setIsLoading(false)
        }
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Please enable location access in your browser settings')
        } else {
          setError('Could not determine your location. Try searching by city name.')
        }
        setIsLoading(false)
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }, [])

  const toggleUnits = useCallback(() => {
    setUnitPreference((prev) => (prev === 'imperial' ? 'metric' : 'imperial'))
  }, [])

  const fetchWeatherForLocation = async (location) => {
    try {
      // Step 3: Fetch weather for the selected location
      // Default to metric; conversion to imperial handled by display layer
      const weather = await fetchWeather(
        location.latitude,
        location.longitude,
        'metric'
      )

      // Associate weather with location
      weather.locationId = location.id

      setCurrentWeather(weather)
      setError(null)
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while fetching weather'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
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
  }
}
