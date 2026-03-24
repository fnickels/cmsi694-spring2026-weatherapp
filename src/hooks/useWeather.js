/**
 * useWeather Hook
 * Orchestrates the flow: search query → geocoding → weather fetch
 * Manages disambiguation when multiple locations match
 */

import { useState, useCallback } from 'react'
import { reverseGeocodeLocation, searchLocations } from '../services/geocoding'
import { fetchWeather } from '../services/weather'

const GEOLOCATION_TIMEOUT_MS = 5000

export function useWeather() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentWeather, setCurrentWeather] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [disambiguationList, setDisambiguationList] = useState([])
  const [unitPreference, setUnitPreference] = useState('imperial')

  const buildDetectedLocation = useCallback(async ({ latitude, longitude }, source) => {
    try {
      const resolvedLocation = await reverseGeocodeLocation(latitude, longitude)

      if (resolvedLocation) {
        return source
          ? { ...resolvedLocation, source }
          : resolvedLocation
      }
    } catch {
      // Fallback to an approximate label so weather can still render.
    }

    return {
      id: Date.now(),
      name: 'Your Location',
      displayName: 'Location (approximate)',
      latitude,
      longitude,
      country: '',
      countryCode: '',
      admin1: null,
      approximate: true,
      ...(source ? { source } : {}),
    }
  }, [])

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
          const location = await buildDetectedLocation(
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            'manual'
          )

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
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError('Location information is unavailable. Try searching instead.')
        } else if (geoError.code === geoError.TIMEOUT) {
          setError('Geolocation request timed out. Please try again.')
        } else {
          setError('Could not determine your location. Try searching by city name.')
        }
        setIsLoading(false)
      },
      { timeout: GEOLOCATION_TIMEOUT_MS, enableHighAccuracy: true }
    )
  }, [buildDetectedLocation])

  /**
   * Auto-detect path: called by App when useInitialLocation resolves coordinates.
   * Resolves a human-readable label when possible and falls back to an approximate
   * location name so first-load weather still renders.
   */
  const fetchWeatherByCoordinates = useCallback(async ({ latitude, longitude }) => {
    setIsLoading(true)
    setError(null)
    setDisambiguationList([])
    setCurrentWeather(null)

    try {
      const location = await buildDetectedLocation(
        { latitude, longitude },
        'auto-detected'
      )

      setSelectedLocation(location)
      await fetchWeatherForLocation(location)
    } catch (err) {
      setError(err.message || 'Failed to fetch weather for your location')
      setIsLoading(false)
    }
  }, [buildDetectedLocation])

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
    fetchWeatherByCoordinates,
    toggleUnits,
    setUnitPreference,
  }
}
