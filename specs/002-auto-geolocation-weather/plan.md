# Implementation Plan: Auto-Detect Weather on First Visit

**Branch**: `002-auto-geolocation-weather` | **Date**: 2026-03-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-auto-geolocation-weather/spec.md`

## Summary

When a visitor first lands on the weather app, the site attempts browser geolocation and automatically populates weather results for the detected location. If permission is denied, unavailable, or times out, the UI falls back cleanly to manual search without blocking interaction. User control is preserved: once a manual location is chosen during the page visit, automatic location loading does not override that choice. Post-implementation updates also include weather-card metadata rendering for coordinates, conditional area inference when city resolution is unavailable, and local-time display with timezone abbreviation + IANA timezone.

## Technical Context

**Language/Version**: JavaScript (ES2022+), React 18, Node.js 20+ (tooling/runtime for local dev)  
**Primary Dependencies**: React, Vite, Tailwind CSS, Open-Meteo API (weather + geocoding), Browser Geolocation API  
**Storage**: Browser `sessionStorage` for visit/session-level UI state and existing recent-search data  
**Testing**: Vitest + React Testing Library (unit/integration), Playwright (e2e), vitest-axe (a11y checks)  
**Target Platform**: Modern desktop/mobile browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Static single-page web application (SPA)  
**Performance Goals**: Auto-detected weather visible within 6s for successful permission+network cases; fallback path remains interactive immediately  
**Constraints**: No backend service required; no API secrets; geolocation behavior must respect browser permissions and user denial; maintain WCAG-oriented keyboard usability  
**Scale/Scope**: Single-page weather app, one primary first-load auto-detect flow plus existing manual search flow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic User Experience | PASS | First-load auto-detection improves immediate weather visibility with live data retrieval |
| II. Secure by Default | PASS | No secrets introduced; geolocation uses browser permission model and explicit fallback behavior |
| III. Accessibility and Performance Baseline | PASS | Non-blocking fallback and loading/error states preserve usability for denied/unsupported cases |
| IV. Testable Core Flows | PASS | Plan includes happy path (permission granted) and failure paths (denied/unavailable/timeout/service error). Specific scenarios: (1) permission granted + successful weather retrieval, (2) permission denied, (3) geolocation not supported, (4) geolocation timeout after 8s, (5) location obtained but weather service error, (6) offline on first load. |
| V. Operability and Simplicity | PASS | Incremental changes in existing hooks/components, no infrastructure expansion |
| Technical Baseline - frontend interface | PASS | Existing React SPA UI updated in-place |
| Technical Baseline - backend endpoint policy | PASS | Frontend-only integration remains valid for keyless public weather APIs |
| Technical Baseline - config/secrets handling | PASS | No new sensitive config required |
| Technical Baseline - local setup documentation | PASS | Existing README workflow remains valid (`npm install`, `npm run dev`, tests) |

## Project Structure

### Documentation (this feature)

```text
specs/002-auto-geolocation-weather/
├── checklists/
│   └── requirements.md
├── plan.md
├── spec.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── App.jsx                    # Orchestrates first-load flow and render state
├── components/
│   ├── LoadingSpinner.jsx
│   ├── ErrorMessage.jsx
│   ├── SearchBar.jsx
│   └── WeatherCard.jsx
├── hooks/
│   ├── useGeolocation.js      # Browser geolocation behavior and status
│   └── useWeather.js          # Weather retrieval and active-location state
├── services/
│   ├── geocoding.js
│   └── weather.js
└── utils/
    └── wmoConditions.js

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Keep the current single-project React SPA layout. Implement first-load auto-detection by creating a new `useInitialLocation.js` hook (or extending existing `useGeolocation` from feature 001) in `src/hooks/` to trigger automatically on `App.jsx` mount. Coordinate with `useWeather.js` to avoid race conditions between geolocation and weather-fetch requests. Extend current integration/e2e test suites for granted/denied/unavailable/timeout geolocation outcomes.

## Implementation Status

- Implemented core first-load geolocation, fallback behavior, and user override controls.
- Added reverse-geocoding integration for detected coordinates.
- Added weather-card enhancements: coordinate display, local-time label with timezone abbreviation and IANA timezone, and conditional "Coordinates fall within" area inference when city is unresolved.
- Added/updated integration and e2e coverage for auto-detect and fallback flows.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Plan Review Updates

- Replaced all template placeholders with repository-specific and feature-specific content.
- Confirmed constitution gates pass for this feature scope.
- Added concrete source structure and target touchpoints for implementation.
- Kept scope focused on first-visit behavior and graceful fallback, without introducing infrastructure changes.
- Updated plan to reflect implemented weather-card location metadata behavior and current feature documentation layout.
