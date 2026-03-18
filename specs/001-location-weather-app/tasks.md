# Tasks: Location-Based Current Weather App

**Branch**: `001-location-weather-app` | **Date**: 2026-03-17  
**Input**: Design documents from `/specs/001-location-weather-app/` (spec.md, plan.md, research.md, data-model.md, contracts/)

---

## Overview

This project will be built incrementally. Each user story is independently testable and deployable. The MVP is **User Story 1** (P1) — the core search-by-location feature. Additional priorities add geolocation, unit toggle, and recent searches.

**Tech Stack**: React 18 + Vite 5 + Tailwind CSS 3 + Vitest + Testing Library  
**Testing**: Vitest + @testing-library/react + @testing-library/user-event + jsdom  
**APIs**: Open-Meteo (geocoding + weather, no API key)  
**Storage**: `sessionStorage` for unit preference + recent searches

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize the Vite+React+Tailwind environment and basic folder structure

**Checkpoint**: `npm install && npm run dev` works, folder structure in place, no errors

- [x] T001 Initialize Vite + React project with `npm create vite@latest . -- --template react`
- [x] T002 [P] Install dependencies: React 18, Vite 5, Tailwind CSS 3, PostCSS, Autoprefixer
- [x] T003 [P] Install dev dependencies: Vitest, @testing-library/react, @testing-library/user-event, jsdom, @vitest/ui
- [x] T004 [P] Configure Tailwind CSS with `tailwind.config.js` and `postcss.config.js`
- [x] T005 [P] Create folder structure: `src/{components,hooks,services,utils}`, `tests/{unit,integration}`, `public/icons`
- [x] T006 [P] Configure Vitest in `vite.config.js` with jsdom environment and testing library globals
- [x] T007 Create `src/main.jsx` Vite entry point with root element mounting
- [x] T008 Create `src/index.css` with Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- [x] T009 Create `index.html` with root div and script tag
- [x] T010 [P] Create `.gitignore` entries for node_modules, dist, .vite, .env
- [x] T011 Verify: `npm run dev` starts localhost:5173 with working hot reload

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities, services, and infrastructure that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T012 [P] Create `src/utils/wmoConditions.js` with all 27 WMO code → label/icon mappings (see research.md §3)
- [x] T013 [P] Create `src/utils/unitConversions.js` with functions: `celsiusToFahrenheit()`, `fahrenheitToCelsius()`, `kmhToMph()`, `mphToKmh()`, `metresToMiles()`, `metresToKilometers()`, `getWindDirectionLabel(degrees)` (returns one of: N, NE, E, SE, S, SW, W, NW based on 0-360° bearing per data-model.md)
- [x] T014 [P] Create unit tests `tests/unit/wmoConditions.test.js` covering all 27 codes (WRITE TESTS FIRST, expect to fail)
- [x] T015 [P] Create unit tests `tests/unit/unitConversions.test.js` covering all conversion functions with edge cases (WRITE TESTS FIRST, expect to fail)
- [x] T016 Extend `src/index.css` with dark glassmorphism theme styles (dark gradient background, CSS variables, and utility class refinements) after Tailwind directives are in place
- [x] T017 [P] Create `src/services/geocoding.js` with `searchLocations(query)` function calling Open-Meteo Geocoding API (see contracts/api-open-meteo.md)
- [x] T018 [P] Create `src/services/weather.js` with `fetchWeather(latitude, longitude, unit)` function calling Open-Meteo Weather API
- [x] T019 Create `src/hooks/useWeather.js` hook that orchestrates: search → geocode → weather fetch; exposes `{ isLoading, error, currentWeather, selectedLocation, disambiguationList, search(query), selectLocation(location) }` (see data-model.md)
- [x] T020 Create `src/hooks/useGeolocation.js` hook that wraps `navigator.geolocation.getCurrentPosition()`; exposes `{ latitude, longitude, error, isLoading, requestLocation() }` (see research.md §7)
- [x] T021 Create `src/hooks/useRecentSearches.js` hook that reads/writes to `sessionStorage` under key `"weatherapp.recentSearches"`; exposes `{ searches: RecentSearch[], addSearch(location), clear() }` (see data-model.md)

**Checkpoint**: Foundation ready — all utilities tested, all hooks created, services ready for use

