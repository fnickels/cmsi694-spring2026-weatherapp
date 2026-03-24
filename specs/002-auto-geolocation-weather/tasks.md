---
description: "Task list for Auto-Detect Weather on First Visit feature"
---

# Tasks: Auto-Detect Weather on First Visit

**Input**: Design documents from `/specs/002-auto-geolocation-weather/`  
**Branch**: `002-auto-geolocation-weather`  
**Status**: Ready for implementation  
**Prerequisites**: spec.md ✓, plan.md ✓

**Testing Strategy**: All test tasks below are optional. Include them if practicing TDD (Test-Driven Development); otherwise, implement features first and add tests afterward.

## Format: `[ID] [P?] [Story] Description`

- **[ID]**: Task identifier (T001, T002, etc.)
- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story this belongs to (US1, US2, US3)
- **Description**: Clear action with exact file path

---

## Phase 1: Setup (Environment & Scaffolding)

**Purpose**: Verify project dependencies and existing structure are ready

**Status**: Already complete from feature 001 baseline

- [x] T001 Project initialized with React 18, Vite, Tailwind CSS
- [x] T002 Node modules installed and test framework (Vitest, React Testing Library) configured
- [x] T003 Existing hooks (useWeather, useGeolocation) available in src/hooks/

**→ Foundation Ready**: Existing infrastructure can support first-load geolocation feature

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state management and hooks that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create `src/hooks/useInitialLocation.js` hook skeleton: set up InitialVisitContext state shape, 8-second timeout infrastructure (timer logic, clearTimeout on unmount), and hook export interface — **no live `navigator.geolocation` call yet** (that goes in T009)
- [x] T005 [P] Extend or create `src/utils/locationState.js` utility to define InitialVisitContext structure with status flags: `{ attempted, granted, denied, timedOut, unavailable, coordinates, error }`
- [x] T006 Update `src/App.jsx` to initialize useInitialLocation on component mount and wire detected coordinates into useWeather hook
- [x] T007 Create `src/components/InitialLoadingIndicator.jsx` component to display loading state during first-load geolocation + weather fetch (supports FR-009)
- [x] T008 Add conditional rendering helper in `src/App.jsx` to show InitialLoadingIndicator vs. ErrorMessage vs. normal WeatherCard based on initial visit state — *Depends on T006, cannot parallelize*

**Checkpoint**: App can track first-load geolocation state and integrate it into render flow

---

## Phase 3: User Story 1 - Auto-Populate Local Weather (Priority: P1) 🎯 MVP

**Goal**: When a visitor opens the site with location access enabled, weather data for their detected location appears automatically without manual input.

**Covers**: FR-001, FR-002, FR-003, FR-009 (loading state)

**Independent Test Criterion**: Open site in browser with location enabled → weather for detected location displayed automatically within 6s.

### Implementation for User Story 1

- [x] T009 [US1] Wire live `navigator.geolocation.getCurrentPosition()` call into `src/hooks/useInitialLocation.js`, using the timeout infrastructure from T004; set state based on success/error callback outcomes (FR-001) — *Depends on T004*
- [x] T010 [US1] Connect detected coordinates to `useWeather` hook to fetch weather data automatically on successful geolocation; trigger weather fetch synchronously on coordinate resolution (not queued) to support the 6s target in SC-001 (FR-002)
- [x] T011 [P] [US1] Update `src/components/WeatherCard.jsx` to accept and display `source: 'auto-detected'` flag (FR-003)
- [x] T012 [P] [US1] Create visual indicator badge/label near location name in WeatherCard showing "Detected" or "Auto-located" (FR-003 placement requirement)
- [x] T049 [P] [US1] Display resolved city label from geocoding reverse-lookup in `src/components/WeatherCard.jsx`; if no city is returned (coordinates only), render "Location (approximate)" to cover the edge case where geolocation maps to a nearby city rather than the exact user location
- [ ] T013 [US1] Test auto-load flow: manual browser geolocation allow → verify weather displays within 6s in Chrome/Firefox/Safari

### Tests for User Story 1

- [x] T014 [P] [US1] **Required (Constitution IV — happy-path)**: Write integration test in `tests/integration/auto-detect-success.test.jsx`: simulate `navigator.geolocation` successful response → assert weather data rendered with source='auto-detected'
- [x] T015 [P] [US1] Write e2e test in `tests/e2e/auto-geolocation-flows.spec.js`: use Playwright to grant location permission → verify weather card visible within 6s *(optional)*

**Checkpoint**: User Story 1 complete - first-load auto-weather works for permission-granted case

---

## Phase 4: User Story 2 - Graceful Fallback Without Location (Priority: P2)

**Goal**: When location permission is denied or unavailable, the site remains fully usable and directs users to manual search.

