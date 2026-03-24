/**
 * useInitialLocation Hook
 *
 * Manages first-visit browser geolocation detection (FR-001).
 * Fires once on mount; 8-second timeout per spec.
 * Session-scoped: resets on page refresh.
 *
 * InitialVisitContext shape: { attempted, granted, denied, timedOut,
 *   unavailable, userManuallySelected, coordinates, error }
 */

import { useEffect, useRef, useState } from 'react'
import { createInitialVisitContext } from '../utils/locationState'

const GEOLOCATION_TIMEOUT_MS = 8000

export function useInitialLocation() {
  const [context, setContext] = useState(() => createInitialVisitContext())
  const timerRef = useRef(null)
  const triggeredRef = useRef(false)

  // Clean up any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Attempt geolocation exactly once on first mount (FR-001)
  useEffect(() => {
    if (triggeredRef.current) return
    triggeredRef.current = true

    // Browser support check — skip auto-detect if unavailable (FR-001)
    if (!navigator.geolocation) {
      setContext(ctx => ({ ...ctx, attempted: true, unavailable: true }))
      return
    }

    setContext(ctx => ({ ...ctx, attempted: true }))

    // 8-second timeout guard (FR-001): if neither success nor error fires in time,
    // treat as timeout failure and fall back to manual search
    timerRef.current = setTimeout(() => {
      setContext(ctx => {
        if (ctx.granted || ctx.denied || ctx.userManuallySelected) return ctx // already resolved — no-op
        return { ...ctx, timedOut: true, error: 'timeout' }
      })
    }, GEOLOCATION_TIMEOUT_MS)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timerRef.current)
        setContext(ctx => ({
          ...(ctx.userManuallySelected
            ? ctx
            : {
                ...ctx,
                granted: true,
                coordinates: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
              }),
        }))
      },
      (err) => {
        clearTimeout(timerRef.current)
        // Map GeolocationPositionError codes to named types
        let errorType = 'unknown'
        if (err.code === 1) errorType = 'denied'      // PERMISSION_DENIED
        else if (err.code === 2) errorType = 'unavailable' // POSITION_UNAVAILABLE
        else if (err.code === 3) errorType = 'timeout'     // TIMEOUT
        setContext(ctx => ({
          ...(ctx.userManuallySelected
            ? ctx
            : {
                ...ctx,
                denied: errorType === 'denied',
                unavailable: errorType === 'unavailable',
                timedOut: errorType === 'timeout' || ctx.timedOut,
                error: errorType,
              }),
        }))
      },
      { timeout: 8000, enableHighAccuracy: false, maximumAge: 0 }
    )
  }, [])

  /**
   * Call when the user explicitly searches or selects a location.
   * Prevents auto-detection from overriding the user's choice (FR-007).
   */
  const markUserManuallySelected = () => {
    setContext(ctx => ({ ...ctx, userManuallySelected: true }))
  }

  return { context, markUserManuallySelected }
}
