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