# Data Model: Initial Location from Geolocation

**Branch**: `003-initial-geolocation-source` | **Date**: 2026-03-24
**Source**: [spec.md](spec.md) + [research.md](research.md)

## Overview

This feature introduces no database schema changes. The model is runtime state managed in React hooks/components.

## Entity: InitialLocationAttempt

Represents first-load geolocation lifecycle.

Fields:
- `status`: `idle | requesting_permission | locating | success | denied | unavailable | timeout | failed | fallback`
- `startedAt`: number (epoch ms)
- `resolvedAt`: number | null
- `timeoutMs`: number (fixed at 5000; implementation constant: `INITIAL_GEOLOCATION_TIMEOUT_MS = 5000` in `src/utils/locationState.js`)
- `errorType`: `permission | unavailable | timeout | unknown | none`
- `errorMessage`: string | null

Validation rules:
- `timeoutMs` must equal 5000 for first-load attempt.
- `resolvedAt >= startedAt` when present.
- `status=success` implies `errorType=none` and `errorMessage=null`.

State transitions:
- `idle -> requesting_permission -> locating -> success`
- `idle -> requesting_permission -> denied -> fallback`
- `idle -> locating -> timeout -> fallback`
- `idle -> locating -> unavailable -> fallback`
- `idle -> locating -> failed -> fallback`
- `fallback -> success` allowed only when late result arrives and manual selection has not occurred.

## Runtime Wrapper: InitialVisitContext

React hook interface wrapping `InitialLocationAttempt` state for consumption by `App.jsx` and dependent components.

Exposed by `useInitialLocation.js` as: `{ context, markUserManuallySelected }`

| Property | Type | Description |
|----------|------|-------------|
| `context` | `InitialLocationAttempt` shape | Current first-load state including `attempted`, `granted`, `denied`, `timedOut`, `unavailable`, `userManuallySelected`, `coordinates`, `error` |
| `markUserManuallySelected()` | function | Sets `userManuallySelected = true` to guard against late-geolocation overrides (FR-008) |

Notes:
- `InitialVisitContext` is the hook return value; `InitialLocationAttempt` is the underlying domain entity.
- `context.coordinates` is populated on success and used by `useWeather` to trigger weather fetch without manual input (FR-003).
- Implementation constant: `INITIAL_GEOLOCATION_TIMEOUT_MS = 5000` (matches `timeoutMs` field).



Represents a location resolved from geolocation coordinates.

Fields:
- `latitude`: number
- `longitude`: number
- `label`: string
- `source`: `geolocation`
- `resolvedFrom`: `coordinates`

Validation rules:
- `latitude` in [-90, 90]
- `longitude` in [-180, 180]
- `label` non-empty string, fallback allowed (`Your Location` or equivalent)

Relationships:
- Used to request weather data and to create/update ActiveLocationContext.

## Entity: LocationSourcePolicy

Represents source-priority and guard logic during initial load.

Fields:
- `initialPriority`: `geolocation_first`
- `failureFallback`: `manual_only`
- `allowLateAutoApplyBeforeManual`: boolean
- `allowPostDenialRetryOnClick`: boolean

Validation rules:
- `initialPriority` must be `geolocation_first`.
- `failureFallback` must be `manual_only`.
- `allowLateAutoApplyBeforeManual` must be true per clarified requirement.
- `allowPostDenialRetryOnClick` must be true per clarified requirement.

## Entity: ActiveLocationContext

Represents the currently displayed weather context.

Fields:
- `mode`: `auto | manual`
- `location`: `CoordinateLocation | SearchLocation`
- `isAuthoritativeManualSelection`: boolean
- `setBy`: `initial_geolocation | late_geolocation | manual_search | recent_search`
- `updatedAt`: number

Validation rules:
- If `mode=manual`, `isAuthoritativeManualSelection` must be true.
- Once `isAuthoritativeManualSelection=true`, late geolocation results cannot override context.

State transitions:
- `auto(initial_geolocation)` on successful first-load geolocation.
- `manual(manual_search|recent_search)` on user selection.
- `auto(late_geolocation)` allowed only when no manual selection has occurred.

## Derived Invariants

- No geolocation failure path may trigger browser-locale or fixed-default weather auto-load.
- Manual search remains enabled in all non-success geolocation states.
- Each Use My Location click after denial starts a new geolocation attempt.
