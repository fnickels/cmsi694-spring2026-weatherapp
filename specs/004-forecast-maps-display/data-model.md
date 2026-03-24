# Data Model: Weather Forecast & Maps Display

## Overview

The feature extends the existing selected-location weather context with lazy-loaded forecast and map-specific state. All persisted client data remains session-scoped.

## Entities

### 1. Location Context

- Purpose: Represents the currently selected place across Current, Forecast, and Map views.
- Fields:
  - `id`: string | number, unique identifier from geocoding result or generated fallback
  - `name`: string, short human-readable place name
  - `displayName`: string, formatted place label shown in the UI
  - `latitude`: number, valid range `-90..90`
  - `longitude`: number, valid range `-180..180`
  - `country`: string
  - `countryCode`: string
  - `admin1`: string | null
  - `source`: `manual` | `auto-detected` | `recent`
  - `approximate`: boolean
- Relationships:
  - One `Location Context` can own zero or one active `Forecast Bundle`
  - One `Location Context` can own zero or one active `Map View State`
- Validation rules:
  - Coordinates are required before forecast or map requests begin
  - Fallback labels are allowed when reverse geocoding fails

### 2. Forecast Bundle

- Purpose: Holds normalized forecast data for one selected location and timezone.
- Fields:
  - `locationKey`: string, derived from rounded coordinates and timezone
  - `timezone`: string
  - `fetchedAt`: ISO datetime string
  - `daily`: array of `Daily Forecast Period`
  - `hourly`: array of `Hourly Forecast Point`
  - `hourlyByDay`: record keyed by local date string
  - `defaultHourlyWindow`: array of next 24 `Hourly Forecast Point` items
  - `status`: `idle` | `loading` | `ready` | `error`
  - `errorMessage`: string | null
- Relationships:
  - Belongs to one `Location Context`
- Validation rules:
  - `daily.length` must be between 5 and 10 inclusive
  - `defaultHourlyWindow.length` must be between 1 and 24 inclusive
  - `status = ready` requires at least one daily entry

### 3. Daily Forecast Period

- Purpose: Represents one summarized forecast day in the daily strip.
- Fields:
  - `date`: ISO local date string
  - `label`: string, display-friendly day label such as `Tue`
  - `temperatureMinC`: number
  - `temperatureMaxC`: number
  - `precipitationProbabilityPct`: number `0..100`
  - `weatherCode`: number
  - `conditionLabel`: string
  - `conditionIcon`: string
  - `cloudCoverAvgPct`: number | null
- Relationships:
  - Part of one `Forecast Bundle`
- Validation rules:
  - Min temperature must be less than or equal to max temperature
  - Probability values clamp to `0..100`

### 4. Hourly Forecast Point

- Purpose: Represents one hour of forecast detail for the next 24 hours or a selected day.
- Fields:
  - `time`: ISO datetime string
  - `hourLabel`: string
  - `temperatureC`: number
  - `precipitationProbabilityPct`: number `0..100`
  - `cloudCoverPct`: number `0..100`
  - `weatherCode`: number
  - `conditionLabel`: string
  - `conditionIcon`: string
- Relationships:
  - Part of one `Forecast Bundle`
- Validation rules:
  - Hour labels must be derived from the same timezone as the bundle
  - Missing hourly values produce a failure state, not partial silent rendering

### 5. Map View State

- Purpose: Tracks map-specific UI state for the selected location.
- Fields:
  - `centerLatitude`: number
  - `centerLongitude`: number
  - `zoom`: number
  - `status`: `idle` | `loading` | `ready` | `error` | `unsupported`
  - `activeOverlay`: `precipitation` | `temperature` | `cloud-cover`
  - `loadedOverlays`: string[]
  - `legendVisible`: boolean
  - `errorMessage`: string | null
- Relationships:
  - Belongs to one `Location Context`
  - May reference one active `Overlay Inspection`
- Validation rules:
  - Base map must be ready before an overlay can enter `loadedOverlays`
  - Only one overlay is active at a time

### 6. Overlay Inspection

- Purpose: Stores the currently inspected point from a click/tap on the map.
- Fields:
  - `latitude`: number
  - `longitude`: number
  - `inspectedAt`: ISO datetime string
  - `overlayType`: `precipitation` | `temperature` | `cloud-cover`
  - `value`: number | string
  - `unit`: string
  - `summary`: string
  - `status`: `idle` | `loading` | `ready` | `error`
  - `errorMessage`: string | null
- Relationships:
  - Belongs to one `Map View State`
  - Value is resolved from an Open-Meteo point query for the clicked coordinates
- Validation rules:
  - Inspection is only allowed when the map view is ready
  - `status = ready` requires `value`, `unit`, and `summary`

### 7. Session Cache Entry

- Purpose: Represents a cacheable API response scoped to the current browser tab.
- Fields:
  - `cacheKey`: string
  - `kind`: `forecast` | `inspection`
  - `storedAt`: ISO datetime string
  - `expiresAt`: ISO datetime string
  - `payload`: object
- Relationships:
  - May store a serialized `Forecast Bundle` or point-inspection response
- Validation rules:
  - Expired entries must be ignored before use
  - Cache keys must include coordinates, data kind, and unit-sensitive dimensions when relevant

## State Transitions

### Forecast Bundle Status

- `idle -> loading`: user opens Forecast tab for a selected location with no fresh cache entry
- `loading -> ready`: normalized forecast response is available
- `loading -> error`: request fails, times out, or required data is missing
- `ready -> loading`: user switches to a different location or explicitly retries after staleness/failure

### Map View State Status

- `idle -> loading`: user opens Map tab and the map bundle begins loading
- `loading -> ready`: base map initializes successfully
- `loading -> unsupported`: browser cannot initialize the required map runtime
- `loading -> error`: map initialization fails or base tiles cannot be prepared sufficiently to render the view
- `ready -> loading`: user switches to a different location and the map recenters with fresh overlay state

### Overlay Inspection Status

- `idle -> loading`: user clicks/taps the map while an overlay is active
- `loading -> ready`: point query returns data for the selected overlay type
- `loading -> error`: point query fails or times out
- `ready -> loading`: user inspects a new point or changes overlay type

## Derived Views

- `ResultsView`: active tab among `current`, `forecast`, and `map`
- `SelectedForecastDay`: date key used to choose which hourly slice is shown in the Forecast view
- `DisplayUnits`: derived from the existing app-wide unit preference and applied to forecast values and legends without requiring duplicate raw storage in multiple units