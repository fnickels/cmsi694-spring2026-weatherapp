import { useCallback, useEffect, useState } from 'react'
import { fetchPointInspection } from '../services/forecast'
import { getOverlayConfig, resolveOverlayTileUrl } from '../services/overlays'
import { buildCoordinateCacheKey, getCachedValue, setCachedValue } from '../utils/requestCache'

const INSPECTION_CACHE_TTL_MS = 5 * 60 * 1000

function getInitialInspection() {
  return {
    status: 'idle',
    errorMessage: null,
    summary: null,
    value: null,
    unit: null,
    latitude: null,
    longitude: null,
  }
}

export function useMapOverlayState(location, isActive) {
  const [mapStatus, setMapStatus] = useState('idle')
  const [activeOverlay, setActiveOverlay] = useState('precipitation')
  const [overlayTileUrl, setOverlayTileUrl] = useState(null)
  const [overlayError, setOverlayError] = useState(null)
  const [isOverlayLoading, setIsOverlayLoading] = useState(false)
  const [inspection, setInspection] = useState(getInitialInspection)
  const [retryToken, setRetryToken] = useState(0)

  const retry = useCallback(() => {
    setRetryToken((current) => current + 1)
    setMapStatus('loading')
    setOverlayError(null)
  }, [])

  const handleMapReady = useCallback(() => {
    setMapStatus('ready')
  }, [])

  const handleMapError = useCallback((message) => {
    const nextStatus = message?.toLowerCase().includes('unsupported') ? 'unsupported' : 'error'
    setMapStatus(nextStatus)
    setOverlayError(message || 'Map could not be loaded.')
  }, [])

  const inspectPoint = useCallback(async ({ latitude, longitude }) => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setInspection({
        ...getInitialInspection(),
        status: 'error',
        errorMessage: 'Unable to inspect this map point.',
      })
      return
    }

    const cacheKey = buildCoordinateCacheKey('inspection', {
      latitude,
      longitude,
      overlayType: activeOverlay,
    })

    const cachedInspection = getCachedValue(cacheKey)
    if (cachedInspection) {
      setInspection(cachedInspection)
      return
    }

    setInspection({
      ...getInitialInspection(),
      status: 'loading',
      latitude,
      longitude,
    })

    try {
      const nextInspection = await fetchPointInspection(latitude, longitude, activeOverlay)
      setCachedValue(cacheKey, 'inspection', nextInspection, INSPECTION_CACHE_TTL_MS)
      setInspection(nextInspection)
    } catch (error) {
      setInspection({
        ...getInitialInspection(),
        status: 'error',
        latitude,
        longitude,
        errorMessage: error.message || 'Unable to inspect this map point.',
      })
    }
  }, [activeOverlay])

  useEffect(() => {
    if (!location) {
      setMapStatus('idle')
      setOverlayTileUrl(null)
      setOverlayError(null)
      setInspection(getInitialInspection())
      return
    }

    if (!isActive) {
      return
    }

    let isCancelled = false
    setMapStatus('loading')
    setIsOverlayLoading(true)
    setOverlayError(null)

    resolveOverlayTileUrl(activeOverlay)
      .then((tileUrl) => {
        if (isCancelled) return
        setOverlayTileUrl(tileUrl)
      })
      .catch((error) => {
        if (isCancelled) return
        setOverlayTileUrl(null)
        setOverlayError(error.message || 'Overlay data is unavailable.')
      })
      .finally(() => {
        if (isCancelled) return
        setIsOverlayLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [activeOverlay, isActive, location, retryToken])

  return {
    mapStatus,
    activeOverlay,
    overlayConfig: getOverlayConfig(activeOverlay),
    overlayTileUrl,
    overlayError,
    isOverlayLoading,
    inspection,
    setActiveOverlay,
    inspectPoint,
    handleMapReady,
    handleMapError,
    retry,
  }
}