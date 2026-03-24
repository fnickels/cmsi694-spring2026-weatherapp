# Tasks: Weather Forecast & Maps Display (004)

**Feature**: Weather Forecast & Maps Display  
**Branch**: `004-forecast-maps-display`  
**Status**: Actionable  
**Generated**: 2026-03-24  

## Overview

This tasks document provides a fully actionable breakdown of implementation work for the weather forecast and maps display feature. Tasks are organized by user story (priority order) with clear success criteria, file paths, and dependency relationships. Each task follows the checklist format and is independently testable within its phase.

---

## Phase 1: Project Setup & Infrastructure

**Goal**: Establish project dependencies and foundational infrastructure  
**Success Criteria**:
- Package.json updated with required dependencies (Leaflet, React-Leaflet)
- Build and test commands execute cleanly
- Linting and type-checking pass on all new files

### Setup Tasks

- [ ] T001 Add Leaflet and React-Leaflet to package.json dependencies; run `npm install` to lock versions
- [ ] T002 Verify Vite config includes necessary loaders for map library assets and Tailwind CSS integration
- [ ] T003 Create `.eslintignore` entries (if needed) for third-party map library code to prevent false linting errors
- [ ] T004 Update npm run scripts in package.json to include test coverage reporting (e.g., `npm run test:coverage`)

---

## Phase 2: Foundational Utilities & Services

**Goal**: Build reusable utilities and service layer for forecast, geocoding, and caching  
**Success Criteria**:
- All utility functions have unit test coverage >80%
- Services pass mock-based integration tests
- No external API keys introduced
- Cache behavior verified in unit tests

### Utility & Service Tasks

- [ ] T005 [P] Create `src/utils/requestCache.js` with session-scoped cache implementation supporting TTL, key generation, and expiry logic; include unit tests in `tests/unit/requestCache.test.js`
- [ ] T006 [P] Create `src/utils/forecastTransform.js` to normalize Open-Meteo forecast API responses into `Forecast Bundle` and `Hourly Forecast Point` objects; include unit tests in `tests/unit/forecastTransform.test.js`
- [ ] T007 [P] Create `src/services/forecast.js` with functions to: fetch daily+hourly forecast for a location, perform point inspection queries, and handle API errors; use `requestCache` for response caching; include unit tests in `tests/unit/forecastService.test.js`
- [ ] T008 [P] Create `src/services/overlays.js` with functions to: fetch RainViewer precipitation metadata, build NASA GIBS tile URLs for temperature and cloud-cover, manage overlay availability; include unit tests in `tests/unit/overlaysService.test.js`
- [ ] T009 Create `src/utils/unitConversions.js` extension (if not already present) to support temperature conversions (Celsius ↔ Fahrenheit) and precipitation conversions (mm ↔ in); include unit tests in `tests/unit/unitConversions.test.js`

---

## Phase 3: User Story 1 – View Extended Forecast After Location Selection (Priority: P1)

**User Story Goal**: Display 5-7 day daily forecast and 24-hour hourly breakdown after location is selected  

**Independent Test Criteria**:
- Forecast tab appears when location is resolved
- 7-day forecast data loads within 3 seconds and displays date, condition icon, min/max temperature, and precipitation probability
- 24-hour hourly panel shows hour, temperature, condition, and precipitation
- All values update when unit preference changes (imperial ↔ metric)
- Forecast automatically refreshes when location changes
- Loading and error states are visible

### User Story 1 Tasks