---

## Phase 3: User Story 1 - Search Weather by Location Name (Priority: P1) 🎯 MVP

**Goal**: Users can type a city name, submit, and see current weather conditions, or get a friendly error.

**Independent Test**: Enter "Los Angeles" and verify temperature, condition, humidity, wind are displayed. Enter invalid city and verify error message.

### Component Implementation for User Story 1

- [x] T022 [P] Create `src/components/LoadingSpinner.jsx` component with animated spinner and `role="status" aria-live="polite"`
- [x] T023 [P] Create `src/components/ErrorMessage.jsx` component with user-friendly error text and optional dismiss callback button
- [x] T024 [P] Create `src/components/SearchBar.jsx` component: text input + submit button + "Use My Location" button; validates non-empty before submit; exposes `onSearch(query)`, `onUseMyLocation()`, `isLoading` props
- [x] T025 [P] Create `src/components/WeatherCard.jsx` component: displays condition icon (from Meteocons), temperature, feels-like temp, weather condition label, location name, observation time (glassmorphism styling); does NOT display wind direction (handled by WeatherStats)
- [x] T026 [P] Create `src/components/WeatherStats.jsx` component: displays humidity, wind speed + direction (as cardinal labels N/NE/E/SE/S/SW/W/NW), visibility in a horizontal row (glassmorphism styling)
- [x] T027 [P] Create `src/components/LocationPicker.jsx` component: renders list of disambiguated locations; `onSelect(location)` callback on click; keyboard navigable (arrow keys, Enter, Tab)
- [x] T028 Create `src/App.jsx` root component wiring: `useWeather` hook, `useRecentSearches` hook, render SearchBar → LoadingSpinner | ErrorMessage | (WeatherCard + WeatherStats) | LocationPicker
- [x] T029 [P] Refine `src/components/SearchBar.jsx` empty-input UX copy/state (accessible helper message timing and focus behavior)

### Testing for User Story 1 (TDD — write tests FIRST)

- [x] T030 [P] Run test suite and update `src/utils/wmoConditions.js` implementation until T014 assertions pass
- [x] T031 [P] Run test suite and update `src/utils/unitConversions.js` implementation until T015 assertions pass
- [x] T032 Create integration test `tests/integration/SearchBar.test.jsx`: user types "Chicago", submits, mocked geocoding returns 1 result, mocked weather returns data, `WeatherCard` renders temperature and condition
- [x] T033 Create integration test `tests/integration/App.test.jsx` (failure path): user searches "InvalidXYZ", mocked geocoding returns 0 results, `ErrorMessage` is rendered with "location not found" text
- [x] T034 Create integration test `tests/integration/App.test.jsx` (API failure path): mocked geocoding API throws error (HTTP 503), `ErrorMessage` is rendered with an error message and user can try again
- [x] T097 Create integration test `tests/integration/SearchBar.test.jsx` (empty-search edge case): submitting empty/whitespace query does not call geocoding API and shows helper prompt
- [x] T098 Create integration test `tests/integration/SearchBar.test.jsx` (special-character/non-English edge case): query containing accented/non-Latin characters is passed through to geocoding request and handled gracefully
- [x] T087 Create integration test `tests/integration/App.test.jsx` (disambiguation path): mocked geocoding returns 2+ locations, user selects one, weather loads for selected location
- [x] T088 Create integration test `tests/integration/App.test.jsx` (malformed response path): mocked geocoding/weather returns invalid JSON shape, app shows service-unavailable error state
- [x] T093 Implement API timeout handling in `src/services/geocoding.js` and `src/services/weather.js` using `AbortController` with 8-second budget; map timeout to service-unavailable state
- [x] T094 Implement offline detection/error routing in `src/hooks/useWeather.js` (or equivalent) to display network-specific message and retry guidance
- [x] T095 Create integration tests `tests/integration/App.test.jsx` for timeout and offline scenarios: timeout/offline map to FR-008 service-unavailable or network-specific error states

### Final touches for User Story 1

- [x] T035 Verify `npm test` passes all tests for US1
- [x] T036 Manual QA: Open browser, search for a real city, verify all required fields (temp, feels-like, condition, humidity, wind, visibility) are displayed correctly
- [x] T037 Manual QA: Search for invalid location, verify error message is displayed

