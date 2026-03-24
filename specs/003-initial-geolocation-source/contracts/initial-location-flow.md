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

## State-Machine Test Matrix

| Case | Initial State | Trigger | Expected Transition | Expected Outcome |
|---|---|---|---|---|
| S1 | idle | first load + geolocation success < 5s | attempted -> granted | auto weather loads from coordinates |
| S2 | idle | first load + permission denied | attempted -> denied | fallback notice + manual search available |
| S3 | idle | first load + no callback until 5s | attempted -> timeout | fallback notice + manual search available |
| S4 | idle | first load + unavailable error | attempted -> unavailable | fallback notice + manual search available |
| S5 | timeout fallback | late success, no manual selection | timeout -> granted | late result auto-applies |
| S6 | timeout fallback | manual search then late success | timeout -> manual (authoritative) | late result ignored |
| S7 | denied | user clicks Use My Location | denied -> attempted | retry geolocation request starts |

## Acceptance Mapping

- FR-001, FR-002, FR-003, FR-005, FR-006, FR-008, FR-010, FR-011, FR-012
