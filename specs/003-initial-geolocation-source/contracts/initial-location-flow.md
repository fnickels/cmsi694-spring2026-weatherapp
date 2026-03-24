# Contract: Initial Location Flow

## Purpose

Define user-visible behavior contract for initial weather location source selection on page load.

## Trigger

- Event: first page load in a new page visit.

## Inputs

- Browser geolocation capability availability.
- User permission response (allow/deny/dismiss).
- Geolocation result latency and success/failure.
- Whether manual selection has already occurred.

## Outputs

- Initial weather context source (`auto` or `manual`).
- UI state (`loading`, `fallback`, `error`, `resolved`).
- Retry behavior activation for Use My Location button.

## Contract Rules

1. Geolocation request is initiated immediately on first page load.
2. First-load geolocation timeout is 5 seconds.
3. On success before timeout, weather auto-loads from detected coordinates.
4. On denial/unavailable/failure/timeout, UI enters recoverable manual-search fallback.
5. On fallback, system does not auto-load weather from browser-locale or fixed defaults.
6. If late geolocation result arrives after fallback and no manual location was selected, auto-apply late result.
7. If manual location was selected, late geolocation cannot override active context.
8. Each user click on Use My Location after denial starts a new geolocation attempt.

## Acceptance Mapping

- FR-001, FR-002, FR-003, FR-005, FR-006, FR-008, FR-010, FR-011, FR-012