**Checkpoint**: User Story 1 is complete and independently testable. PM can approve and demo this as MVP.

---

## Phase 4: User Story 2 - Auto-Detect Current Location (Priority: P2)

**Goal**: User clicks "Use My Location" button and weather is automatically displayed for their current position.

**Independent Test**: On a device with location services, click "Use My Location", verify weather appears for detected location.

### Implementation for User Story 2

- [x] T038 Update `src/components/SearchBar.jsx`: refine existing "Use My Location" button behavior to show geolocation loading/error states (button text, disabled state, and accessible status messaging)
- [x] T039 Update `src/hooks/useWeather.js`: add `requestGeolocation()` method that calls `useGeolocation()` hook to get coords, then directly fetches weather (bypassing geocoding); handle geolocation errors gracefully
- [x] T040 Update `src/App.jsx`: wire SearchBar's `onUseMyLocation()` to call `useWeather.requestGeolocation()`, handle geolocation error states
- [x] T091 Update geolocation rendering flow in `src/hooks/useWeather.js`/`src/App.jsx`: derive a human-readable auto-location label from timezone data and fall back to `"Your Location"` when unavailable

### Testing for User Story 2

- [x] T041 Create integration test `tests/integration/App.test.jsx`: mock `navigator.geolocation` to return valid coords, click "Use My Location", verify weather is displayed
- [x] T042 Create integration test `tests/integration/App.test.jsx`: mock `navigator.geolocation` to deny permission, click "Use My Location", verify geolocation error message is displayed
- [x] T043 Create test for older browser (geolocation unavailable): mock `navigator.geolocation` as undefined, verify friendly message is shown
- [x] T092 Create integration test `tests/integration/App.test.jsx`: geolocation success uses timezone-derived label and falls back to `"Your Location"` when label derivation is unavailable

### Final touches for User Story 2

- [x] T044 Manual QA: On a real device (or Chrome dev tools location spoofing), click "Use My Location", verify weather for current location appears

**Checkpoint**: User Story 2 is complete. Both US1 and US2 work independently.

---

## Phase 5: User Story 3 - Switch Between Imperial and Metric Units (Priority: P3)

**Goal**: Users can toggle between °F/mph and °C/km/h; preference is remembered for the session.

**Independent Test**: Load weather, click metric toggle, verify all values convert (° C, km/h, km for visibility) and re-display in <1s with no network call.

### Implementation for User Story 3

- [x] T045 [P] Create `src/components/UnitToggle.jsx` component: toggle between "°F" and "°C"; `unit` prop and `onToggle()` callback
- [x] T046 Update `src/hooks/useWeather.js`: implement `toggleUnits()` method that updates `unitPreference` and recomputes display values locally from normalized metric state (no network request on toggle)
- [x] T047 Update `src/hooks/useRecentSearches.js` to also write/read `sessionStorage` key `"weatherapp.unitPreference"` with value `"imperial"` or `"metric"` (default: `"imperial"`)
- [x] T048 Update `src/App.jsx`: manage `unitPreference` state, pass to `useWeather` hook, render `UnitToggle` in header, call `toggleUnits()` on unit toggle click
- [x] T049 Update `src/components/WeatherCard.jsx` and `WeatherStats.jsx`: accept `unit` prop and format display strings with correct units (e.g., pass `"45°F"` or `"7°C"` for temperature, wind speed as `"12 mph"` or `"19 km/h"`, wind direction as cardinal labels remain unit-agnostic)
- [x] T050 Update `src/services/weather.js`: fetch weather in canonical metric units and normalize API response for client-side display conversion (unit toggle must not trigger additional network requests)

### Testing for User Story 3

- [x] T051 Create integration test `tests/integration/App.test.jsx`: load weather in imperial, click metric toggle, verify all values convert correctly and display with metric units
- [x] T052 Create integration test `tests/integration/App.test.jsx`: toggle unit twice, verify it returns to original state (roundtrip conversion)
- [x] T053 Create integration test: search for new location after toggling to metric, verify new weather also displays in metric (unit preference persists)
- [x] T054 Create test: reload page after toggling to metric, verify metric is still active (sessionStorage persistence)
- [x] T089 Create integration assertion for SC-004: spy on `fetch` during unit toggle and verify no additional network request is made

