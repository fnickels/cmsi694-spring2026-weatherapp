# Contract: Results Views and Component Interfaces

## Purpose

Define the UI contracts for the new results-area views so implementation and tests share the same behavior expectations.

## 1. ResultsViewTabs

- Responsibility: Switch among `Current`, `Forecast`, and `Map` views for the selected location.
- Required props:
  - `activeView`: `current | forecast | map`
  - `onChange(nextView)`
  - `availableViews`: array of available tab ids
- Required behavior:
  - Renders a semantic `tablist` with one `tab` per view
  - Uses manual activation on keyboard navigation
  - Preserves the active unit toggle outside the tabs
  - Does not trigger forecast or map fetching until the corresponding view is activated

## 2. ForecastPanel

- Responsibility: Render forecast loading, success, and error states.
- Required props:
  - `location`
  - `unitPreference`
  - `forecastBundle`
  - `isLoading`
  - `errorMessage`
  - `selectedDay`
  - `onSelectDay(dayKey)`
  - `onRetry()`
- Required behavior:
  - Shows a 5-7 day daily summary strip
  - Shows a 24-hour hourly detail panel
  - Updates all temperatures and precipitation values when units change
  - Exposes a retry action on failure

## 3. DailyForecastStrip

- Responsibility: Present summary cards for daily forecast comparison.
- Required props:
  - `days`
  - `selectedDay`
  - `onSelectDay(dayKey)`
  - `unitPreference`
- Required behavior:
  - Highlights the selected day
  - Supports keyboard activation
  - Shows date label, condition icon, min/max temperature, and precipitation probability

## 4. HourlyForecastPanel

- Responsibility: Present the 24-hour drill-down for the active day/window.
- Required props:
  - `hours`
  - `unitPreference`
  - `heading`
- Required behavior:
  - Shows hour label, temperature, condition, and precipitation probability per row/card
  - Supports responsive stacked layout on mobile

## 5. WeatherMapPanel

- Responsibility: Coordinate map loading, overlay selection, inspection, legends, and fallback states.
- Required props:
  - `location`
  - `activeOverlay`
  - `mapStatus`
  - `inspection`
  - `onOverlayChange(overlayType)`
  - `onInspectPoint({ latitude, longitude })`
  - `onRetry()`
- Required behavior:
  - Lazy-loads the map runtime on first activation
  - Renders overlay controls for `precipitation`, `temperature`, and `cloud-cover`
  - Shows a text legend for the active overlay
  - Shows inspected value text outside the map surface
  - Falls back to `MapFallbackSummary` when the map cannot render

## 6. WeatherMapCanvas

- Responsibility: Thin adapter around the map library.
- Required props:
  - `center`
  - `zoom`
  - `activeOverlay`
  - `onReady()`
  - `onError(message)`
  - `onInspectPoint({ latitude, longitude })`
- Required behavior:
  - Displays the base map and selected overlay only
  - Emits click/tap events in app-owned coordinates
  - Avoids leaking third-party DOM details into parent components

## 7. WeatherLayerLegend

- Responsibility: Explain the active overlay in text and color.
- Required props:
  - `overlayType`
  - `legendItems`
  - `unitPreference`
- Required behavior:
  - Never relies on color alone
  - Includes a visible title such as `Temperature legend`
  - Shows units where applicable

## 8. MapFallbackSummary

- Responsibility: Provide a non-map path to the core information.
- Required props:
  - `location`
  - `activeOverlay`
  - `errorMessage`
  - `inspection`
- Required behavior:
  - States why the map is unavailable or unsupported
  - Preserves selected location context
  - Surfaces overlay and inspection information in text when available

## 9. Testing Contract

- Integration tests assert user-visible states and callbacks, not map-library DOM internals
- Browser tests verify that the real map initializes, overlays switch, and click/tap inspection updates visible summary text