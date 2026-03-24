# Tasks: Initial Location from Geolocation

**Input**: Design documents from `/specs/003-initial-geolocation-source/`  
**Branch**: `003-initial-geolocation-source`  
**Status**: Implemented (T010, T035 pending)  
**Prerequisites**: spec.md ✓, plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Testing Strategy**: Tests are required for this feature; happy-path and failure-path coverage of geolocation-first initialization are explicitly mandated by constitution Principle IV.

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Parallelizable — different files, no blocking dependency on an in-progress task
- **[US#]**: User story this task belongs to (US1, US2, US3)
- Setup and Foundational tasks carry no story label

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare contract scaffolding and test helpers required by all stories.

- [x] T001 Define initial geolocation state-machine test matrix in specs/003-initial-geolocation-source/contracts/initial-location-flow.md
- [x] T002 [P] Add geolocation-first test fixtures and navigator mock helpers in tests/setup.js
- [x] T003 [P] Add contract assertion utilities for initial-location flow in tests/integration/auto-detect-success.test.jsx

**→ Setup Ready**: Test infrastructure and contract documentation in place.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared state model and orchestration boundaries required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Implement `InitialLocationAttempt` state constants and all valid transitions (`idle → requesting_permission → locating → success|denied|timeout|unavailable|failed → fallback`) in src/utils/locationState.js
- [x] T005 [P] Normalize geolocation error classification (`permission_denied`, `position_unavailable`, `timeout`, `unknown`) in src/hooks/useGeolocation.js
- [x] T006 [P] Add first-load orchestration interface exposing `InitialVisitContext` and `markUserManuallySelected()` in src/hooks/useInitialLocation.js
- [x] T007 Wire `isAuthoritativeManualSelection` authority flag into weather state in src/hooks/useWeather.js
- [x] T008 Add non-blocking initial loading/fallback conditional rendering shell in src/App.jsx

**→ Foundation Ready**: All user stories can now proceed.

---

## Phase 3: User Story 1 - Accurate Auto-Detected Start Location (Priority: P1) 🎯 MVP

**Goal**: First weather result uses coordinate-based geolocation on initial page load when permission is granted.

**Covers**: FR-001, FR-002, FR-003, FR-006

**Independent Test Criterion**: Open site in fresh browser context with location enabled → weather for detected coordinates loads automatically without any manual search within 6s.

### Tests for User Story 1

- [x] T009 [P] [US1] **Required (Constitution IV — happy path)**: Add integration test for first-load permission-granted auto-detect flow in tests/integration/auto-detect-success.test.jsx
- [ ] T010 [P] [US1] Add e2e scenario for first-load geolocation success with location granted in tests/e2e/auto-geolocation-flows.spec.js

### Implementation for User Story 1

- [x] T011 [US1] Request `navigator.geolocation.getCurrentPosition()` immediately on first page load in src/hooks/useInitialLocation.js
- [x] T012 [US1] Enforce 5-second initial geolocation timeout using `INITIAL_GEOLOCATION_TIMEOUT_MS = 5000` in src/hooks/useInitialLocation.js
- [x] T013 [US1] Trigger coordinate-based weather fetch via `useWeather` on successful `granted` state transition in src/hooks/useWeather.js
- [x] T014 [US1] Render visible in-progress spinner during initial geolocation pending state in src/components/InitialLoadingIndicator.jsx
- [x] T015 [US1] Integrate initial geolocation loading and success rendering conditions in src/App.jsx

**→ Checkpoint**: US1 independently functional and testable.

---

## Phase 4: User Story 2 - Resilient Fallback on Denial or Failure (Priority: P2)

**Goal**: Denial, timeout, unavailable, and unknown failure paths leave manual search fully usable with no substitute auto-load — matching all 4 error classes in `contracts/geolocation-error-contract.md`.

**Covers**: FR-004, FR-005, FR-007, FR-009, FR-010, FR-012

**Independent Test Criterion**: Deny permission or simulate geolocation failure → verify recoverable fallback message appears and manual location search completes without page reload.

### Tests for User Story 2

- [x] T016 [P] [US2] **Required (Constitution IV — failure path)**: Add integration test for denial fallback and manual-search usability in tests/integration/fallback-denied.test.jsx
- [x] T017 [P] [US2] Add integration test for 5-second timeout fallback state transition in tests/integration/App.test.jsx
- [x] T018 [P] [US2] Add e2e denial/fallback flow validation in tests/e2e/core-flows.spec.js

### Implementation for User Story 2

- [x] T019 [US2] Implement `manual_only` fallback state with no browser-locale or fixed-default substitute in src/hooks/useInitialLocation.js
- [x] T020 [US2] Enforce `LocationSourcePolicy.failureFallback = manual_only` — block any non-user weather auto-load on geolocation failure in src/App.jsx
- [x] T021 [US2] Differentiate geolocation-access errors (`permission_denied`, `timeout`, `unavailable`) from weather-service errors in src/components/ErrorMessage.jsx
- [x] T022 [US2] Ensure manual location search `SearchBar` remains enabled and focusable across all fallback states in src/components/SearchBar.jsx
- [x] T023 [US2] Implement retry-on-click geolocation attempt after denial — each click on Use My Location calls `getCurrentPosition()` again in src/hooks/useGeolocation.js

**→ Checkpoint**: US1 and US2 both independently functional.

---

## Phase 5: User Story 3 - Preserve User Control After Initial Load (Priority: P3)

**Goal**: Late geolocation results auto-apply only when no manual selection has been made; once manual selection is authoritative, late geolocation cannot override it.

**Covers**: FR-008, FR-011; state transitions S5, S6, S7 from `contracts/initial-location-flow.md`

**Independent Test Criterion**: Allow auto-detect → manually search a different location → confirm manual location stays active even if late geolocation result arrives.

### Tests for User Story 3

- [x] T024 [P] [US3] **Required (Constitution IV — race path)**: Add integration test for late geolocation auto-apply when no manual selection has occurred in tests/integration/auto-detect-success.test.jsx
- [x] T025 [P] [US3] Add integration test confirming late-result override is blocked after manual search in tests/integration/user-control.test.jsx
- [x] T026 [P] [US3] Add e2e race-condition scenario validating manual-authority preservation in tests/e2e/comprehensive-flows.spec.js

### Implementation for User Story 3

- [x] T027 [US3] Implement late-result apply guard: check `isAuthoritativeManualSelection` before applying late `granted` result in src/hooks/useInitialLocation.js
- [x] T028 [US3] Persist `isAuthoritativeManualSelection = true` when user selects any location in src/hooks/useWeather.js
- [x] T029 [US3] Set authoritative manual context flag on location selection from disambiguation list and recent searches in src/components/LocationPicker.jsx

**→ Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regression validation, success-criteria measurement, and documentation.

- [x] T030 [P] Update feature behavior notes and developer runbook in README.md
- [x] T031 [P] Align quick verification instructions with implemented first-load behavior in specs/003-initial-geolocation-source/quickstart.md
- [x] T032 Execute full integration regression suite for geolocation and manual flows: `npx vitest run tests/integration/auto-detect-success.test.jsx tests/integration/fallback-denied.test.jsx tests/integration/user-control.test.jsx tests/integration/App.test.jsx`
- [x] T033 Execute e2e geolocation regression suite for desktop and mobile emulation: `npx playwright test tests/e2e/core-flows.spec.js tests/e2e/comprehensive-flows.spec.js tests/e2e/geolocation-mobile.spec.js`
- [x] T034 Define measurable SC-001/SC-003/SC-004 validation protocol (sample size, environment, thresholds) in specs/003-initial-geolocation-source/quickstart.md
- [ ] T035 Execute and record SC-001 timing-validation sample runs (≥90% first-load within 6s) in specs/003-initial-geolocation-source/quickstart.md
- [x] T036 Execute and record SC-003 and SC-004 outcome-rate validation runs in specs/003-initial-geolocation-source/quickstart.md

---

## Dependencies

### Phase Order

- **Phase 1 (Setup)**: No dependencies; start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user story phases.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; may run alongside US1 stabilization.
- **Phase 5 (US3)**: Depends on Phase 2; authority-guard logic builds on US1/US2 state model.
- **Phase 6 (Polish)**: Depends on target story phases being complete.

### User Story Dependencies

```text
Phase 2 (Foundational)
    ├── Phase 3 (US1) — no dependency on US2 or US3
    ├── Phase 4 (US2) — no dependency on US1 or US3
    └── Phase 5 (US3) — depends on authority semantics from US1/US2
```

## Parallel Execution Examples

### Phase 1

```bash
# Run in parallel
T002  tests/setup.js
T003  tests/integration/auto-detect-success.test.jsx
```

### Phase 2

```bash
# Run in parallel after T004
T005  src/hooks/useGeolocation.js
T006  src/hooks/useInitialLocation.js
```

### Phase 4 (US2) Tests

```bash
# Run in parallel
T016  tests/integration/fallback-denied.test.jsx
T017  tests/integration/App.test.jsx
T018  tests/e2e/core-flows.spec.js
```

### Phase 4 (US2) Implementation

```bash
# Run in parallel once T019 hook changes are in place
T021  src/components/ErrorMessage.jsx
T022  src/components/SearchBar.jsx
```

### Phase 6

```bash
# Run in parallel
T030  README.md
T031  specs/003-initial-geolocation-source/quickstart.md
```

## Implementation Strategy

### MVP Scope (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) — geolocation-first happy path.
3. Validate US1 via T009 and T010.
4. Demo: open site with location granted → weather auto-loads.

### Incremental Delivery

1. Foundation once (Phases 1–2).
2. US1 (P1) → US2 (P2) → US3 (P3) in priority order.
3. Run Phase 6 polish after all three stories stabilize.

### Independent Test Criteria Summary

| Story | Pass Condition |
|-------|----------------|
| US1 | Permission granted → weather auto-loads within 6s, no manual search |
| US2 | Permission denied or failure → fallback message shown, manual search completes |
| US3 | Auto-detect then manual search → manual location stays; late auto-detect ignored |