### Final touches for User Story 3

- [x] T055 Manual QA: Load weather, toggle to metric, verify all numeric values convert and units change (°C, km/h, km)
- [x] T056 Manual QA: Toggle back to imperial, verify conversion is accurate
- [x] T057 Manual QA: Refresh page, verify unit preference is remembered

**Checkpoint**: User Stories 1, 2, and 3 all work independently.

---

## Phase 6: User Story 4 - View Recently Searched Locations (Priority: P4)

**Goal**: Users see up to 5 recent search shortcuts below the search bar; clicking one loads that location's weather immediately.

**Independent Test**: Search for 3 cities, verify all 3 appear as chips/pills below SearchBar, click one, verify weather loads without additional search.

### Implementation for User Story 4

- [x] T058 Create `src/components/RecentSearches.jsx` component: renders horizontal row of pill/chip buttons; each has `onClick` handler; hidden when list is empty
- [x] T059 Update `src/hooks/useRecentSearches.js`: implement `addSearch(location)` to append location to sessionStorage list, drop oldest if >5 entries, handle duplicates (move to front, update timestamp)
- [x] T060 Update `src/hooks/useWeather.js`: after successful weather fetch, call `addSearch(selectedLocation)` to record in recent searches
- [x] T061 Update `src/App.jsx`: pass `recentSearches` from hook to `RecentSearches` component; wire `onSelect` to call `useWeather.selectLocation()` for direct weather fetch
- [x] T062 Update `src/components/RecentSearches.jsx`: each chip is a `<button>` with `aria-label="Show weather for {displayName}"`

### Testing for User Story 4

- [x] T063 Create integration test `tests/integration/App.test.jsx`: search for city A, search for city B, search for city C, verify all 3 appear in recent searches list
- [x] T064 Create test: search for city A, click in recent searches, verify weather loads immediately without a new search request
- [x] T065 Create test: search for 6 different cities, verify only 5 most recent are shown (oldest drops off)
- [x] T066 Create test: search for same city twice, verify it appears once in recent (not duplicated) and is at the front

### Final touches for User Story 4

- [x] T067 Manual QA: Perform several searches, verify recent list populates and updates correctly
- [x] T068 Manual QA: Click a recent search, verify weather loads without a new search input
- [x] T069 Manual QA: Refresh page, verify recent searches are preserved (sessionStorage persists)

**Checkpoint**: All 4 user stories are complete and independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsive design, documentation, and final validation

- [x] T070 [P] Accessibility audit: verify all interactive elements are keyboard navigable (Tab, Enter, Space, Arrow keys)
- [x] T071 [P] Accessibility audit: verify all non-decorative icons have `alt` text or `aria-label`
- [x] T072 [P] Accessibility audit: verify color contrast ratios meet WCAG 2.1 AA (minimum 4.5:1 for normal text) — run automated tool or manual check
- [ ] T073 [P] Accessibility audit: test with screen reader (NVDA or JAWS) to verify landmark structure and button/link labels
- [x] T074 Mobile responsiveness: test on viewport sizes 320px (phone), 768px (tablet), 1920px (desktop widescreen) — verify layout adapts correctly
- [x] T075 Test geolocation behavior on mobile device (iOS/Android) — verify permission flow works
- [x] T076 Update `README.md` in repository root: add "Installation", "Running Locally", "Testing", "Building" sections with commands from quickstart.md
- [x] T077 Verify `npm run build` produces valid `dist/` output with no errors
- [x] T078 Verify `.gitignore` includes `dist/`, `.vite/`, `node_modules/`, and `.env*`; update only if any entry is missing
- [x] T079 Run full test suite: `npm test` passes all unit + integration tests
- [x] T080 Performance check: verify 5s target for weather display on broadband (use Chrome DevTools Network throttling)
- [x] T081 Cross-browser test: verify app works on Chrome, Firefox, Safari, Edge (latest versions)
- [x] T082 Final code review: check for console errors/warnings, unused imports, code style consistency
- [x] T083 Validate with quickstart.md: fresh clone, `npm install`, `npm run dev`, test all core flows (search, geolocation, unit toggle, recent searches)
- [x] T084 Create integration test `tests/integration/LocationSearch.test.jsx`: query 20 real valid locations via Open-Meteo Geocoding API (e.g., "New York", "London", "Tokyo") to verify SC-003 (95% success rate achieved with real data)
- [x] T085 Create performance validation for SC-007 in two parts: automated mocked pipeline timing plus manual real-device protocol (permission prompt through weather render) with recorded evidence for <8s target
- [x] T086 Add SC-006 UX validation with objective checks: exact label text, visible in initial viewport at 320px/768px/1920px, and first tabbable actionable control on initial load (plus screenshot evidence)
- [x] T090 Validate geolocation runtime requirements: confirm HTTPS/localhost requirement is documented and geolocation error messaging covers insecure-context/unavailable API cases
- [x] T096 Strengthen SC-005 oracle: add canonical WMO fixture assertions (code -> exact label + exact icon id) to validate icon/label correctness for all supported conditions

