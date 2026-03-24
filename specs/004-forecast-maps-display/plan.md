# Implementation Plan: Weather Forecast & Maps Display

**Branch**: `004-forecast-maps-display` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-forecast-maps-display/spec.md`

## Summary

Extend the existing static React weather app with two lazy-loaded result views after a location is resolved: a Forecast view that shows a 7-day daily summary plus a 24-hour hourly drill-down, and a Map view that shows the selected location on an interactive map with switchable precipitation, temperature, and cloud-cover overlays. Reuse the current Open-Meteo integration for forecast and point-inspection data, add a lightweight client cache, and keep the app frontend-only by using free no-key services: OpenStreetMap for base tiles, RainViewer for precipitation tiles, and NASA GIBS for temperature/cloud-cover imagery.

## Technical Context

**Language/Version**: JavaScript (ES2022+) with React 18 and Node 20 for local tooling  
**Primary Dependencies**: React 18, Vite 5, Tailwind CSS 3, Open-Meteo REST API, Leaflet + React-Leaflet, OpenStreetMap raster tiles, RainViewer public tile endpoints, NASA GIBS WMTS/TMS raster layers  
**Storage**: In-memory `Map` cache plus `sessionStorage` for tab-scoped forecast and overlay response reuse; no database  
**Testing**: Vitest, jsdom, @testing-library/react, @testing-library/user-event, Playwright  
**Target Platform**: Modern desktop and mobile browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Static single-page web application (SPA)  
**Performance Goals**: Forecast view visible within 3 seconds after opening; map view visible within 4 seconds after opening; unit toggle propagation under 500ms; no map or overlay requests before the relevant view is opened  
**Constraints**: No API keys or backend proxy; frontend-only integrations must remain CORS-safe; tabs and legends must be accessible; map must provide a non-map fallback path; requests timeout at 8 seconds; keep implementation simple enough for a course demo  
**Scale/Scope**: One existing SPA, approximately 6-8 new components, 2-3 hooks/service additions, and targeted integration plus end-to-end test expansion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic User Experience | ✅ PASS | Forecast and map views are driven by live external data keyed to the selected location |
| II. Secure by Default | ✅ PASS (with justified exception — see Complexity Tracking) | No secrets are introduced; frontend-only integration is permitted for keyless, CORS-enabled public APIs |
| III. Accessibility and Performance Baseline | ✅ PASS | Plan requires semantic tabs, keyboard support, text legends, and lazy loading to protect initial responsiveness |
| IV. Testable Core Flows | ✅ PASS | Plan includes happy-path and failure-path automated coverage across integration and browser levels |
| V. Operability and Simplicity | ✅ PASS | Single-project frontend extension, no backend, and quickstart/test commands remain straightforward |
| Technical Baseline — frontend interface | ✅ PASS | Feature extends the existing React SPA with additional result views |
| Technical Baseline — backend service endpoint | ✅ PASS | Constitution allows a frontend-only model for keyless public APIs; rationale documented below |
| Technical Baseline — config in env vars / excluded from source control | ✅ PASS | No sensitive config is introduced |
| Technical Baseline — repeatable local setup in README | ✅ PASS | Quickstart artifact documents complete local flow and verification steps |

## Project Structure

### Documentation (this feature)

```text
specs/004-forecast-maps-display/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-forecast-map.md
│   └── ui-results-views.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ErrorMessage.jsx
│   ├── GeolocationDeniedNotice.jsx
│   ├── InitialLoadingIndicator.jsx
│   ├── LoadingSpinner.jsx
│   ├── LocationPicker.jsx
│   ├── RecentSearches.jsx
│   ├── SearchBar.jsx
│   ├── UnitToggle.jsx
│   ├── WeatherCard.jsx
│   ├── WeatherStats.jsx
│   ├── ResultsViewTabs.jsx          # New: Current / Forecast / Map tablist
│   ├── ForecastPanel.jsx            # New: lazy-loaded forecast view container
│   ├── DailyForecastStrip.jsx       # New: 5-7 day summary cards
│   ├── HourlyForecastPanel.jsx      # New: 24-hour drill-down panel
│   ├── WeatherMapPanel.jsx          # New: lazy-loaded map view container
│   ├── WeatherMapCanvas.jsx         # New: Leaflet adapter boundary
│   ├── WeatherLayerLegend.jsx       # New: text + color legend for active overlay
│   └── MapFallbackSummary.jsx       # New: text fallback for unsupported/failed map
├── hooks/
│   ├── useGeolocation.js
│   ├── useInitialLocation.js
│   ├── useRecentSearches.js
│   ├── useWeather.js
│   ├── useForecastData.js           # New: lazy fetch + cache forecast data
│   └── useMapOverlayState.js        # New: active overlay, inspected point, map status
├── services/
│   ├── geocoding.js
│   ├── weather.js                   # Extend for shared Open-Meteo helpers or keep current-only
│   ├── forecast.js                  # New: daily/hourly forecast + point inspection requests
│   └── overlays.js                  # New: overlay source metadata and tile URL builders
├── utils/
│   ├── locationState.js
│   ├── unitConversions.js
│   ├── wmoConditions.js
│   ├── forecastTransform.js         # New: normalize Open-Meteo daily/hourly payloads
│   └── requestCache.js              # New: in-memory + sessionStorage cache helpers
├── App.jsx
├── index.css
└── main.jsx

