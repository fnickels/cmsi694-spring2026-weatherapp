/**
 * locationState utility
 * Factory for InitialVisitContext — the state shape used by useInitialLocation.
 * Session-scoped: resets on every page refresh (no persistence).
 */

/**
 * Create a fresh InitialVisitContext with all flags at their initial values.
 * @param {Object} overrides - optional partial overrides for testing / pre-seeding
 * @returns {Object} InitialVisitContext
 */
export function createInitialVisitContext(overrides = {}) {
  return {
    attempted: false,        // true once geolocation was requested
    granted: false,          // true when permission allowed and coords received
    denied: false,           // true when user denied permission (code 1)
    timedOut: false,         // true when no response after 8s
    unavailable: false,      // true when browser doesn't support geolocation
    userManuallySelected: false, // true once user explicitly searches / selects
    coordinates: null,       // { latitude, longitude } | null
    error: null,             // 'denied' | 'timeout' | 'unavailable' | 'unknown' | null
    ...overrides,
  }
}
