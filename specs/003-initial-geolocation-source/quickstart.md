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