**Covers**: FR-001 (timeout), FR-004, FR-005, FR-008

**Independent Test Criterion**: Deny location permission → verify clear fallback message and manual search fully functional.

### Implementation for User Story 2

- [x] T016 [US2] Implement geolocation permission denial handling in `src/hooks/useInitialLocation.js`: update context state to `{ denied: true }` and stop retrying
- [x] T017 [US2] Create graceful fallback UI in `src/components/GeolocationDeniedNotice.jsx` with user-friendly explanation and optional search encouragement
- [x] T018 [P] [US2] Update `src/App.jsx` to display GeolocationDeniedNotice when permission denied, without blocking SearchBar or WeatherCard render
- [x] T019 [P] [US2] Handle geolocation unavailable/unsupported in `src/hooks/useInitialLocation.js`: set `{ unavailable: true }` and skip auto-detection
- [x] T020 [P] [US2] Implement timeout behavior in `src/hooks/useInitialLocation.js`: after 8s without geolocation response, treat as failure and show fallback
- [x] T021 [US2] Update `src/components/ErrorMessage.jsx` to accept a geolocation error type and show distinct user-facing messages: *"Location access was denied — try entering a city name below"* (permission denied), *"Location request timed out — please enter your location"* (timeout), *"Weather service is temporarily unavailable"* (service error) (FR-008)
- [x] T022 [US2] Ensure SearchBar remains active/focusable at all times during initial load state (FR-005, accessibility)
- [ ] T023 [US2] Test fallback flows: deny permission → verify notice shown and search works; simulate unavailable geolocation → verify auto-detect skipped

### Tests for User Story 2

- [x] T024 [P] [US2] **Required (Constitution IV — failure-path)**: Write integration test in `tests/integration/fallback-denied.test.jsx`: simulate `navigator.geolocation` permission deny → assert notice rendered and SearchBar functional
- [x] T025 [P] [US2] Write integration test in `tests/integration/fallback-denied.test.jsx`: mock `navigator.geolocation` as undefined → assert auto-detect skipped *(optional)*
- [x] T026 [P] [US2] Write e2e test in `tests/e2e/auto-geolocation-flows.spec.js`: deny location → verify notice appears and manual search works *(optional)*
- [x] T027 [P] [US2] Write e2e test in `tests/e2e/auto-geolocation-flows.spec.js`: mock slow geolocation → verify timeout after 8s and fallback triggered *(optional)*

**Checkpoint**: User Story 2 complete - fallback paths work for denied/unavailable/timeout cases

---

## Phase 5: User Story 3 - Respect User Control After Auto-Load (Priority: P3)

**Goal**: After auto-detected weather is shown, users can search for a different location and have that choice preserved; auto-detection does not override user input.

**Covers**: FR-006, FR-007, FR-010

**Independent Test Criterion**: Auto-detect loads weather for location A → user searches location B → weather switches to B and does not revert.

### Implementation for User Story 3

- [x] T028 [US3] Create `userManuallySelected` flag in initial state shape (`src/utils/locationState.js`) to track if user has overridden auto-detected location
- [x] T029 [US3] Update `src/App.jsx` to set `userManuallySelected = true` when SearchBar submits a new location (FR-007, preserve user choice)
- [x] T030 [US3] Add guard in `useInitialLocation` hook: once `userManuallySelected` is true, never re-trigger initial auto-detection during page session (FR-007)
- [x] T031 [P] [US3] Implement "Use My Location" button re-prompt in `src/components/SearchBar.jsx` or `src/hooks/useGeolocation.js`: if user previously denied, clicking button must call `navigator.geolocation.getCurrentPosition()` again to trigger a fresh browser permission prompt (FR-010) — note: `navigator.permissions.query()` only reads permission state, it does not prompt
- [x] T032 [US3] Test user control: auto-detect loads weather for SF → enter "New York" → weather switches to NY; verify auto-detect does not override (no re-fetch with SF coords)
- [x] T033 [US3] Test re-prompt: deny location on load → click "Use My Location" → verify re-prompt, allow it → weather loads for new location

### Tests for User Story 3 (Optional - TDD approach)

- [x] T034 [P] [US3] Write integration test in `tests/integration/user-control.test.jsx`: auto-detect location A → search location B → assert weather shows B and no auto-override
- [x] T035 [P] [US3] Write integration test in `tests/integration/user-control.test.jsx`: deny location → click "Use My Location" → simulate allow → assert weather loads
- [x] T036 [P] [US3] Write e2e test in `tests/e2e/auto-geolocation-flows.spec.js`: auto-detect → manual search → verify no override
- [x] T037 [P] [US3] Write e2e test in `tests/e2e/auto-geolocation-flows.spec.js`: deny, click button, re-prompt allow, verify load

