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

State names match canonical constants in `src/utils/locationState.js` and `data-model.md` (`InitialLocationAttempt.status`).

| Case | Initial State | Trigger | Expected Transition | Expected Outcome |
|---|---|---|---|---|
| S1 | idle | first load + geolocation success < 5s | requesting_permission → locating → success | auto weather loads from coordinates |
| S2 | idle | first load + permission denied | requesting_permission → denied → fallback | fallback notice + manual search available |
| S3 | idle | first load + no callback until 5s | requesting_permission → locating → timeout → fallback | fallback notice + manual search available |
| S4 | idle | first load + unavailable error | requesting_permission → locating → unavailable → fallback | fallback notice + manual search available |
| S5 | fallback (timeout) | late success, no manual selection | fallback → success | late result auto-applies |
| S6 | fallback (timeout) | manual search then late success | fallback → manual (authoritative) | late result ignored |
| S7 | denied | user clicks Use My Location | denied → requesting_permission | retry geolocation request starts |

## Acceptance Mapping

- FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-010, FR-011, FR-012

| FR | Contract Rule(s) |
|----|------------------|
| FR-004 (no browser-locale as primary) | Rule 5 |
| FR-007 (manual search always available) | Rule 4; guaranteed across all fallback states |
