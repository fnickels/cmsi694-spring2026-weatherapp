# Tasks: Weather Forecast & Maps Display

**Input**: Design documents from `/specs/004-forecast-maps-display/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include automated tests because the specification and constitution require happy-path and failure-path coverage.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and demonstrated independently.

## Phase 1: Setup

**Purpose**: Install and wire project dependencies required for forecast and map delivery.

- [ ] T001 Add `leaflet` and `react-leaflet` runtime dependencies in `package.json`
- [ ] T002 Import Leaflet CSS in `src/main.jsx`

**Checkpoint**: The project can build with Leaflet installed and its CSS loaded.

---

## Phase 2: Foundational

**Purpose**: Shared utilities, validation, and service contracts that block all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 [P] Create in-memory and `sessionStorage` cache helpers in `src/utils/requestCache.js`
- [ ] T004 [P] Create forecast response normalization helpers in `src/utils/forecastTransform.js`
- [ ] T005 [P] Create cache helper tests in `tests/unit/requestCache.test.js`
- [ ] T006 [P] Create forecast transform tests in `tests/unit/forecastTransform.test.js`
- [ ] T007 Create validated Open-Meteo forecast and point-inspection service functions in `src/services/forecast.js`
- [ ] T008 [P] Create forecast service validation and timeout tests in `tests/unit/forecastService.test.js`
- [ ] T009 Create exact overlay provider configuration, pinned NASA GIBS layer IDs, and URL builders in `src/services/overlays.js`
- [ ] T010 [P] Create overlay service tests for RainViewer metadata parsing and GIBS layer config in `tests/unit/overlaysService.test.js`

**Checkpoint**: Cache, transform, forecast, and overlay services are implemented with explicit input validation and test coverage.

---

## Phase 3: User Story 1 - View Extended Forecast After Location Selection (Priority: P1) 🎯 MVP

**Goal**: Let users open a Forecast tab after current weather loads and view a 7-day daily forecast plus a 24-hour hourly drill-down.

**Independent Test**: Search for a city, open Forecast, verify daily and hourly forecast content renders correctly, and confirm unit toggling updates all forecast values.

### Tests for User Story 1

- [ ] T011 [P] [US1] Create Forecast tab integration coverage in `tests/integration/ForecastView.test.jsx`
- [ ] T012 [P] [US1] Create end-to-end forecast flow coverage in `tests/e2e/forecast-view.spec.js`

### Implementation for User Story 1

- [ ] T013 [US1] Create accessible result view tabs in `src/components/ResultsViewTabs.jsx`
- [ ] T014 [P] [US1] Create lazy forecast data hook in `src/hooks/useForecastData.js`
- [ ] T015 [P] [US1] Create daily forecast summary strip in `src/components/DailyForecastStrip.jsx`
- [ ] T016 [P] [US1] Create hourly forecast drill-down panel in `src/components/HourlyForecastPanel.jsx`
- [ ] T017 [US1] Create forecast container with loading, retry, and error states in `src/components/ForecastPanel.jsx`
- [ ] T018 [US1] Integrate `ResultsViewTabs` and `ForecastPanel` into `src/App.jsx`

**Checkpoint**: User Story 1 is fully functional and testable as the MVP increment.

---

## Phase 4: User Story 2 - View Interactive Map Showing Location (Priority: P2)

**Goal**: Let users open a Map tab and view an interactive map centered on the selected location with a marker, zoom/pan support, and graceful fallback states.

**Independent Test**: Search for a city, open Map, verify the map centers on the location with a marker, and confirm the map does not initialize before the Map tab is opened.

### Tests for User Story 2

- [ ] T019 [P] [US2] Create base map integration coverage in `tests/integration/MapView.test.jsx`

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create base map state management hook in `src/hooks/useMapOverlayState.js`
- [ ] T021 [P] [US2] Create map fallback summary component in `src/components/MapFallbackSummary.jsx`
- [ ] T022 [US2] Create Leaflet map adapter with marker and click passthrough in `src/components/WeatherMapCanvas.jsx`
- [ ] T023 [US2] Create lazy-loaded map panel with fallback handling in `src/components/WeatherMapPanel.jsx`
- [ ] T024 [US2] Integrate `WeatherMapPanel` into `src/App.jsx`

**Checkpoint**: User Story 2 is fully functional and independently testable.

---

## Phase 5: User Story 3 - View Forecast on Map with Regional Weather Pattern (Priority: P3)

**Goal**: Add switchable precipitation, temperature, and cloud-cover overlays with legends and click/tap inspection on the map.

**Independent Test**: Open Map, switch each overlay, verify legend updates, click or tap the map, and confirm an inspected overlay summary appears outside the map surface.

### Tests for User Story 3

- [ ] T025 [P] [US3] Create overlay failure-path integration coverage in `tests/integration/OverlayFailureStates.test.jsx`
- [ ] T026 [P] [US3] Create end-to-end overlay switching and inspection coverage in `tests/e2e/map-overlays.spec.js`

### Implementation for User Story 3

- [ ] T027 [P] [US3] Create overlay legend component in `src/components/WeatherLayerLegend.jsx`
- [ ] T028 [US3] Extend overlay rendering and switching in `src/components/WeatherMapCanvas.jsx`
- [ ] T029 [US3] Extend inspection fetching, coordinate validation, and caching in `src/hooks/useMapOverlayState.js`
- [ ] T030 [US3] Extend overlay controls, legend display, and inspection summary in `src/components/WeatherMapPanel.jsx`
- [ ] T031 [US3] Wire overlay control and inspection state into `src/App.jsx`

**Checkpoint**: User Story 3 is fully functional and independently testable.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Close the remaining compliance, measurement, accessibility, responsiveness, and consistency work across all stories.

- [ ] T032 [P] Document no-key external service usage and local verification steps in `README.md` and `specs/004-forecast-maps-display/quickstart.md`
- [ ] T033 [P] Document measurement protocol for SC-002, SC-003, SC-004, and SC-008 in `README.md` and `specs/004-forecast-maps-display/quickstart.md`
- [ ] T034 [P] Audit and fix responsive layout and keyboard behavior in `src/components/ResultsViewTabs.jsx`, `src/components/DailyForecastStrip.jsx`, `src/components/HourlyForecastPanel.jsx`, `src/components/WeatherMapPanel.jsx`, and `src/components/WeatherLayerLegend.jsx`
- [ ] T035 [P] Apply existing visual styling and attribution requirements in `src/components/ForecastPanel.jsx`, `src/components/WeatherMapPanel.jsx`, `src/components/WeatherMapCanvas.jsx`, and `src/components/MapFallbackSummary.jsx`
- [ ] T036 Verify shared loading and error presentation reuse existing components in `src/components/ForecastPanel.jsx`, `src/components/WeatherMapPanel.jsx`, `tests/integration/ForecastView.test.jsx`, and `tests/integration/MapView.test.jsx`

---

## Dependencies

### Story Completion Order

```text
Phase 1: Setup
  -> Phase 2: Foundational
    -> Phase 3: User Story 1 (MVP)
      -> Phase 4: User Story 2
        -> Phase 5: User Story 3
          -> Final Phase: Polish & Cross-Cutting Concerns
