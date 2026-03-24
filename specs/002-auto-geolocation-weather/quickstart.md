# Quickstart: Auto-Detect Weather on First Visit

**Feature**: `002-auto-geolocation-weather`  
**Branch**: `002-auto-geolocation-weather`

## Prerequisites

```bash
npm install
npm run dev   # starts at http://localhost:5173
```

---

## Manual Test Scenarios

### Scenario 1 — Location Allowed (Happy Path / US1)

1. Open http://localhost:5173 in a fresh browser tab (or incognito to avoid cached permissions).
2. When the browser displays the permission prompt **"Allow this site to use your location?"**, click **Allow**.
3. **Expected**: A loading spinner labelled "Detecting your location…" appears briefly, then weather data for your detected location loads automatically — no typing required.
4. **Expected**: The weather card shows an **"Auto-located"** badge near the location name.
5. **Expected**: The Search Bar is fully usable throughout (not blocked at any point).
6. **Expected**: The weather card displays coordinates and a local-time line formatted as **"Location's Local Time: <date/time> <TZ_ABBR> (<IANA timezone>)"**.

---

### Scenario 2 — Location Denied (Fallback / US2)

1. Open http://localhost:5173 in a fresh browser tab.
2. When the browser displays the permission prompt, click **Block / Deny**.
3. **Expected**: A soft notice appears: *"Location access was denied — try entering a city name below."*
4. **Expected**: No crash, no hard error alert.
5. **Expected**: The search bar is fully functional. Type a city name (e.g., "Seattle") and click **Search** to verify manual search works normally.

---

### Scenario 3 — Geolocation Not Supported

1. Open http://localhost:5173 in a browser with geolocation disabled (e.g., Chrome headless with `--disable-features=Geolocation`, or using browser DevTools to override `navigator.geolocation` to `undefined`).
2. **Expected**: Page loads normally, no error displays, search bar is immediately usable.

---

### Scenario 4 — Manual Override After Auto-Detect (US3)

1. Allow location access → auto-weather loads for your detected location.
2. Type a different city in the search bar (e.g., "Tokyo") and click **Search**.
3. **Expected**: Weather switches to Tokyo immediately.
4. **Expected**: The "Auto-located" badge is no longer shown (manual search result has no badge).
5. **Expected**: The page does not revert to the auto-detected location.

---

### Scenario 6 — Unresolved City Area Fallback

1. Simulate reverse-geocoding failure (or use mocked coordinates with no city name).
2. Trigger location-based weather load.
3. **Expected**: The location label uses **"Location (approximate)"**.
4. **Expected**: The weather card displays **"Coordinates fall within"** with alternate area inference.
5. **Expected**: If state/country are unavailable, area inference falls back to timezone area and then coordinate zone.

---

### Scenario 5 — Re-Prompt After Denial (US3 / FR-010)

1. Deny location access so that the denied notice appears.
2. Click **Use My Location** button in the search bar.
3. **Expected**: The browser re-prompts for location permission.
4. Allow the permission → **expected**: weather for detected location loads.

---

## Running Automated Tests

```bash
# Unit + integration tests (includes T014 happy-path and T024 failure-path — required)
npm test

# Non-watch mode
npx vitest run

# E2E (Playwright)
npm run e2e
```

---

## Performance Check (SC-001)

1. Open Chrome DevTools → Network tab → throttle to "Slow 3G".
2. Open http://localhost:5173 and allow location.
3. **Expected**: Weather card appears within **6 seconds** of page load.
