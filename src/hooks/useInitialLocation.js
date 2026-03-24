/**
 * useInitialLocation Hook
 *
 * Manages first-visit browser geolocation detection (FR-001).
 * Fires once on mount; 5-second timeout per spec.
 * Session-scoped: resets on page refresh.
 *
 * InitialVisitContext shape: { attempted, granted, denied, timedOut,
 *   unavailable, userManuallySelected, coordinates, error }
 */

import { useEffect, useRef, useState } from 'react'
import {
  createInitialVisitContext,
  INITIAL_GEOLOCATION_TIMEOUT_MS,
  LOCATION_ERROR_TYPES,
  transitionInitialVisitContext,
} from '../utils/locationState'

export function useInitialLocation() {
  const [context, setContext] = useState(() => createInitialVisitContext())
  const timerRef = useRef(null)
  const triggeredRef = useRef(false)

  // Clean up any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      triggeredRef.current = false
    }
  }, [])

  // Attempt geolocation exactly once on first mount (FR-001)
  useEffect(() => {
    if (triggeredRef.current) return
    triggeredRef.current = true

    // Browser support check — skip auto-detect if unavailable (FR-001)
    if (!navigator.geolocation) {
      setContext((ctx) => transitionInitialVisitContext(
        transitionInitialVisitContext(ctx, 'attempted'),
        'unavailable'
      ))
      return
    }

    setContext((ctx) => transitionInitialVisitContext(ctx, 'attempted'))

    // 5-second timeout guard (FR-001): if neither success nor error fires in time,
    // treat as timeout failure and fall back to manual search
    timerRef.current = setTimeout(() => {
      setContext((ctx) => {
        if (ctx.granted || ctx.denied || ctx.userManuallySelected) return ctx // already resolved — no-op
        return transitionInitialVisitContext(ctx, 'timeout')
      })
    }, INITIAL_GEOLOCATION_TIMEOUT_MS)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timerRef.current)
        setContext((ctx) => {
          if (ctx.userManuallySelected) return ctx

          return transitionInitialVisitContext(ctx, 'granted', {
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          })
        })
      },
      (err) => {
        clearTimeout(timerRef.current)
        let errorType = LOCATION_ERROR_TYPES.UNKNOWN
        if (err.code === 1) errorType = LOCATION_ERROR_TYPES.DENIED
        else if (err.code === 2) errorType = LOCATION_ERROR_TYPES.UNAVAILABLE
        else if (err.code === 3) errorType = LOCATION_ERROR_TYPES.TIMEOUT

        setContext((ctx) => {
          if (ctx.userManuallySelected) return ctx

          if (errorType === LOCATION_ERROR_TYPES.DENIED) {
            return transitionInitialVisitContext(ctx, 'denied')
          }
          if (errorType === LOCATION_ERROR_TYPES.UNAVAILABLE) {
            return transitionInitialVisitContext(ctx, 'unavailable')
          }
          if (errorType === LOCATION_ERROR_TYPES.TIMEOUT) {
            return transitionInitialVisitContext(ctx, 'timeout')
          }

          return transitionInitialVisitContext(ctx, 'failed', { error: errorType })
        })
      },
      { timeout: INITIAL_GEOLOCATION_TIMEOUT_MS, enableHighAccuracy: false, maximumAge: 0 }
    )
  }, [])

  /**
   * Call when the user explicitly searches or selects a location.
   * Prevents auto-detection from overriding the user's choice (FR-007).
   */
  const markUserManuallySelected = () => {
    setContext((ctx) => transitionInitialVisitContext(ctx, 'manual'))
  }

  return { context, markUserManuallySelected }
}
