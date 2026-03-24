# Tasks: Initial Location from Geolocation

**Input**: Design documents from `/specs/003-initial-geolocation-source/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included because this feature requires verifiable happy-path and failure-path coverage for geolocation-first initialization and fallback behavior.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare test and contract scaffolding for this feature.

- [x] T001 Define initial geolocation state-machine test matrix in specs/003-initial-geolocation-source/contracts/initial-location-flow.md
- [x] T002 [P] Add geolocation-first test fixtures and helpers in tests/setup.js
- [x] T003 [P] Add contract assertion utilities for initial-location flow in tests/integration/auto-detect-success.test.jsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared state model and orchestration boundaries required by all stories.

**CRITICAL**: No user story work starts until this phase is complete.

- [x] T004 Implement initial-attempt state constants and transitions in src/utils/locationState.js
- [x] T005 [P] Normalize geolocation error classification in src/hooks/useGeolocation.js
- [x] T006 [P] Add first-load orchestration interface for initial context control in src/hooks/useInitialLocation.js
- [x] T007 Wire active location authority flags into weather state in src/hooks/useWeather.js
- [x] T008 Add non-blocking initial loading/fallback shell behavior in src/App.jsx

**Checkpoint**: Foundation complete. User stories can now proceed.

---

## Phase 3: User Story 1 - Accurate Auto-Detected Start Location (Priority: P1) 🎯 MVP

**Goal**: First weather result uses coordinate-based geolocation on initial page load.

**Independent Test**: Fresh visit with permission granted auto-loads detected-location weather without manual search.

### Tests for User Story 1

- [x] T009 [P] [US1] Add integration test for first-load permission-granted auto-detect flow in tests/integration/auto-detect-success.test.jsx
- [ ] T010 [P] [US1] Add e2e scenario for first-load geolocation success in tests/e2e/auto-geolocation-flows.spec.js

### Implementation for User Story 1

- [x] T011 [US1] Request geolocation immediately on first page load in src/hooks/useInitialLocation.js
- [x] T012 [US1] Enforce 5-second initial geolocation timeout behavior in src/hooks/useGeolocation.js
- [x] T013 [US1] Trigger coordinate-based weather fetch without manual input in src/hooks/useWeather.js
- [x] T014 [US1] Render visible in-progress state during initial geolocation in src/components/InitialLoadingIndicator.jsx
- [x] T015 [US1] Integrate initial geolocation loading and success rendering in src/App.jsx

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Resilient Fallback on Denial or Failure (Priority: P2)

**Goal**: Denial/failure paths remain fully usable via manual search only, with no substitute auto-load.

**Independent Test**: Deny permission or simulate geolocation failure and complete manual search without reload.

### Tests for User Story 2

- [x] T016 [P] [US2] Add integration test for denial fallback and manual usability in tests/integration/fallback-denied.test.jsx
- [x] T017 [P] [US2] Add integration test for 5-second timeout fallback state in tests/integration/App.test.jsx
- [x] T018 [P] [US2] Add e2e denial/fallback flow validation in tests/e2e/core-flows.spec.js

### Implementation for User Story 2

- [x] T019 [US2] Implement manual-only fallback state with no substitute auto-load in src/hooks/useInitialLocation.js
- [x] T020 [US2] Enforce no browser-locale or fixed-default auto-load on geolocation failure in src/App.jsx
- [x] T021 [US2] Differentiate geolocation vs weather-service errors in src/components/ErrorMessage.jsx
- [x] T022 [US2] Ensure manual location search remains enabled across fallback states in src/components/SearchBar.jsx
- [x] T023 [US2] Implement retry-on-click geolocation attempts after denial in src/hooks/useGeolocation.js

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 - Preserve User Control After Initial Load (Priority: P3)

**Goal**: Late geolocation results auto-apply only before manual selection, never overriding user-chosen location.

**Independent Test**: Verify late-result auto-apply before manual selection and no override after manual selection.

### Tests for User Story 3

- [x] T024 [P] [US3] Add integration test for late geolocation auto-apply before manual selection in tests/integration/auto-detect-success.test.jsx
- [x] T025 [P] [US3] Add integration test preventing late-result override after manual search in tests/integration/user-control.test.jsx
- [x] T026 [P] [US3] Add e2e race-condition scenario for manual-authority preservation in tests/e2e/comprehensive-flows.spec.js

### Implementation for User Story 3

- [x] T027 [US3] Implement late-result apply guard based on manual-authority flag in src/hooks/useInitialLocation.js
- [x] T028 [US3] Persist manual-authoritative active location semantics in src/hooks/useWeather.js
- [x] T029 [US3] Ensure manual search and recent search set authoritative location context in src/components/LocationPicker.jsx

**Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, regression validation, and documentation updates.

- [x] T030 [P] Update feature behavior notes and developer runbook in README.md
- [x] T031 [P] Align quick verification instructions with implemented behavior in specs/003-initial-geolocation-source/quickstart.md
- [x] T032 Execute full integration regression suite for geolocation and manual flows via tests/integration/App.test.jsx
- [x] T033 Execute e2e geolocation regression suite for desktop/mobile via tests/e2e/geolocation-mobile.spec.js
- [x] T034 Define measurable success-criteria validation protocol (sample size, environment, thresholds) in specs/003-initial-geolocation-source/quickstart.md
- [ ] T035 Execute and record SC-001 timing validation runs in specs/003-initial-geolocation-source/quickstart.md
- [x] T036 Execute and record SC-003 and SC-004 outcome-rate validation runs in specs/003-initial-geolocation-source/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion.
- **Phase 4 (US2)**: Depends on Phase 2 completion; can run after or alongside late US1 stabilization.
- **Phase 5 (US3)**: Depends on Phase 2 completion; relies on authority model introduced in US1/US2.
- **Phase 6 (Polish)**: Depends on desired story completion.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories after foundational phase.
- **US2 (P2)**: Depends on foundational orchestration and can be validated independently.
- **US3 (P3)**: Depends on foundational orchestration plus active-location authority semantics.

### Within Each User Story

- Tests are written before implementation and should fail first.
- Hook/state behavior before UI polish.
- Core behavior before integration cleanup.

## Parallel Opportunities

- `T002` and `T003` can run in parallel.
- `T005` and `T006` can run in parallel.
- `T009` and `T010` can run in parallel.
- `T016`, `T017`, and `T018` can run in parallel.
- `T024`, `T025`, and `T026` can run in parallel.
- `T030` and `T031` can run in parallel.
- `T035` and `T036` can run in parallel after `T034`.

## Parallel Example: User Story 2

```bash
# Parallel test tasks
T016 tests/integration/fallback-denied.test.jsx
T017 tests/integration/App.test.jsx
T018 tests/e2e/core-flows.spec.js

# Parallel implementation tasks after shared hook changes are in place
T021 src/components/ErrorMessage.jsx
T022 src/components/SearchBar.jsx
```

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently via T009 and T010.
4. Demo MVP behavior.

### Incremental Delivery

1. Build foundation once (Phases 1-2).
2. Deliver US1, then US2, then US3 in priority order.
3. Run polish/regression phase after each story batch as needed.

### Parallel Team Strategy

1. One engineer finalizes foundational hooks/state.
2. One engineer owns integration/e2e tests per story.
3. One engineer owns UI/error-state and fallback interactions.