tests/
├── unit/
│   ├── unitConversions.test.js
│   ├── wmoConditions.test.js
│   ├── forecastTransform.test.js        # New
│   └── requestCache.test.js             # New
├── integration/
│   ├── App.test.jsx
│   ├── LocationSearch.test.jsx
│   ├── auto-detect-success.test.jsx
│   ├── fallback-denied.test.jsx
│   ├── user-control.test.jsx
│   ├── ForecastView.test.jsx            # New
│   ├── MapView.test.jsx                 # New
│   └── OverlayFailureStates.test.jsx    # New
└── e2e/
    ├── core-flows.spec.js
    ├── auto-geolocation-flows.spec.js
    ├── geolocation-mobile.spec.js
    ├── comprehensive-flows.spec.js
    ├── forecast-view.spec.js            # New
    └── map-overlays.spec.js             # New
```

**Structure Decision**: Keep the existing single-project Vite/React layout rooted at the repository root. The feature extends current hooks and service boundaries instead of adding new apps or a backend, which keeps the delivery aligned with the constitution’s simplicity requirement.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Frontend-only integration for weather, map, and overlay services | All selected external services are public, keyless, and suitable for direct browser access in this course-project scope. | A backend proxy would add operational complexity without improving secrecy or feature behavior because there are no credentials to protect. |

## Post-Design Constitution Check

Re-checked after Phase 1 artifacts (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`) were finalized.

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic User Experience | ✅ PASS | Forecast and map panels consume live data and define clear loading, ready, and error states |
| II. Secure by Default | ✅ PASS (justified exception) | No secrets introduced; external requests stay keyless and frontend-safe |
| III. Accessibility and Performance Baseline | ✅ PASS | Tabs, legends, and map fallback contracts encode keyboard and text alternatives; lazy loading prevents unnecessary view costs |
| IV. Testable Core Flows | ✅ PASS | Data model and contracts map directly to unit, integration, and e2e coverage |
| V. Operability and Simplicity | ✅ PASS | Quickstart uses the existing npm workflow and avoids new infrastructure |
| Technical Baseline — frontend interface | ✅ PASS | Design remains an SPA enhancement |
| Technical Baseline — backend service endpoint | ✅ PASS | Frontend-only exception remains explicitly documented |
| Technical Baseline — config in env vars | ✅ PASS | No environment secrets are needed |
| Technical Baseline — repeatable local setup | ✅ PASS | Quickstart covers install, run, test, and manual verification |

**Conclusion**: Plan passes all constitutional gates and is ready for `/speckit.tasks`.
