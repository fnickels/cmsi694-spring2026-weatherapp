# Contract: Forecast and Map External Services

## Purpose

Define the external service contracts the frontend will use for forecast retrieval, map base tiles, overlay imagery, and point inspection.

## 1. Forecast Retrieval

- Provider: Open-Meteo Forecast API
- Authentication: None
- Request shape:

```http
GET https://api.open-meteo.com/v1/forecast
```

- Required query parameters:
  - `latitude`: selected location latitude
  - `longitude`: selected location longitude
  - `timezone=auto`
  - `forecast_days=7`
  - `temperature_unit=celsius`
  - `wind_speed_unit=kmh`
  - `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`
  - `hourly=temperature_2m,precipitation_probability,weather_code,cloud_cover`
- Response contract consumed by the app:
  - `timezone`: string
  - `daily.time[]`
  - `daily.temperature_2m_max[]`
  - `daily.temperature_2m_min[]`
  - `daily.precipitation_probability_max[]`
  - `daily.weather_code[]`
  - `hourly.time[]`
  - `hourly.temperature_2m[]`
  - `hourly.precipitation_probability[]`
  - `hourly.weather_code[]`
  - `hourly.cloud_cover[]`
- Failure handling:
  - Non-2xx or invalid payload -> Forecast error state
  - Timeout after 8 seconds -> user-visible retryable error

## 2. Point Inspection Query

- Provider: Open-Meteo Forecast API
- Authentication: None
- Request shape:

```http
GET https://api.open-meteo.com/v1/forecast
```

- Required query parameters:
  - `latitude`: clicked/tapped latitude
  - `longitude`: clicked/tapped longitude
  - `timezone=auto`
  - `forecast_days=1`
  - `hourly=temperature_2m,precipitation_probability,cloud_cover`
- Consumer behavior:
  - The client selects the closest relevant hour for the inspection payload
  - The returned value is mapped to the active overlay type and shown in a text summary panel

## 3. Base Map Tiles

- Provider: OpenStreetMap raster tile service
- Authentication: None
- URL template:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

- Consumer requirements:
  - Attribution must be displayed in the map UI
  - Tiles are loaded only after the Map view is opened

## 4. Precipitation Overlay

- Provider: RainViewer public tile service
- Authentication: None
- Request model:
  - Retrieve the current tile path metadata from RainViewer’s public weather-maps endpoint
  - Build tile URLs from the returned path rather than hardcoding timestamp paths
- URL template after metadata resolution:

```text
https://tilecache.rainviewer.com{path}/256/{z}/{x}/{y}/2/1_1.png
```

- Consumer requirements:
  - Treat as visualization-only imagery
  - Do not derive inspected values from pixels; use Open-Meteo point inspection instead

## 5. Temperature and Cloud-Cover Overlays

- Provider: NASA GIBS public imagery layers
- Authentication: None
- Access pattern:
  - WMTS/TMS raster tile layers selected from the public catalog for temperature-like imagery and cloud-cover imagery
- Consumer requirements:
  - Overlay selection is restricted to one active layer at a time
  - Legend text must describe the active layer in user-facing terms
  - If a layer is unavailable, keep the base map usable and surface a layer-specific error

## 6. Caching Contract

- Forecast response TTL: 15-30 minutes in session scope
- Point inspection TTL: 5-10 minutes in session scope
- Base map and overlay tiles: rely on browser HTTP caching; no custom tile cache layer is required

## 7. Service Guardrails

- No request may require an API key, token, or authenticated backend proxy
- All requests must use browser-safe CORS endpoints
- Every external request path must surface loading, ready, and error states to the UI