- [ ] T010 Create `src/hooks/useForecastData.js` hook to manage forecast fetch, caching, unit conversion, and error states; implement lazy loading so fetch only triggers when forecast view is opened; pass unit tests in `tests/integration/ForecastView.test.jsx`
- [ ] T011 [P] [US1] Create `src/components/DailyForecastStrip.jsx` to render 5-7 summary cards showing date label, condition icon, min/max temperature (unit-aware), and precipitation probability
- [ ] T012 [P] [US1] Create `src/components/HourlyForecastPanel.jsx` to render hourly breakdown as rows or cards showing hour, temperature (unit-aware), condition icon, and precipitation probability; support responsive mobile layout
- [ ] T013 [P] [US1] Create `src/components/ForecastPanel.jsx` as the container component that: manages loading/ready/error states, displays daily strip and hourly panel, handles day selection for hourly drill-down, includes retry on error, and respects unit preference changes
- [ ] T014 [US1] Create `src/components/ResultsViewTabs.jsx` to render a semantic tablist with `Current`, `Forecast`, and `Map` tab buttons; implement manual activation (no auto-focus on arrow keys) to prevent premature data fetching
- [ ] T015 [US1] Integrate `useForecastData` hook and `ForecastPanel` into `src/App.jsx` to connect the forecast view with the location context and trigger lazy loading on tab activation
- [ ] T016 [US1] Create integration tests in `tests/integration/ForecastView.test.jsx` to verify: forecast tab renders, data loads when activated, unit toggle updates all values, location change triggers new forecast fetch, and error messages display correctly
- [ ] T017 [US1] Create end-to-end tests in `tests/e2e/forecast-view.spec.js` to verify: user searches for a location, clicks Forecast tab, sees 7-day forecast plus 24-hour drill-down within 3 seconds, and toggles units

---

## Phase 4: User Story 2 – View Interactive Map Showing Location (Priority: P2)

**User Story Goal**: Display selected location on an interactive map with zoom/pan controls; map loads only when Map view is opened  

**Independent Test Criteria**:
- Map tab appears when location is resolved
- Map loads within 4 seconds of tab activation
- Map is centered on selected location with visible marker
- Zoom and pan controls respond to mouse and touch inputs
- Map re-centers and de-centers marker when location changes
- Loading and error states are visible
- Unsupported browser falls back to text summary

### User Story 2 Tasks

- [ ] T018 Create `src/hooks/useMapOverlayState.js` hook to manage map view status (idle/loading/ready/error), active overlay, loaded overlays, legend visibility, and inspection state; include unit tests in `tests/unit/useMapOverlayState.test.js`
- [ ] T019 [P] [US2] Create `src/components/WeatherMapCanvas.jsx` as a thin Leaflet adapter that: initializes map only on first render, displays base tiles (OpenStreetMap), centers on provided coordinates, exposes zoom/pan controls, handles click/tap events, and emits errors without leaking DOM internals
- [ ] T020 [P] [US2] Create `src/components/WeatherLayerLegend.jsx` to display text-based legend for active overlay (precipitation, temperature, or cloud-cover) with color swatches, labels, and unit information where applicable
- [ ] T021 [P] [US2] Create `src/components/MapFallbackSummary.jsx` to provide a non-map text-based fallback when the map is unavailable (browser unsupported, API error, etc.); display location info and overlay information in text
- [ ] T022 [US2] Create `src/components/WeatherMapPanel.jsx` as the container component that: manages map status and overlay state, renders overlay controls (radio buttons or toggle buttons for precipitation, temperature, cloud-cover), displays the map canvas or fallback, includes a legend for the active overlay, shows inspected value summary, includes retry on error
- [ ] T023 [US2] Integrate `useMapOverlayState` hook and `WeatherMapPanel` into `src/App.jsx` to connect the map view with the location context and trigger lazy loading (Leaflet bundle and initial tile fetch) on tab activation
- [ ] T024 [US2] Create integration tests in `tests/integration/MapView.test.jsx` to verify: map tab renders, Leaflet loads when activated, map centers on location, zoom/pan controls are functional, location change updates map center, and error messages display correctly
- [ ] T025 [US2] Create end-to-end tests in `tests/e2e/map-view.spec.js` to verify: user searches for a location, clicks Map tab, sees the map and controls within 4 seconds, zooms and pans the map, and location change re-centers the map

---

## Phase 5: User Story 3 – View Forecast on Map with Regional Weather Pattern (Priority: P3)

