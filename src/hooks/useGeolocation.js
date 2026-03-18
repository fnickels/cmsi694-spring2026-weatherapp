/**
 * useGeolocation Hook
 * Wraps browser Geolocation API to get user's current coordinates
 */

import { useState, useCallback, useEffect } from 'react'

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

    // 8-second timeout for geolocation permission + API call per spec
    const timeoutId = setTimeout(() => {
      setError('Geolocation request took too long. Please try again.')
      setIsLoading(false)
    }, 8000)

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
        // Map geolocation error codes to user-friendly messages
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Please enable location access in your browser to use geolocation')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Try searching instead.')
            break
          case err.TIMEOUT:
            setError('Geolocation request timed out. Please try again.')
            break
          default:
            setError('An error occurred while getting your location')
        }
        setIsLoading(false)
      },
      {
        timeout: 8000,
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
