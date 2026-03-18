# Contract: Open-Meteo External APIs

**Branch**: `001-location-weather-app` | **Date**: 2026-03-17  
**Source**: [research.md](../research.md) §1 & §2  
**API Base**: `https://geocoding-api.open-meteo.com` and `https://api.open-meteo.com`  
**Auth**: None required (no API key)  
**CORS**: Fully CORS-enabled — calls may be made directly from browser JavaScript

---

## API 1: Geocoding — Search by Name

Resolves a free-text location name to one or more `Location` records.

### Request

```
GET https://geocoding-api.open-meteo.com/v1/search
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | yes | City name, postal code, or place name |
| `count` | integer | no | Max results to return (default: 10, max: 100) |
| `language` | string | no | Response language (use `en`) |
| `format` | string | no | Response format (`json`) |

**Example**:
```
GET https://geocoding-api.open-meteo.com/v1/search?name=Chicago&count=10&language=en&format=json
```

### Success Response — `200 OK`

```json
{
  "results": [
    {
      "id": 4887398,
      "name": "Chicago",
      "latitude": 41.85003,
      "longitude": -87.65005,
      "elevation": 179.0,
      "feature_code": "PPLA2",
      "country_code": "US",
      "admin1_id": 4896861,
      "admin2_id": 4888671,
      "timezone": "America/Chicago",
      "population": 2720546,
      "country_id": 6252001,
      "country": "United States",
      "admin1": "Illinois",
      "admin2": "Cook County"
    }
  ],
  "generationtime_ms": 0.9
}
```

**Fields used by the app**: `id`, `name`, `latitude`, `longitude`, `country`, `countryCode`, `admin1`  
**Fields ignored**: `elevation`, `feature_code`, `admin1_id`, `admin2_id`, `population`, `country_id`, `admin2`, `generationtime_ms`

### Empty Response (location not found)

```json
{
  "generationtime_ms": 0.9
}
```

> `results` key is absent (not `[]`). Application code MUST handle missing `results` as "no results found."

### Error Response

HTTP 5xx or network failure — no structured error body guaranteed.  
Application MUST catch fetch errors and display FR-008 error message.

### Client timeout guidance

- Client requests SHOULD use an 8-second timeout budget (AbortController) for both geocoding and weather calls.
- Timeout failures MUST be mapped to the service-unavailable error state (not location-not-found).

---

## API 2: Current Weather — Fetch by Coordinates

Returns current weather conditions for a specific latitude/longitude.

### Request

```
GET https://api.open-meteo.com/v1/forecast
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | number | yes | Decimal degrees (-90 to 90) |
| `longitude` | number | yes | Decimal degrees (-180 to 180) |
| `current` | string | yes | Comma-separated list of current variable names |
| `temperature_unit` | string | no | `celsius` (default) or `fahrenheit` |
| `wind_speed_unit` | string | no | `kmh` (default), `mph`, `ms`, `kn` |
| `timezone` | string | yes | Use `auto` to auto-resolve from coordinates |
| `forecast_days` | integer | no | Set to `1` to minimize response size |

**Required `current` variables**:

```
temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,visibility,weather_code
```

**Imperial example**:
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=41.85003
  &longitude=-87.65005
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,visibility,weather_code
  &temperature_unit=fahrenheit
  &wind_speed_unit=mph
  &timezone=auto
  &forecast_days=1
```

### Success Response — `200 OK`

```json
{
  "latitude": 41.84375,
  "longitude": -87.625,
  "generationtime_ms": 0.09,
  "utc_offset_seconds": -18000,
  "timezone": "America/Chicago",
  "timezone_abbreviation": "CDT",
  "elevation": 179.0,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°F",
    "apparent_temperature": "°F",
    "relative_humidity_2m": "%",
    "wind_speed_10m": "mp/h",
    "wind_direction_10m": "°",
    "visibility": "m",
    "weather_code": "wmo code"
  },
  "current": {
    "time": "2026-03-17T14:00",
    "interval": 900,
    "temperature_2m": 45.2,
    "apparent_temperature": 39.1,
    "relative_humidity_2m": 58,
    "wind_speed_10m": 12.4,
    "wind_direction_10m": 270,
    "visibility": 24140,
    "weather_code": 3
  }
}
```

> **Note**: `visibility` is always returned in metres regardless of the `wind_speed_unit` parameter. Client-side conversion is required: metres ÷ 1609.344 = miles; metres ÷ 1000 = km.

**Fields used by the app**: `current.*`, `current_units.temperature_2m`, `current_units.wind_speed_10m`, `timezone`  
**Fields ignored**: `generationtime_ms`, `utc_offset_seconds`, `elevation`, `timezone_abbreviation`, `current.interval`

### Error Response

HTTP 4xx/5xx — may return structured error:
```json
{
  "error": true,
  "reason": "Parameter latitude must be within -90 and 90 degrees"
}
```

Application MUST check `response.ok` and display FR-008 error message on any failure.

### Error-state mapping

- Geocoding returns missing/empty `results`: map to location-not-found state.
- HTTP 4xx/5xx or network/timeout failures: map to service-unavailable state.
- Geolocation permission denial/unavailable API: map to geolocation-specific guidance state.

---

## Rate Limits & Fair Use

- Open-Meteo imposes no hard rate limits on the free tier for non-commercial or educational use
- For a course/demo project, standard usage is well within acceptable limits
- No caching is required but is permissible (not mandated by the spec)

---

## Service Unavailability

If either API endpoint is unreachable (DNS failure, timeout, HTTP 5xx):
- Application MUST display a service-unavailable message (FR-008)
- Application MUST NOT crash or show a blank screen
- No automatic retry is required by the spec