**User Story Goal**: Display switchable weather layers (precipitation, temperature, cloud-cover) on the map; support click/tap inspection of overlay values  

**Independent Test Criteria**:
- Overlay controls (precipitation, temperature, cloud-cover) appear in Map view
- Only one overlay is active at a time; switching overlays updates the map tiles and legend
- Active layer legend displays correctly with color scale and unit labels
- Clicking/tapping on the map shows inspected value for that location in the active overlay
- Inspected values use Open-Meteo point forecast, not pixel extraction
- Inspected values respect unit preference (Celsius vs. Fahrenheit, mm vs. inches)
- Failed overlay loads emit user-visible errors
- Overlay tiles load only when requested

### User Story 3 Tasks

- [ ] T026 Extend `src/hooks/useMapOverlayState.js` to add overlay state management: activeOverlay, loadedOverlays array, inspection state (latitude, longitude, value, unit, status); trigger overlay tile fetch only when overlay is selected
- [ ] T027 [P] [US3] Create `src/services/overlays.js` export functions to: fetch RainViewer metadata and build precipitation tile URLs, build NASA GIBS tile URLs for temperature and cloud-cover, manage layer availability and error states
- [ ] T028 [P] [US3] Extend `src/components/WeatherMapCanvas.jsx` to support adding/removing overlay tile layers dynamically; render the active overlay on top of the base map; emit click events with latitude/longitude coordinates
- [ ] T029 [P] [US3] Update `src/components/WeatherLayerLegend.jsx` to display detailed legends for each overlay type: Precipitation (with mm/in scale), Temperature (with Celsius/Fahrenheit scale and color gradient), Cloud Cover (with percentage scale)
- [ ] T030 [US3] Create `src/hooks/useOverlayInspection.js` hook to manage point inspection state: fetch Open-Meteo point query when user clicks map, cache results, handle errors, format values for display
- [ ] T031 [US3] Update `src/components/WeatherMapPanel.jsx` to: render overlay toggle controls, manage active overlay switching, handle inspection clicks, display inspected value summary with unit formatting, show overlay load errors
- [ ] T032 [US3] Create integration tests in `tests/integration/OverlayFailureStates.test.jsx` to verify: overlays are selectable, active overlay updates legend, inspection fetch works and displays values, unit conversion applies to inspected values, overlay load errors are handled
- [ ] T033 [US3] Create end-to-end tests in `tests/e2e/map-overlays.spec.js` to verify: user opens Map tab, selects precipitation overlay, sees precipitation tiles and legend, clicks a map point, inspects the value, switches to temperature overlay, and inspected value updates

---

## Phase 6: Polish, Integration & Cross-Cutting Concerns

**Goal**: Ensure all features work together, accessibility is verified, performance targets are met, and documentation is complete  

**Success Criteria**:
- All tabs switch smoothly without data loss
- Tab keyboard navigation follows WAI-ARIA conventions
- Performance targets met: forecast <3s, map <4s, unit toggle <500ms
- Mobile responsive down to 375px; no horizontal scroll
- Error fallbacks are user-friendly and actionable
- Diagnostics logged in dev/test for troubleshooting

### Integration & Polish Tasks

