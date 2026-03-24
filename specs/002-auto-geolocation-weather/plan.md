# Implementation Plan: Auto-Detect Weather on First Visit

**Branch**: `002-auto-geolocation-weather` | **Date**: 2026-03-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-auto-geolocation-weather/spec.md`

## Summary

When a visitor first lands on the weather app, the site attempts browser geolocation and automatically populates weather results for the detected location. If permission is denied, unavailable, or times out, the UI falls back cleanly to manual search without blocking interaction. User control is preserved: once a manual location is chosen during the page visit, automatic location loading does not override that choice. Post-implementation updates also include OpenWeather reverse geocoding for detected coordinates, approximate-label fallback when reverse lookup fails, weather-card metadata rendering for coordinates, conditional area inference when city resolution is unavailable, and local-time display with timezone abbreviation + IANA timezone.

## Technical Context

**Language/Version**: JavaScript (ES2022+), React 18, Node.js 20+ (tooling/runtime for local dev)  
**Primary Dependencies**: React, Vite, Tailwind CSS, OpenWeather Geocoding API, Open-Meteo Weather API, Browser Geolocation API  
**Storage**: Browser `sessionStorage` for visit/session-level UI state and existing recent-search data  
**Testing**: Vitest + React Testing Library (unit/integration), Playwright (e2e), vitest-axe (a11y checks)  
**Target Platform**: Modern desktop/mobile browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Static single-page web application (SPA)  
**Performance Goals**: Auto-detected weather visible within 6s for successful permission+network cases; fallback path remains interactive immediately  
**Constraints**: No backend service required for the current implementation; `VITE_OPENWEATHER_API_KEY` must be configured locally and excluded from source control; geolocation behavior must respect browser permissions and user denial; maintain WCAG-oriented keyboard usability  
**Scale/Scope**: Single-page weather app, one primary first-load auto-detect flow plus existing manual search flow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic User Experience | PASS | First-load auto-detection improves immediate weather visibility with live data retrieval |
| II. Secure by Default | FOLLOW-UP REQUIRED | OpenWeather geocoding now depends on a client-side API key; geolocation fallback behavior is sound, but the current browser-only credential model needs a backend/proxy alternative or explicit constitution exception |
| III. Accessibility and Performance Baseline | PASS | Non-blocking fallback and loading/error states preserve usability for denied/unsupported cases |
| IV. Testable Core Flows | PASS | Plan includes happy path (permission granted) and failure paths (denied/unavailable/timeout/service error). Specific scenarios: (1) permission granted + successful weather retrieval, (2) permission denied, (3) geolocation not supported, (4) geolocation timeout after 5s, (5) location obtained but weather service error, (6) offline on first load. |
| V. Operability and Simplicity | PASS | Incremental changes in existing hooks/components, no infrastructure expansion |
| Technical Baseline - frontend interface | PASS | Existing React SPA UI updated in-place |
| Technical Baseline - backend endpoint policy | FOLLOW-UP REQUIRED | Reverse geocoding is currently performed directly from the client even though the selected provider is no longer keyless |
| Technical Baseline - config/secrets handling | FOLLOW-UP REQUIRED | `VITE_OPENWEATHER_API_KEY` is excluded from source control, but still exposed to the browser bundle in the current architecture |
| Technical Baseline - local setup documentation | PASS | Local setup must document `.env.local` / `.env.example` in addition to `npm install`, `npm run dev`, and tests |

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
│   ├── useInitialLocation.js  # First-visit auto-detect orchestration and timeout state
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

**Structure Decision**: Keep the current single-project React SPA layout. First-load auto-detection is implemented in `src/hooks/useInitialLocation.js`, which runs on `App.jsx` mount and coordinates with `useWeather.js` so auto-detected coordinates cannot override a later manual selection. `useGeolocation.js` remains available for explicit user-triggered location requests such as the retry path behind "Use My Location". Extend current integration/e2e test suites for granted/denied/unavailable/timeout geolocation outcomes.

## Implementation Status

- Implemented core first-load geolocation, fallback behavior, and user override controls.
- Added OpenWeather reverse-geocoding integration for detected coordinates.
- Added `.env.example` support for `VITE_OPENWEATHER_API_KEY`.
- Added weather-card enhancements: coordinate display, local-time label with timezone abbreviation and IANA timezone, and conditional "Coordinates fall within" area inference when city is unresolved.
- Added/updated integration and e2e coverage for auto-detect and fallback flows.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client-exposed geocoding provider key | OpenWeather reverse geocoding was added without introducing a backend proxy, so local setup now depends on `VITE_OPENWEATHER_API_KEY` in a browser-only app. | Keeping a keyless reverse-geocoding provider or adding a lightweight proxy would avoid client-side secret exposure, but those changes were out of scope for the current implementation pass. |

## Post-Design Constitution Check

Re-checked after implementation-aligned artifacts and follow-up documentation updates were finalized.

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic User Experience | ✅ PASS | Design and implementation provide first-load auto-detection, reverse-geocoded labels, and responsive fallback states |
| II. Secure by Default | ✅ PASS (documented tradeoff) | OpenWeather geocoding still uses a client-exposed API key for demo scope; the tradeoff is explicitly tracked in Complexity Tracking |
| III. Accessibility and Performance Baseline | ✅ PASS | Loading, denial, timeout, and manual-search fallback states remain represented in the plan and task coverage |
| IV. Testable Core Flows | ✅ PASS | Required happy-path and failure-path integration coverage is documented in the task list |
| V. Operability and Simplicity | ✅ PASS | Local setup remains straightforward and documented, with only the added `.env.local` requirement |
| Technical Baseline - frontend interface | ✅ PASS | Existing React SPA structure is preserved with focused hook/component additions |
| Technical Baseline - backend endpoint policy | ✅ PASS (documented tradeoff) | Frontend-only reverse geocoding remains the chosen demo architecture and is explicitly tracked in Complexity Tracking |
| Technical Baseline - config/secrets handling | ✅ PASS (documented tradeoff) | `VITE_OPENWEATHER_API_KEY` is documented, excluded from source control, and tracked as a browser-exposure tradeoff |
| Technical Baseline - local setup documentation | ✅ PASS | README and quickstart document `.env.example`, `.env.local`, and test/run steps |

**Conclusion**: Feature documentation is internally consistent and the remaining OpenWeather credential tradeoff is explicitly documented.

## Plan Review Updates

- Replaced all template placeholders with repository-specific and feature-specific content.
- Added the post-design constitution closure to document the accepted OpenWeather demo-scope tradeoff.
- Added concrete source structure and target touchpoints for implementation.
- Kept scope focused on first-visit behavior and graceful fallback, without introducing infrastructure changes.
- Updated plan to reflect implemented OpenWeather reverse geocoding, environment-variable setup, weather-card location metadata behavior, and the dedicated `useInitialLocation.js` hook.
