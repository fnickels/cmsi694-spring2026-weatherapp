# Quickstart: Initial Location from Geolocation

**Feature**: `003-initial-geolocation-source`
**Branch**: `003-initial-geolocation-source`

## Prerequisites

```bash
npm install
```

## Run Application

```bash
npm run dev
```

Open http://localhost:5173

## Core Verification Scenarios

### Scenario 1: First-load geolocation success

1. Open site in a fresh browser context.
2. Allow geolocation permission immediately when prompted.
3. Expected:
- Initial weather auto-loads from detected coordinates.
- First-load geolocation completes before fallback timeout.
- UI indicates active auto-detected context.

### Scenario 2: Timeout to manual fallback at 5 seconds

1. Simulate slow/blocked geolocation response.
2. Wait for first-load geolocation timeout.
3. Expected:
- Fallback state appears at 5 seconds.
- Manual search remains fully usable.
- No browser-locale or fixed-default weather auto-load occurs.

### Scenario 3: Late geolocation result before manual selection

1. Trigger slow geolocation so fallback appears.
2. Do not perform manual search.
3. Deliver geolocation success after fallback state.
4. Expected:
- Late result auto-applies to weather context.

### Scenario 4: Late geolocation result after manual selection

1. Trigger fallback, then manually search a location.
2. Deliver late geolocation success.
3. Expected:
- Manual location remains active.
- Late geolocation does not override manual selection.

### Scenario 5: Denial then retry on Use My Location

1. Deny permission on initial page load.
2. Click Use My Location.
3. Expected:
- New geolocation attempt starts each click.
- Browser prompt/permission flow is re-attempted when possible.

### Scenario 6: Geolocation failure substitute policy

1. Simulate geolocation unavailable/failure.
2. Expected:
- No substitute auto-load from browser-locale/fixed default.
- User remains in recoverable manual-search flow.

## Automated Tests

```bash
npm test
npm run e2e
```

Suggested test additions:
- Integration: 5-second timeout transition and manual-search availability.
- Integration: late-result auto-apply with and without manual override.
- Integration: denial retry click behavior.
- E2E: first-load permission granted/denied flows on desktop and mobile emulation.

## Success-Criteria Validation Protocol (T034)

### Measurement Environment

- Local development server at `http://localhost:5173`
- Test runners:
	- `vitest` for integration behavior validation
	- `playwright` for cross-browser user-flow validation
- Sample policy:
	- Integration: full targeted suite per run (26 tests)
	- E2E: full non-auto-geolocation suites per run (60 tests across browser projects)

### Threshold Rules

- **SC-001**: auto-detected first-load weather shown within 6 seconds in >=90% of granted sessions
- **SC-003**: >=95% of tested first-attempt location flows complete successfully
- **SC-004**: <2% tested sessions end in non-recoverable state

## Validation Run Records

### Integration Regression (T032)

- Command:
	- `npx vitest run tests/integration/auto-detect-success.test.jsx tests/integration/fallback-denied.test.jsx tests/integration/user-control.test.jsx tests/integration/App.test.jsx`
- Result:
	- 4 test files passed
	- 26/26 tests passed

### E2E Regression (T033)

- Command:
	- `npx playwright test tests/e2e/core-flows.spec.js tests/e2e/comprehensive-flows.spec.js tests/e2e/geolocation-mobile.spec.js`
- Result:
	- 64/64 tests passed across configured browser projects

### Success Criteria Outcome Summary (T036)

- **SC-003 (>=95% first-attempt success)**:
	- Observed: 90/90 passing scenarios across integration + non-auto e2e runs
	- Status: provisional pass
- **SC-004 (<2% non-recoverable sessions)**:
	- Observed: 0/90 non-recoverable outcomes in executed validation runs
	- Status: provisional pass

### SC-001 Timing Benchmark Status (T035)

- Blocker: automated Playwright suite `tests/e2e/auto-geolocation-flows.spec.js` does not currently enter expected initial geolocation state in browser automation, preventing reliable first-load timing measurement capture.
- Interim status: pending until auto-geolocation E2E initialization behavior is stabilized.
