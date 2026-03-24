# Contract: External Weather and Geocoding APIs

**Branch**: `001-location-weather-app` | **Date**: 2026-03-17  
**Source**: [research.md](../research.md) §1 & §2  
**API Base**: `https://api.openweathermap.org` and `https://api.open-meteo.com`  
**Auth**: OpenWeather geocoding requires `VITE_OPENWEATHER_API_KEY`; Open-Meteo weather requires no auth  
**CORS**: Browser-direct requests are used for both providers

---

## API 1: OpenWeather Geocoding — Search by Name

Resolves a free-text location name to one or more `Location` records.

### Request

```
GET https://api.openweathermap.org/geo/1.0/direct
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | yes | City name or place name |
| `limit` | integer | no | Max results to return (implementation uses `5`) |
| `appid` | string | yes | OpenWeather API key from `VITE_OPENWEATHER_API_KEY` |

**Example**:
```
GET https://api.openweathermap.org/geo/1.0/direct?q=Chicago&limit=5&appid={VITE_OPENWEATHER_API_KEY}
```

### Success Response — `200 OK`

```json
[
  {
    "name": "Chicago",
    "lat": 41.85003,
    "lon": -87.65005,
    "country": "US",
    "state": "Illinois"
  }
]
```

**Fields used by the app**: `name`, `lat`, `lon`, `country`, `state`  
**Mapping note**: `lat`/`lon` are mapped to internal `latitude`/`longitude`; `state` is mapped to `admin1`; `id` is synthesized from coordinates.

### Empty Response (location not found)

```json
[]
```

### Error Response

OpenWeather returns structured errors for invalid credentials, for example:

```json
{
  "cod": 401,
  "message": "Invalid API key. Please see https://openweathermap.org/faq#error401 for more info."
}
```

Application MUST catch fetch/auth errors and display FR-008 error messaging.

## API 1b: OpenWeather Geocoding — Reverse by Coordinates

Resolves latitude/longitude to a nearby place label used by geolocation flows.

### Request

```
GET https://api.openweathermap.org/geo/1.0/reverse
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | yes | Decimal degrees (-90 to 90) |
| `lon` | number | yes | Decimal degrees (-180 to 180) |
| `limit` | integer | no | Max results to return (implementation uses `10`) |
| `appid` | string | yes | OpenWeather API key from `VITE_OPENWEATHER_API_KEY` |

**Example**:
```
GET https://api.openweathermap.org/geo/1.0/reverse?lat=34.05&lon=-118.24&limit=10&appid={VITE_OPENWEATHER_API_KEY}
```

### Success Response — `200 OK`

```json
[
  {
    "name": "Los Angeles",
    "lat": 34.0522,
    "lon": -118.2437,
    "country": "US",
    "state": "California"
  }
]
```

**Selection rule used by the app**: the first entry is treated as the nearest match. If the array is empty or the call fails, UI falls back to `Location (approximate)`.

### Client timeout guidance

- Client requests SHOULD use an 8-second timeout budget (AbortController) for geocoding and weather calls.
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
**Implementation note**: timezone abbreviation display is derived client-side from the `timezone` IANA string via `Intl.DateTimeFormat`, so the raw `timezone_abbreviation` field is not required by the UI.

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
