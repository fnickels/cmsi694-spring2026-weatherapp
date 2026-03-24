import { useCallback, useEffect, useState } from 'react'
import { fetchForecast } from '../services/forecast'
import { buildCoordinateCacheKey, getCachedValue, setCachedValue } from '../utils/requestCache'

const FORECAST_CACHE_TTL_MS = 15 * 60 * 1000
const pendingForecastRequests = new Map()

function getInitialState() {
  return {
    forecastBundle: null,
    isLoading: false,
    errorMessage: null,
    selectedDay: null,
  }
}

export function useForecastData(location, enabled) {
  const [state, setState] = useState(getInitialState)
  const [retryToken, setRetryToken] = useState(0)

  const selectDay = useCallback((dayKey) => {
    setState((current) => ({ ...current, selectedDay: dayKey }))
  }, [])

  const retry = useCallback(() => {
    setRetryToken((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!location) {
      setState(getInitialState())
      return
    }

    if (!enabled) {
      setState((current) => ({
        ...current,
        errorMessage: null,
      }))
      return
    }

    let isCancelled = false
    const cacheKey = buildCoordinateCacheKey('forecast', {
      latitude: location.latitude,
      longitude: location.longitude,
    })

    const cachedBundle = getCachedValue(cacheKey)
    if (cachedBundle) {
      setState({
        forecastBundle: cachedBundle,
        isLoading: false,
        errorMessage: null,
        selectedDay: cachedBundle.daily[0]?.date ?? null,
      })
      return
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      errorMessage: null,
    }))

    const requestPromise = pendingForecastRequests.get(cacheKey) ?? fetchForecast(location.latitude, location.longitude)

    if (!pendingForecastRequests.has(cacheKey)) {
      pendingForecastRequests.set(cacheKey, requestPromise)
    }

    requestPromise
      .then((bundle) => {
        if (isCancelled) return

        setCachedValue(cacheKey, 'forecast', bundle, FORECAST_CACHE_TTL_MS)
        setState({
          forecastBundle: bundle,
          isLoading: false,
          errorMessage: null,
          selectedDay: bundle.daily[0]?.date ?? null,
        })
      })
      .catch((error) => {
        if (isCancelled) return

        setState({
          forecastBundle: null,
          isLoading: false,
          errorMessage: error.message || 'Forecast data is unavailable right now.',
          selectedDay: null,
        })
      })
      .finally(() => {
        pendingForecastRequests.delete(cacheKey)
      })

    return () => {
      isCancelled = true
    }
  }, [enabled, location, retryToken])

  return {
    ...state,
    selectDay,
    retry,
  }
}