**Checkpoint**: User Story 3 complete - user control and re-prompt flows work

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Test coverage, documentation, and refinements affecting all phases

- [x] T038 [P] Run existing test suite (`npm test`) to confirm no regressions in feature 001 (location search, unit toggle, recent searches)
- [x] T039 [P] Run e2e baseline tests (`npm run e2e`) against all major browsers to verify existing core flows still pass
- [x] T040 Add comprehensive error messages in `src/components/ErrorMessage.jsx` covering all geolocation error types: denied, unavailable, timeout, service error (FR-004, FR-008)
- [x] T041 [P] Update `src/components/LoadingSpinner.jsx` or create variant for initial-load state animation to distinguish from mid-search loading
- [x] T042 Verify keyboard navigation through initial-load flow: Tab through search, buttons remain accessible at all times (WCAG 2.1 AA for FR-005)
- [ ] T043 [P] Test on mobile browsers (iOS Safari, Android Chrome) with actual geolocation to verify permission prompts and behavior
- [x] T044 Update README.md with note: "On localhost, geolocation works reliably. On deployed sites, HTTPS required for geolocation API."
- [x] T045 Create `specs/002-auto-geolocation-weather/quickstart.md` with manual test steps: (1) open site, allow location → expect auto-weather; (2) deny location → expect fallback; (3) auto-detect, then search new location → expect new weather
- [ ] T046 [P] Performance audit: verify initial auto-detect + weather fetch completes within 6s on throttled 3G network using Chrome DevTools
- [x] T047 Add comments to `src/hooks/useInitialLocation.js` documenting the 8-second timeout, InitialVisitContext shape, and session scope assumption
- [x] T048 Run accessibility audit with `npm test -- vitest-axe` to confirm auto-loaded weather meets WCAG contrast and labeling standards

**Checkpoint**: Feature complete, tested, documented, and ready for merge

---

## Dependencies & Execution Strategy

### Strict Ordering (Cannot Parallelize)

1. **Phase 1** (Setup) → already complete ✓
2. **Phase 2** (Foundational) → T004–T008 MUST complete before any user story starts
3. **Phase 3+ (User Stories)** → Can start after Phase 2, can run in parallel if team available

### Parallel Opportunities (After Foundational Completes)

- **Within Phase 2**: T004, T005 can run in parallel (separate files); T007 can also run in parallel; T008 must follow T006 (same file, depends on state wired in T006)
- **Within Phase 3 (US1)**: T011, T012 can run in parallel (different components)
- **Within Phase 4 (US2)**: T016, T019, T020 can run in parallel (hook method separation)
- **Within Phase 5 (US3)**: T031 can start while T028–T030 in progress (SearchBar vs. state)
- **All Test Tasks**: T014–T015, T024–T027, T034–T037 can all run in parallel (different test files)
- **Phase 6 Polish**: Most tasks marked [P] can run in parallel

### Recommended MVP Scope

**Minimum Viable Product (for first demo):**  
Phases 1–3 (Setup + Foundational + User Story 1)

- Feature delivers core value: auto-weather appears on open
- Covers FR-001, FR-002, FR-003, FR-009
- ~9 implementation tasks (T004–T010, T049)
- Estimated effort: 2–3 days for experienced React dev

**Extended MVP (if time allows):**  
Phases 1–4 (add User Story 2 fallback)

- Adds robustness: graceful failure and manual search always available
- Covers all FR-001 through FR-008
- Additional ~8 tasks (T016–T023)
- Estimated effort: +2 days

**Full Feature (all phases):**  
Phases 1–6 (complete + polish)

- Adds user control preservation and re-prompt flow
- Polish, documentation, cross-browser testing
- Full ~49 tasks
- Estimated effort: +1–2 days

---

## Task Recap Table

| Phase | Tasks | Story | Goal |
|-------|-------|-------|------|
| 1 | T001–T003 | — | Setup (✓ done) |
| 2 | T004–T008 | — | Foundational hooks & state (BLOCKING) |
| 3 | T009–T015, T049 | US1 (P1) | Auto-weather on open |
| 4 | T016–T027 | US2 (P2) | Graceful fallback |
| 5 | T028–T037 | US3 (P3) | User control & re-prompt |
| 6 | T038–T048 | — | Polish & documentation |
| **Total** | **49 tasks** | **3 stories** | **Full feature delivery** |

---

## Implementation Checklist

Before marking a phase complete:

- [ ] All non-test tasks in phase have code committed
- [ ] Existing feature 001 tests still pass (`npm test`)
- [ ] New functionality testable manually or via new tests
- [ ] File paths match project structure (src/, tests/)
- [ ] Hooks properly integrated with App.jsx
- [ ] Error messaging is user-friendly
- [ ] Performance goals tracked (6s target for US1)
