/**
 * useGeolocation Hook
 * Wraps browser Geolocation API to get user's current coordinates
 */

import { useState, useCallback } from 'react'

const GEOLOCATION_TIMEOUT_MS = 5000

export function classifyGeolocationError(errorCode) {
  if (errorCode === 1) return 'denied'
  if (errorCode === 2) return 'unavailable'
  if (errorCode === 3) return 'timeout'
  return 'unknown'
}

export function useGeolocation() {
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const requestLocation = useCallback(() => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in your browser')
      return
    }

    setIsLoading(true)
    setError(null)
    setLatitude(null)
    setLongitude(null)

    // 5-second timeout for geolocation permission + API call per spec
    const timeoutId = setTimeout(() => {
      setError('Geolocation request took too long. Please try again.')
      setIsLoading(false)
    }, GEOLOCATION_TIMEOUT_MS)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setError(null)
        setIsLoading(false)
      },
      (err) => {
        clearTimeout(timeoutId)
        switch (classifyGeolocationError(err.code)) {
          case 'denied':
            setError('Please enable location access in your browser to use geolocation')
            break
          case 'unavailable':
            setError('Location information is unavailable. Try searching instead.')
            break
          case 'timeout':
            setError('Geolocation request timed out. Please try again.')
            break
          default:
            setError('An error occurred while getting your location')
        }
        setIsLoading(false)
      },
      {
        timeout: GEOLOCATION_TIMEOUT_MS,
        enableHighAccuracy: true,
        maximumAge: 0
      }
    )
  }, [])

  return {
    latitude,
    longitude,
    error,
    isLoading,
    requestLocation
  }
}
