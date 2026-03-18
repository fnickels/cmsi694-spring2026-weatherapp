# Data Model: Location-Based Current Weather App

**Branch**: `001-location-weather-app` | **Date**: 2026-03-17  
**Source**: [spec.md](spec.md) Key Entities + [research.md](research.md)

---

## Overview

This is a fully client-side application. There is no database. All entities below are runtime JavaScript objects held in component/hook state or `sessionStorage`. The shapes are defined here for consistency across implementation.

---

## Entity: Location

**What it represents**: A resolved geographic place returned by the Open-Meteo Geocoding API.

```ts
{
  id: number            // Open-Meteo geocoding result ID (unique per place)
  name: string          // City/place name (e.g., "Chicago")
  latitude: number      // Decimal degrees
  longitude: number     // Decimal degrees
  country: string       // Full country name (e.g., "United States")
  countryCode: string   // ISO 3166-1 alpha-2 (e.g., "US")
  admin1: string | null // State/Province/Region (e.g., "Illinois") — null if unavailable
  displayName: string   // Computed: "{name}, {admin1}, {country}" or "{name}, {country}"
}
```

**Validation rules**:
- `latitude` must be a finite number in [-90, 90]
- `longitude` must be a finite number in [-180, 180]
- `name` must be a non-empty string
- `displayName` is always computed from the above — never stored in sessionStorage independently

**State transitions**:
```
null
  → (user submits search / geolocation completes) → Disambiguating (list of Location[])
  → (user selects from list OR single result) → Selected (single Location)
  → (user performs new search) → null
```

---

## Entity: CurrentWeather

**What it represents**: A snapshot of weather conditions at a specific Location at a specific time, as returned by the Open-Meteo Weather API.

```ts
{
  locationId: number       // Foreign key to Location.id (used for cache keying)
  observationTime: string  // ISO 8601 datetime string (e.g., "2026-03-17T14:00")
  temperatureC: number     // Temperature in Celsius (always stored in Celsius; converted for display)
  feelsLikeC: number       // Apparent temperature in Celsius
  humidity: number         // Relative humidity percentage (0–100)
  windSpeedKph: number     // Wind speed in km/h (always stored metric; converted for display)
  windDirectionDeg: number // Wind direction in degrees (0–360, meteorological)
  windDirectionLabel: string // Computed: cardinal/intercardinal label (e.g., "NW")
  visibilityM: number      // Visibility in metres (always stored in metres; converted for display)
  weatherCode: number      // WMO interpretation code
  conditionLabel: string   // Derived from wmoConditions lookup
  conditionIcon: string    // Icon ID string from wmoConditions lookup (e.g., "partly-cloudy-day")
}
```

**Storage note**: `CurrentWeather` is held only in React hook state — it is NOT persisted to `sessionStorage`. Navigating away or refreshing clears it. `RecentSearch` holds only the `Location` reference, not the weather data.

**Validation rules**:
- `humidity` in [0, 100]
- `windDirectionDeg` in [0, 360]
- `weatherCode` must map to a known WMO bucket; unknown codes fall back to conditionLabel "Unknown" and icon "unknown"
- `visibilityM` ≥ 0

**Wind direction label computation**:

| Degrees | Label |
|---------|-------|
| 337.5–360 or 0–22.5 | N |
| 22.5–67.5 | NE |
| 67.5–112.5 | E |
| 112.5–157.5 | SE |
| 157.5–202.5 | S |
| 202.5–247.5 | SW |
| 247.5–292.5 | W |
| 292.5–337.5 | NW |

---

## Entity: UnitPreference

**What it represents**: The user's choice of display unit system for the current session.

```ts
{
  system: "imperial" | "metric"
}
```

**Defaults**: `"imperial"` on first load (as specified in Assumptions).

**Persistence**: Written to and read from `sessionStorage` under key `"weatherapp.unitPreference"`. Cleared automatically when the browser session ends.

**Display conversion table**:

| Stored field | imperial display | metric display |
|---|---|---|
| `temperatureC` | `(C × 9/5) + 32` °F | `C` °C |
| `feelsLikeC` | same conversion | same |
| `windSpeedKph` | `kph × 0.621371` mph | `kph` km/h |
| `visibilityM` | `m / 1609.344` mi | `m / 1000` km |

> Humidity and wind direction are unit-agnostic — displayed as-is regardless of preference.

---

## Entity: RecentSearch

**What it represents**: A session-stored record of a Location the user has previously searched and selected.

```ts
{
  id: number         // Location.id — used as stable key
  displayName: string  // Location.displayName (snapshot at time of search)
  latitude: number
  longitude: number
  searchedAt: number   // Unix timestamp (Date.now()) — used to sort most-recent first
}
```

**Persistence**: Written to and read from `sessionStorage` under key `"weatherapp.recentSearches"` as a JSON array, sorted by `searchedAt` descending.

**Constraints**:
- Maximum 5 entries; when a 6th is added the oldest (`searchedAt` minimum) is dropped
- Duplicate: if the same `id` is searched again it moves to the front (update `searchedAt`, remove old entry, prepend new one)

---

## Entity: WMOCondition (lookup table — not stored, not mutable)

**What it represents**: A static mapping from WMO weather code to human-readable label and icon identifier.

```ts
{
  code: number          // WMO code or representative code for a bucket
  label: string         // Human-readable condition (e.g., "Partly Cloudy")
  iconId: string        // Icon file identifier (e.g., "partly-cloudy-day")
}
```

Implemented as a `Map<number, WMOCondition>` exported from `utils/wmoConditions.js`. All 27 WMO buckets are covered (see research.md §3 for the full table).

---

## State Flow Summary

```
User Action              State Change
─────────────────────────────────────────────────────────────────────
Type location + submit   isLoading=true, error=null
Geocoding returns 0      isLoading=false, error="Location not found"
Geocoding returns 1      isLoading=true (weather fetch begins)
Geocoding returns 2+     isLoading=false, disambiguationList=[Location...]
User picks from list     isLoading=true (weather fetch begins)
Weather fetch succeeds   isLoading=false, currentWeather=CurrentWeather, add to recentSearches
Weather fetch fails      isLoading=false, error="Could not load weather data..."
Unit toggle clicked      unitPreference toggled, re-fetch weather with new unit params
"Use My Location" click  isLoading=true, geolocation requested
Geolocation permitted    isLoading=true (weather fetch begins with coords)
Geolocation denied       isLoading=false, error=null, geoError="Location permission denied..."
Recent search clicked    same as "Geocoding returns 1" but with known coords
```
