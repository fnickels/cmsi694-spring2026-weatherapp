# Quickstart: Weather Forecast & Maps Display

## Goal

Run the weather app locally with the planned forecast and map feature, then verify the primary flows covered by the specification.

## Prerequisites

- Node.js 20+
- npm 10+
- Modern browser with JavaScript enabled

## Install

```bash
npm install
```

## Start the App

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

## Manual Verification Flow

### 1. Load Current Weather

1. Search for a city such as `Los Angeles`.
2. Confirm the current-weather card and stats appear.
3. Confirm the `Current`, `Forecast`, and `Map` result views are available.

### 2. Verify Forecast View

1. Open the `Forecast` tab.
2. Confirm a loading state appears before data renders.
3. Verify a 7-day daily summary is visible.
4. Verify the hourly drill-down shows the next 24 hours.
5. Toggle units and confirm temperatures and precipitation values update without a new full page load.

### 3. Verify Map View

1. Open the `Map` tab.
2. Confirm the map loads centered on the selected location.
3. Confirm no map was loaded before the `Map` tab was opened.
4. Switch among `Precipitation`, `Temperature`, and `Cloud Cover` overlays.
5. Confirm the legend text updates with the active overlay.
6. Click or tap the map and confirm an inspected value summary appears outside the map surface.

### 4. Verify Failure States

1. Simulate or mock a forecast failure and confirm the Forecast tab shows a retryable error state.
2. Simulate or mock an overlay failure and confirm the base map remains usable with a layer-specific error.
3. Simulate map initialization failure and confirm the fallback text summary renders.

## External Service Compliance (No API Keys)

- Open-Meteo forecast and point inspection requests are public and keyless.
- OpenStreetMap base tiles are public and keyless.
- RainViewer precipitation metadata and tiles are public and keyless.
- NASA GIBS overlay imagery requests are public and keyless.
- No backend proxy or API tokens are required for this feature.

## Client-side Failure Diagnostics

- Forecast, map, overlay, and point-inspection service failures emit diagnostic warnings in development and test environments using the `weatherapp:*` console event prefix.
- Diagnostic payloads include provider, request type, timeout/network classification, and coordinate context.
- Diagnostics intentionally exclude credentials and user-identifying data.

## Measurement Protocol

### SC-002 and SC-003 Timing Baseline

- Baseline environment: desktop Chrome on a local development machine with normal broadband connectivity.
- Forecast timing (`SC-002`): measure from forecast-tab click until daily and hourly forecast content is visible.
- Map timing (`SC-003`): measure from map-tab click until map canvas is visible and pan/zoom controls respond.
- Record at least 10 runs per scenario; compute median and 95th percentile.

### SC-004 Manual Request Success Evaluation

- Run the documented happy-path scenarios 20 times across forecast and map interactions.
- Count each forecast load, overlay switch, and point inspection as one request attempt.
- Pass threshold: at least 95% of attempts succeed without service-unavailability errors.

### SC-008 Usability Check

- Run a brief observed task with at least 10 representative users in classroom/demo context.
- Task: open forecast, open map, switch overlay, interpret one inspected value.
- Pass threshold: at least 90% complete without verbal guidance.

## Automated Test Commands

```bash
npm test
```

```bash
npm run e2e
```

## Expected Test Coverage for This Feature

- Unit: forecast transforms, cache helpers, overlay selection logic
- Integration: tabs, forecast loading/error flows, map loading/error flows, unit propagation
- End-to-end: search -> forecast, search -> map, overlay switching, point inspection, mobile interaction

## Notes

- The implementation remains frontend-only; no `.env` file or backend service is required.
- External services must remain keyless and browser-accessible.