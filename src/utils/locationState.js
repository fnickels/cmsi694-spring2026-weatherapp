/**
 * Shared state primitives for first-load geolocation orchestration.
 */

export const INITIAL_GEOLOCATION_TIMEOUT_MS = 5000

export const LOCATION_ERROR_TYPES = {
  DENIED: 'denied',
  TIMEOUT: 'timeout',
  UNAVAILABLE: 'unavailable',
  UNKNOWN: 'unknown',
}

/**
 * Create a fresh InitialVisitContext with all flags at their initial values.
 * @param {Object} overrides optional partial overrides for testing / pre-seeding
 */
export function createInitialVisitContext(overrides = {}) {
  return {
    attempted: false,
    granted: false,
    denied: false,
    timedOut: false,
    unavailable: false,
    userManuallySelected: false,
    coordinates: null,
    error: null,
    ...overrides,
  }
}

/**
 * Apply a standardized status transition to InitialVisitContext.
 * @param {Object} state current context
 * @param {string} status one of: attempted, granted, denied, timeout, unavailable, failed, manual
 * @param {Object} payload optional transition data
 */
export function transitionInitialVisitContext(state, status, payload = {}) {
  switch (status) {
    case 'attempted':
      return {
        ...state,
        attempted: true,
      }
    case 'granted':
      return {
        ...state,
        granted: true,
        denied: false,
        timedOut: false,
        unavailable: false,
        error: null,
        coordinates: payload.coordinates ?? state.coordinates,
      }
    case 'denied':
      return {
        ...state,
        denied: true,
        error: LOCATION_ERROR_TYPES.DENIED,
      }
    case 'timeout':
      return {
        ...state,
        timedOut: true,
        error: LOCATION_ERROR_TYPES.TIMEOUT,
      }
    case 'unavailable':
      return {
        ...state,
        unavailable: true,
        error: LOCATION_ERROR_TYPES.UNAVAILABLE,
      }
    case 'failed':
      return {
        ...state,
        error: payload.error ?? LOCATION_ERROR_TYPES.UNKNOWN,
      }
    case 'manual':
      return {
        ...state,
        userManuallySelected: true,
      }
    default:
      return state
  }
}