- [ ] T034 Integrate `ResultsViewTabs` into the main App layout to replace or wrap the current weather view; ensure tab switching preserves all state
- [ ] T035 Update `src/App.jsx` to: initialize `useWeather` (current), `useForecastData` (lazy), and `useMapOverlayState` (lazy); pass unit preference to all views; coordinate location changes across all tabs
- [ ] T036 Create `tests/integration/App.test.jsx` update to verify all three views (Current, Forecast, Map) can be opened in sequence, unit toggle affects all, location changes trigger all updates, and errors in one view do not break others
- [ ] T037 Create `tests/e2e/comprehensive-flows.spec.js` to verify multi-view workflows: search location, view current, open forecast, switch units, open map, select overlay, inspect point, change location, verify all views update
- [ ] T038 Add keyboard navigation tests to `tests/integration/App.test.jsx` to verify: Tab key navigates between tablist items, manual activation (no auto-focus), Enter/Space activates tabs, Escape does not close tabs, legend and map controls are reachable
- [ ] T039 Extend `tests/integration/Accessibility.test.jsx` to verify: tab items have `role="tab"`, tabpanels have `role="tabpanel"`, all controls have visible labels, color is not the only indicator in legends, text alternatives exist for icons
- [ ] T040 Create performance measurement test in `tests/e2e/forecast-view.spec.js` and `tests/e2e/map-view.spec.js` to measure and log: forecast view load time from tab activation to content render (target <3s), map view load time from tab activation to visible map (target <4s)
- [ ] T041 Create responsive layout tests in `tests/integration/App.test.jsx` to verify: forecast and map stack vertically on mobile (<600px width), no horizontal scroll on 375px viewport, touch interactions work on mobile viewports
- [ ] T042 Update `src/index.css` and Tailwind config to ensure all new components (tabs, forecast cards, map, legends, overlays) are styled consistently with existing app theme (colors, typography, spacing, dark mode if applicable)
- [ ] T043 Update `src/App.jsx` to add client-side diagnostic logging: log forecast fetch start/end with duration, log map load start/end, log overlay tile requests, log inspection queries; enable logs in dev/test only
- [ ] T044 Create error boundary component or update `ErrorMessage.jsx` to handle loading/error states for all three views with user-friendly, actionable messages (e.g., "Forecast unavailable—try again or use a different location")
- [ ] T045 Update `quickstart.md` with testing instructions: how to run forecast-view.spec.js, map-view.spec.js, map-overlays.spec.js, how to verify performance targets locally, how to enable diagnostics
- [ ] T046 Update repository `README.md` with links to the feature specification, implementation notes on Open-Meteo and Leaflet usage, and explanation of free overlay sources
- [ ] T047 Review all components and services against accessibility checklist: correct heading levels, semantic HTML, focus management, color contrast, label associations; document any deviations
- [ ] T048 Final integration test: run all unit tests, run all integration tests, run Playwright suite end-to-end; verify zero console errors, zero type warnings (if using TypeScript inference), and all tests pass
- [ ] T049 Document known limitations in `quickstart.md` or a DECISIONS.md file: Leaflet does not support WebGL vector rendering (acceptable for raster overlays), RainViewer precision depends on their data refresh rate, NASA GIBS tiles may have latency, OOM risk if many locations are cached in a session

---

## Dependency Graph

```
Phase 1 (Setup)
  └─ Phase 2 (Utilities & Services)
       ├─ Phase 3 (User Story 1: Forecast)
       │   └─ Phase 4 (User Story 2: Map)  [can start in parallel with Phase 3 after Phase 2 completes]
       │       └─ Phase 5 (User Story 3: Overlays)  [depends on Phase 4]
       └─ Phase 6 (Integration & Polish)  [starts after all story phases]
```

**Parallelization Opportunities**:
- All tasks in Phase 2 (utilities/services) are parallelizable: `forecast.js`, `overlays.js`, `requestCache.js`, `forecastTransform.js` can be developed independently
- Tasks T011–T013 (Daily Strip, Hourly Panel, Forecast Panel) can be developed in parallel once `useForecastData` is drafted
- Tasks T019–T021 (Map Canvas, Legend, Fallback) can be developed in parallel once `useMapOverlayState` is drafted
- Tasks T031–T033 (Overlay Panel updates, inspection hook, tests) can be developed in parallel for Story 3

---

## MVP Scope Recommendation

**Phase 1 + Phase 2 + Phase 3** = **Minimum Viable Product**

The MVP delivers User Story 1 (View Extended Forecast) with all dependencies satisfied:
- Reusable utilities and services (Phase 2) ready for future map/overlay work
- Forecast loading, display, unit-aware rendering, and error handling (Phase 3) fully functional
- All story-1-specific tests passing
- Users can search a location and view a 7-day forecast + 24-hour hourly breakdown