```

### Phase Dependencies

- Setup tasks T001-T002 must complete before any Leaflet-backed work begins.
- Foundational tasks T003-T010 must complete before story implementation begins.
- User Story 1 must complete before User Story 2 because tabs and forecast result-view structure are shared.
- User Story 2 must complete before User Story 3 because overlay rendering and inspection extend the base map view.
- Final-phase tasks depend on completed behavior in at least one user story, and most depend on all stories being implemented.

### Intra-Phase Parallel Opportunities

- In Phase 2, T003-T006, T008, and T010 can proceed in parallel because they target separate files.
- In Phase 3, T011 and T012 can proceed in parallel; T014-T016 can proceed in parallel once T013 defines the tab contract.
- In Phase 4, T019-T021 can proceed in parallel; T022-T024 then follow.
- In Phase 5, T025-T027 can proceed in parallel; T028-T031 then follow in order.
- In the Final Phase, T032-T035 can proceed in parallel; T036 should finish last.

## Parallel Execution Examples

### User Story 1

```text
T011 + T012 + T014 + T015 + T016
  -> T017
  -> T018
```

### User Story 2

```text
T019 + T020 + T021
  -> T022
  -> T023
  -> T024
```

### User Story 3

```text
T025 + T026 + T027
  -> T028
  -> T029
  -> T030
  -> T031
```

## Implementation Strategy

### MVP First

- Complete T001-T018 to deliver the forecast experience as the first independently shippable increment.

### Increment 2

- Complete T019-T024 to add the interactive base map without overlays.

### Increment 3

- Complete T025-T031 to add overlays, legends, and point inspection.

### Finalization

- Complete T032-T036 to close compliance, measurement, accessibility, and styling gaps.

## Summary

| Metric | Value |
|--------|-------|
| Total task count | 36 |
| Setup task count | 2 |
| Foundational task count | 8 |
| User Story 1 task count | 8 |
| User Story 2 task count | 6 |
| User Story 3 task count | 7 |
| Polish task count | 5 |
| Parallel opportunities identified | 21 tasks marked `[P]` |
| Suggested MVP scope | T001-T018 |

## Independent Test Criteria by Story

- **US1**: Search for a location, open Forecast, verify daily and hourly forecast render and unit toggling updates the forecast.
- **US2**: Search for a location, open Map, verify map centering, marker presence, and lazy initialization behavior.
- **US3**: Open Map, switch overlays, verify legend changes, and inspect a clicked or tapped point.
