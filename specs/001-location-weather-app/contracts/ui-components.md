# Contract: UI Component Interfaces

**Branch**: `001-location-weather-app` | **Date**: 2026-03-17  
**Source**: [plan.md](../plan.md) Project Structure + [data-model.md](../data-model.md)

These contracts define the props each component accepts. They act as the interface boundary between parent components and children so they can be implemented and tested independently.

---

## `<SearchBar />`

Renders the location text input, submit button, and geolocation button.

```ts
Props:
  onSearch: (query: string) => void
    // Called when user submits non-empty search query

  onUseMyLocation: () => void
    // Called when "Use My Location" button is clicked

  isLoading: boolean
    // When true: input and buttons are disabled; loading state communicated to user

  disabled?: boolean
    // Optional override to disable the entire component
```

**Emits**: `onSearch(query)` on Enter key press or submit button click — only if `query.trim()` is non-empty.  
**Accessibility**: Input MUST have a visible label or `aria-label`. Submit button MUST have an accessible name. Geolocation button MUST have an `aria-label` explaining its function.

---

## `<UnitToggle />`

Renders an °F / °C toggle control.

```ts
Props:
  unit: "imperial" | "metric"
    // Currently active unit system

  onToggle: () => void
    // Called when the inactive option is selected
```

**Accessibility**: Toggle MUST be keyboard-activatable (Enter/Space). Active state MUST be communicated via `aria-pressed` or equivalent.

---

## `<WeatherCard />`

Primary weather display card. Shows condition icon, temperature, and condition label prominently.

```ts
Props:
  weather: {
    conditionLabel: string
    conditionIcon: string
    displayTemperature: string    // Formatted string, e.g., "45°F" or "7°C"
    displayFeelsLike: string      // Formatted, e.g., "Feels like 39°F"
    observationTime: string       // Formatted local time, e.g., "2:00 PM"
  }
  locationName: string            // e.g., "Chicago, Illinois, United States"
```

**Visual**: Glassmorphism card (`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl`). Condition icon displayed prominently above temperature.

---

## `<WeatherStats />`

Displays the secondary weather statistics row (humidity, wind, visibility).

```ts
Props:
  humidity: number              // Percentage (0–100), displayed as "58%"
  windSpeed: string             // Formatted with unit, e.g., "12 mph" or "19 km/h"
  windDirection: string         // Cardinal label, e.g., "NW"
  visibility: string            // Formatted with unit, e.g., "15.0 mi" or "24.1 km"
```

**Accessibility**: Each stat MUST have an accessible label (e.g., `aria-label="Humidity: 58%"`).

---

## `<LocationPicker />`

Disambiguation list shown when a search returns multiple location matches.

```ts
Props:
  locations: Array<{
    id: number
    displayName: string
  }>
  onSelect: (location: { id: number, displayName: string, latitude: number, longitude: number }) => void
  onDismiss: () => void
    // Called if user closes/cancels the disambiguation without selecting
```

**Accessibility**: List items MUST be keyboard navigable (arrow keys or tab). Selected item MUST receive focus on selection. MUST have a descriptive heading (e.g., "Multiple locations found — please select one").

---

## `<RecentSearches />`

Renders up to 5 recent searches as clickable chips.

```ts
Props:
  searches: Array<{
    id: number
    displayName: string
    latitude: number
    longitude: number
  }>
  onSelect: (search: { id: number, displayName: string, latitude: number, longitude: number }) => void
```

**Rendered**: Horizontal scrollable row of pill/chip buttons below the search bar. Hidden entirely when `searches` is empty.  
**Accessibility**: Each chip is a `<button>` with an `aria-label` of `"Show weather for {displayName}"`.

---

## `<LoadingSpinner />`

Animated loading indicator shown while data is being fetched.

```ts
Props:
  message?: string   // Optional accessible label, defaults to "Loading weather data..."
```

**Accessibility**: MUST include `role="status"` and `aria-live="polite"`.

---

## `<ErrorMessage />`

User-friendly error display.

```ts
Props:
  message: string         // Human-readable error string
  onDismiss?: () => void  // Optional dismiss/retry callback; renders a "Try Again" button if provided
```

**Accessibility**: MUST include `role="alert"` so screen readers announce it immediately.

---

## `<App />` — Root Component State Contract

`App.jsx` owns and distributes the following state to child components:

| State | Type | Managed by |
|-------|------|------------|
| `unitPreference` | `"imperial" \| "metric"` | `App.jsx` useState |
| `isLoading` | boolean | `useWeather` hook |
| `error` | string \| null | `useWeather` hook |
| `currentWeather` | `CurrentWeather \| null` | `useWeather` hook |
| `selectedLocation` | `Location \| null` | `useWeather` hook |
| `disambiguationList` | `Location[]` | `useWeather` hook |
| `recentSearches` | `RecentSearch[]` | `useRecentSearches` hook |
| `geoError` | string \| null | `useGeolocation` hook |
