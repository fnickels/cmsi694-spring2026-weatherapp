# Research: Location-Based Current Weather App

**Branch**: `001-location-weather-app` | **Date**: 2026-03-17  
**Purpose**: Resolve all NEEDS CLARIFICATION items from Technical Context and document decisions for Phase 1 design.

---

## 1. Open-Meteo Geocoding API

**Decision**: Use Open-Meteo's free Geocoding API to resolve location names to coordinates.  
**Rationale**: Free, no API key, CORS-enabled, returns multiple results for disambiguation, supports city names and partial matches.  
**Alternatives considered**: Nominatim (OpenStreetMap) — also free/keyless but Open-Meteo geocoding is purpose-built for weather location lookup and returns cleaner disambiguation data.

### Endpoint

```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={city}
  &count=10
  &language=en
  &format=json
```

### Response shape

```json
{
  "results": [
    {
      "id": 4887398,
      "name": "Chicago",
      "latitude": 41.85003,
      "longitude": -87.65005,
      "country_code": "US",
      "country": "United States",
      "admin1": "Illinois"
    }
  ]
}
```

- When `results` has 0 entries → location not found (FR-008 error state)
- When `results` has 1 entry → proceed directly to weather fetch
- When `results` has 2–10 entries → present disambiguation list (FR-007)

---

## 2. Open-Meteo Weather API

**Decision**: Use Open-Meteo's `/v1/forecast` endpoint with `current` parameter set to exactly the fields required by FR-002.  
**Rationale**: Free, no API key, CORS-enabled, returns metric or imperial units server-side via query parameters, supports all required data fields.  
**Alternatives considered**: OpenWeatherMap (requires API key), WeatherAPI.com (requires API key) — both eliminated because they require credentials (violates the chosen architecture).

### Endpoint

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,
           wind_speed_10m,wind_direction_10m,visibility,weather_code
  &temperature_unit={fahrenheit|celsius}    ← controlled by UnitPreference
  &wind_speed_unit={mph|kmh}                ← controlled by UnitPreference
  &visibility_unit={miles|km}              ← controlled by UnitPreference (note: API param name differs)
  &timezone=auto
  &forecast_days=1
