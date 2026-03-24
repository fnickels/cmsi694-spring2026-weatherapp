# Contract: Geolocation Error and Fallback Handling

## Purpose

Standardize recoverable geolocation error behavior and messaging classes for first-load and retry attempts.

## Error Classes

- `permission_denied`: user/browser denies location access.
- `position_unavailable`: location cannot be determined.
- `timeout`: no geolocation result within 5 seconds.
- `unknown`: unexpected geolocation failure.

## Required Behavior by Error Class

| Error Class | Required Behavior |
|---|---|
| permission_denied | Show clear guidance, keep manual search enabled, allow retry via Use My Location click |
| position_unavailable | Show recoverable fallback guidance, keep manual search enabled |
| timeout | Transition at 5 seconds to fallback UI, keep manual search enabled |
| unknown | Show generic recoverable message, keep manual search enabled |

## Non-Negotiable Guarantees

1. No error class may block manual search interaction.
2. No error class may trigger auto-load from browser-locale or fixed default location.
3. Retry path remains available for user-initiated attempts.
4. Error messaging differentiates location-access problems from weather-fetch problems.

## Acceptance Mapping

- FR-005, FR-007, FR-009, FR-010, FR-012