**Checkpoint**: Feature complete, tested, documented, and ready for local/demo release validation.

---

## Dependencies & Parallel Opportunities

### Phase Dependencies

| Phase | Depends On | When Can It Start |
|-------|-----------|-------------------|
| Phase 1 (Setup) | Nothing | Immediately |
| Phase 2 (Foundational) | Phase 1 complete | After Setup done |
| Phase 3 (US1) | Phase 2 complete | After Foundational done |
| Phase 4 (US2) | Phase 2 complete | After Foundational done (can start in parallel with US1 if staffed) |
| Phase 5 (US3) | Phase 2 complete | After Foundational done (can start after US1 is mostly complete) |
| Phase 6 (US4) | Phase 2 complete | After Foundational done (can start after US1 is mostly complete) |
| Phase 7 (Polish) | All stories complete | After Phases 3–6 done |

### User Story Independence

Once Phase 2 (Foundational) is complete:
- **US1 (P1)** and **US2 (P2)** can be developed in parallel by different developers
- **US3 (P3)** and **US4 (P4)** can start once US1 has basic structure, as they only add to or integrate with US1
- Each story is independently testable and can be demoed separately

### Within-Phase Parallelization Examples

**Phase 1 (Setup)**:
```
T002, T003, T004, T005, T006, T010 can run in parallel (different npm tasks, config files)
```

**Phase 2 (Foundational)**:
```
T012, T013, T014, T015 (WMO + unit conversion) can run in parallel
T017, T018 (service modules) can run in parallel
T019, T020, T021 (hooks) can run in parallel after services are done
```

**Phase 3 (US1 Components)**:
```
T022, T023, T024, T025, T026, T027 can run in parallel (different components)
```

**Phase 7 (Polish)**:
```
T070, T071, T072, T073, T074, T075 (accessibility + responsive) can run in parallel
T079 (tests) must wait for implementation to be complete
```

---

## MVP Scope

The minimal viable product is **Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**:

1. ✅ Users can type a city name
2. ✅ Users see current weather (temperature, feels-like, condition, humidity, wind, visibility)
3. ✅ Users get error messages for invalid locations
4. ✅ Works on desktop and mobile (responsive)
5. ✅ Accessible (keyboard nav, WCAG 2.1 AA)

All other user stories (geolocation, unit toggle, recent searches) are valuable enhancements.

---

## Implementation Strategy

### Option A: Sequential (Single Developer)

1. Phases 1 → 2 → 3 → 4 → 5 → 6 → 7
2. Estimated: 3–4 weeks, one feature at a time
3. Advantage: Simple linear flow
4. Disadvantage: Slower time-to-MVP

### Option B: Parallel Stories (Multiple Developers)

1. One person: Phase 1 + 2 (shared foundation)
2. Parallel (once Phase 2 done):
   - Developer A: Phase 3 (US1)
   - Developer B: Phase 4 (US2) or Phase 5 (US3)
3. Once US1 passes QA, remaining stories integrate
4. Phase 7 (Polish) is done together
5. Estimated: 1.5–2 weeks, all stories built incrementally

### Option C: MVP-First (Delivery Focus)

1. Complete Phases 1 + 2 + 3 → Deploy/Demo MVP
2. Gather feedback
3. Complete Phases 4 + 5 + 6 → Enhance and re-deploy
4. Complete Phase 7 → Final polish and release
5. Estimated: 1 week for MVP, +1 week for full feature