```

> Note: `visibility` is returned in metres by default; use `&wind_speed_unit=mph` + `&temperature_unit=fahrenheit` for imperial. For visibility the API returns metres regardless of unit request — client-side conversion is needed to convert to miles or km (see unitConversions.js).

### Response shape

```json
{
  "latitude": 41.85,
  "longitude": -87.65,
  "current": {
    "time": "2026-03-17T14:00",
    "temperature_2m": 45.2,
    "apparent_temperature": 39.1,
    "relative_humidity_2m": 58,
    "wind_speed_10m": 12.4,
    "wind_direction_10m": 270,
    "visibility": 24140,
    "weather_code": 3
  },
  "current_units": {
    "temperature_2m": "°F",
    "apparent_temperature": "°F",
    "wind_speed_10m": "mp/h",
    "visibility": "m"
  }
}
```

### Unit toggle architecture

**Decision**: Unit toggle performs client-side conversion only, with no additional network request after weather data is loaded. Weather values are normalized to metric in state (`temperatureC`, `feelsLikeC`, `windSpeedKph`, `visibilityM`) and formatted for display based on `UnitPreference`.  
**Rationale**: This directly satisfies SC-004 (toggle in under 1 second with no network request) and provides deterministic behavior offline after data has been fetched once.  
**Alternative considered**: Re-fetch weather with different query parameters on each toggle. Rejected because it violates SC-004's explicit no-network-request requirement and introduces avoidable latency variability.

---

## 3. WMO Weather Code Mapping

**Decision**: Implement a static lookup table in `utils/wmoConditions.js` mapping all 27 WMO weather interpretation code buckets to a label and icon identifier.  
**Rationale**: Open-Meteo returns `weather_code` as a WMO 4677 code. A compact lookup table covers every code the API can return.

### WMO code buckets

| Code(s) | Label | Icon ID |
|---------|-------|---------|
| 0 | Clear Sky | `clear-day` |
| 1 | Mainly Clear | `mostly-clear-day` |
| 2 | Partly Cloudy | `partly-cloudy-day` |
| 3 | Overcast | `overcast` |
| 45 | Foggy | `fog` |
| 48 | Rime Fog | `fog` |
| 51 | Light Drizzle | `drizzle` |
| 53 | Moderate Drizzle | `drizzle` |
| 55 | Heavy Drizzle | `drizzle` |
| 61 | Slight Rain | `rain` |
| 63 | Moderate Rain | `rain` |
| 65 | Heavy Rain | `rain` |
| 66 | Light Freezing Rain | `sleet` |
| 67 | Heavy Freezing Rain | `sleet` |
| 71 | Slight Snow | `snow` |
| 73 | Moderate Snow | `snow` |
| 75 | Heavy Snow | `snow` |
| 77 | Snow Grains | `snow` |
| 80 | Slight Rain Showers | `showers` |
| 81 | Moderate Rain Showers | `showers` |
| 82 | Violent Rain Showers | `showers` |
| 85 | Slight Snow Showers | `snow-showers` |
| 86 | Heavy Snow Showers | `snow-showers` |
| 95 | Thunderstorm | `thunderstorm` |
| 96 | Thunderstorm + Hail | `thunderstorm` |
| 99 | Thunderstorm + Heavy Hail | `thunderstorm` |

> Night variants (codes 0–3) can be differentiated client-side by inspecting the `time` field in the response vs. local sunrise/sunset — deferred as an enhancement; initial implementation uses day icons for all conditions.

---

## 4. Weather Icon Set

**Decision**: Use **Meteocons** by Bas Milius (MIT license, free SVG animated weather icons).  
**Rationale**: MIT licensed, comprehensive coverage of all WMO buckets, SVG-based (scalable, accessible), actively maintained as of 2026.  
**Alternatives considered**:
- emoji-only — no visual polish, not scalable
- Custom SVG hand-coded — out of scope for a course project
- Weather Icons font (Erik Flowers) — older, limited animation, less polished than Meteocons

**Integration**: Download static SVG files into `public/icons/` and reference by icon ID string from the WMO lookup table. No npm package dependency needed.

---

## 5. React State Management

**Decision**: React `useState` + `useReducer` in custom hooks only. No external state library.  
**Rationale**: The app state is shallow: one `currentWeather` object, one `isLoading` boolean, one `error` string, one `unitPreference` string, one `recentSearches` array, one `disambiguationList` array. This fits cleanly in a handful of custom hooks with no cross-component state sharing that would require a store.  
**Alternatives considered**:
- Zustand — overkill for this scope; adds a dependency and mental model
- React Context — appropriate for `unitPreference` (needs to be globally visible), but only for that single value
- Redux Toolkit — significantly over-engineered for a single-page demo

**Refined decision**: `useWeather` hook owns weather state and hosts geolocation orchestration. `useRecentSearches` owns sessionStorage. `UnitPreference` is lifted to `App.jsx` state and passed as a prop (or via a minimal React Context if prop-drilling through more than 2 levels becomes awkward during implementation).

---

## 6. Testing Strategy

**Decision**: Vitest + @testing-library/react + @testing-library/user-event + jsdom environment.  
**Rationale**: Vitest is the native test runner for Vite projects — zero configuration, same module resolution as the app. React Testing Library enforces testing behavior over implementation.  
**Alternatives considered**: Jest — works but requires additional Vite/ESM config; Vitest is simpler and purpose-built for this stack.

### Required test coverage (Constitution IV)

**Happy-path (required)**:
- `SearchBar.test.jsx`: User types "Chicago" and submits → geocoding mock returns one result → weather mock returns data → `WeatherCard` renders temperature, condition, humidity, wind

**Failure-path (required)**:
- `App.test.jsx`: Geocoding mock returns HTTP 503 → `ErrorMessage` is rendered with appropriate message
- `App.test.jsx`: Geocoding mock returns empty `results` → "location not found" message rendered

**Unit tests**:
- `unitConversions.test.js`: °C↔°F, km/h↔mph, m→km, m→miles
- `wmoConditions.test.js`: All 27 WMO codes return a non-null label and icon ID

---

## 7. Geolocation Integration

**Decision**: Use `navigator.geolocation.getCurrentPosition()` directly in `useGeolocation.js` hook. Pass obtained `{ latitude, longitude }` directly to the weather API (skipping geocoding).  
**Rationale**: When coordinates are already known, the geocoding step adds latency with no benefit. Display name for auto-detected location is obtained by reverse-naming: pass coords to geocoding API with no `name` parameter is not supported — instead, use Open-Meteo's geocoding API is forward-only. Therefore, display name for geolocation results will be constructed from the nearest city lookup or the response's `name` field from a reverse-geocode call to a secondary endpoint.

**Revised Decision**: For geolocation, skip naming and display "Your Location" as the display name initially, then asynchronously attempt to resolve a name by calling the weather data's `timezone` field (e.g., "America/Chicago") to derive a friendly city name — or use the browser's `Intl` API. This avoids a required second API dependency.

**Simpler revised decision**: Use `https://geocoding-api.open-meteo.com/v1/search?latitude={lat}&longitude={lon}` — however this endpoint is forward-only (name→coords). Instead: after getting coords from geolocation, pass them directly to the weather API and display the returned `timezone` string formatted as a readable location name (e.g., "America/Chicago" → "Chicago, America"). This is acceptable for a course project.

**Final decision**: Call weather API directly with coords. For the display name, use `Intl.DateTimeFormat().resolvedOptions().timeZone` to get the local timezone string, then format it. If geolocation is used, display format will be "{timezone-city}, {timezone-region}" parsed from the timezone string (e.g., "America/Chicago" → "Chicago").

---

## 8. Glassmorphism Implementation with Tailwind CSS

**Decision**: Use Tailwind's `backdrop-blur`, `bg-white/10`, `border border-white/20`, and `rounded-2xl` utilities to achieve the frosted-glass card effect. Background uses a CSS custom gradient applied to the `body` or root element.  
**Rationale**: All required utilities are available in Tailwind CSS 3 without custom plugins.

### Key Tailwind classes for glassmorphism cards

```
bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl
```

### Background gradient

```css
/* index.css */
body {
  background: linear-gradient(135deg, #0f1c3f 0%, #1a3a6e 40%, #0d2850 70%, #061524 100%);
  min-height: 100vh;
}
```

### WCAG AA compliance with glassmorphism

Frosted-glass with very low opacity (`bg-white/10`) on a dark background means text needs to be white or near-white. White text (`#ffffff`) on a dark navy background (`#0f1c3f`) achieves a contrast ratio of ~15:1 — well above the 4.5:1 minimum. For secondary/muted text, use at minimum `text-white/80` (≥7:1 on the dark background) to maintain AA compliance.