Estimated effort: **~40–50 development hours** (covering tasks T001–T017)

**Phases 4–5** add Map and Overlay capabilities in priority order; both can be added incrementally without modifying Phase 3 code.

**Phase 6** is ongoing throughout and finalizes polish, performance, and documentation.

---

## Task Checklist Legend

- **Checkbox** (`- [ ]`): Mark complete as work progresses
- **Task ID** (T001, T002...): Sequential identifier for tracking
- **[P]**: Parallelizable task (can run in parallel with others at same depth)
- **[US#]**: User Story label (US1, US2, US3) for story-phase tasks only
- **Description**: Clear action with file path(s)

**Example Completed Task**:
- [x] T001 Add Leaflet and React-Leaflet to package.json dependencies; run `npm install` to lock versions

---

## File Structure Reference

```
src/
├── components/
│   ├── ResultsViewTabs.jsx          [T014]
│   ├── ForecastPanel.jsx            [T013]
│   ├── DailyForecastStrip.jsx       [T011]
│   ├── HourlyForecastPanel.jsx      [T012]
│   ├── WeatherMapPanel.jsx          [T022, T031]
│   ├── WeatherMapCanvas.jsx         [T019, T028]
│   ├── WeatherLayerLegend.jsx       [T020, T029]
│   └── MapFallbackSummary.jsx       [T021]
├── hooks/
│   ├── useForecastData.js           [T010]
│   ├── useMapOverlayState.js        [T018, T026]
│   └── useOverlayInspection.js      [T030]
├── services/
│   ├── forecast.js                  [T007]
│   └── overlays.js                  [T008, T027]
├── utils/
│   ├── requestCache.js              [T005]
│   ├── forecastTransform.js         [T006]
│   └── unitConversions.js           [T009]
└── App.jsx                          [T015, T023, T035]

tests/
├── unit/
│   ├── requestCache.test.js         [T005]
│   ├── forecastTransform.test.js    [T006]
│   ├── forecastService.test.js      [T007]
│   ├── overlaysService.test.js      [T008]
│   └── unitConversions.test.js      [T009]
├── integration/
│   ├── ForecastView.test.jsx        [T016]
│   ├── MapView.test.jsx             [T024]
│   ├── OverlayFailureStates.test.jsx[T032]
│   ├── App.test.jsx                 [T036, T038, T039, T041]
│   └── Accessibility.test.jsx       [T039]
└── e2e/
    ├── forecast-view.spec.js        [T017, T040]
    ├── map-view.spec.js             [T025, T040]
    ├── map-overlays.spec.js         [T033]
    └── comprehensive-flows.spec.js  [T037]
```

---

## Success Metrics Summary

| # | Metric | Target | Verification |
|---|--------|--------|--------------|
| 1 | Forecast visible after tab switch | <3 sec | Manual timing on documented device |
| 2 | Map visible after tab switch | <4 sec | Playwright perf test |
| 3 | Unit toggle propagation | <500 ms | Playwright timing |
| 4 | Mobile responsive | 375px+ | Integration test on viewport |
| 5 | Test coverage (unit/integration) | >80% | Coverage reports |
| 6 | Lighthouse accessibility | >90 | Automated check |
| 7 | Happy-path API success rate | >95% | Test run statistics |
| 8 | User comprehension (demo) | >90% | Classroom demo observation |

---

## Notes

- **Configuration**: No environment variables or API keys are required. All services are keyless and CORS-safe.
- **Dependencies**: Leaflet, React-Leaflet (added in Phase 1). No additional backend infrastructure.
- **Caching**: In-memory Map + sessionStorage for forecast and point inspection; browser HTTP cache for tiles.
- **Testing**: All unit/integration tests use Vitest + jsdom; e2e uses Playwright. Mock all external API calls in unit/integration; use real API in e2e.
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge). Graceful fallback for unsupported map features.
- **Fallback Path**: MapFallbackSummary provides text alternative when Leaflet unavailable or browser unsupported.
