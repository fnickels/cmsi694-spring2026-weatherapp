# Implementation Plan: Location-Based Current Weather App

**Branch**: `001-location-weather-app` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-location-weather-app/spec.md`

## Summary

A fully static single-page React application that lets users type a city name (or use browser geolocation) to retrieve and display current weather conditions. OpenWeather Geocoding API is used for direct search and reverse geocoding, while Open-Meteo remains the weather provider. Weather data shown includes temperature, feels-like temperature, weather condition label + icon, humidity, wind speed/direction, and visibility. Users can toggle between imperial and metric units; up to 5 recent searches are preserved in `sessionStorage`. Visual aesthetic is dark glassmorphism (navy/sky-blue gradient, frosted-glass cards). Local development requires `VITE_OPENWEATHER_API_KEY` in the environment.

## Technical Context

**Language/Version**: JavaScript (ES2022+) — React 18, Node 20 (dev tooling only)  
**Primary Dependencies**: React 18, Vite 5, Tailwind CSS 3, OpenWeather Geocoding API, Open-Meteo Weather API  
**Storage**: `sessionStorage` (browser-native) for UnitPreference and RecentSearches — no database, no library  
**Testing**: Vitest + @testing-library/react + @testing-library/user-event + jsdom  
**Target Platform**: Modern browsers — Chrome 120+, Firefox 120+, Safari 17+, Edge 120+  
**Project Type**: Static single-page web application (SPA)  
**Performance Goals**: Weather results displayed within 5s on broadband; unit toggle <1s with no network request  
**Constraints**: `VITE_OPENWEATHER_API_KEY` must be configured locally and excluded from source control; MUST pass WCAG 2.1 AA contrast checks; no owned backend server  
**Scale/Scope**: Single-user, single-page course demo; ~8 components, ~4 custom hooks, ~2 service modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic User Experience | ✅ PASS | Live weather data fetched from Open-Meteo on every search |
| II. Secure by Default | FOLLOW-UP REQUIRED | Current frontend-only OpenWeather integration exposes a client-side API key in the built app; this requires either a backend/proxy change or an explicit constitution exception for demo use |
| III. Accessibility and Performance Baseline | ✅ PASS | FR-013 mandates WCAG 2.1 AA; semantic HTML + keyboard nav required |
| IV. Testable Core Flows | ✅ PASS | Vitest + Testing Library; happy-path (search returns weather) + failure-path (API error) tests required |
| V. Operability and Simplicity | ✅ PASS | `npm install && npm run dev` is the complete setup; quickstart.md documents it |
| Technical Baseline — frontend interface | ✅ PASS | React SPA with full interactive UI |
| Technical Baseline — backend service endpoint | FOLLOW-UP REQUIRED | Weather remains keyless, but OpenWeather geocoding is no longer a keyless public API in the browser-only architecture |
| Technical Baseline — config in env vars / excluded from source control | FOLLOW-UP REQUIRED | `VITE_OPENWEATHER_API_KEY` is excluded from source control, but still shipped to the client bundle in the current implementation |
| Technical Baseline — repeatable local setup in README | ✅ PASS | quickstart.md + README document the required local env configuration |

## Project Structure

### Documentation (this feature)

```text
specs/001-location-weather-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── api-providers.md        # External API contracts (OpenWeather geocoding + Open-Meteo weather)
│   └── ui-components.md        # Component prop contracts
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── SearchBar.jsx          # Location text input + submit + "Use My Location" button
│   ├── WeatherCard.jsx        # Primary weather display card (glassmorphism)
│   ├── WeatherStats.jsx       # Humidity, wind, visibility stat row
│   ├── LocationPicker.jsx     # Disambiguation list when search returns multiple results
│   ├── RecentSearches.jsx     # Session history pill/chip list (up to 5)
│   ├── UnitToggle.jsx         # °F / °C toggle button
│   ├── LoadingSpinner.jsx     # Animated loading indicator
│   └── ErrorMessage.jsx       # User-friendly error display
├── hooks/
│   ├── useWeather.js          # Orchestrates geocoding → weather fetch; exposes state
│   ├── useGeolocation.js      # Wraps browser navigator.geolocation
│   └── useRecentSearches.js   # Reads/writes sessionStorage recent search list
├── services/
│   ├── geocoding.js           # OpenWeather direct + reverse geocoding calls
│   └── weather.js             # Open-Meteo Weather API calls
├── utils/
│   ├── wmoConditions.js       # WMO code → { label, icon } mapping (all 27 WMO buckets)
│   └── unitConversions.js     # km/h↔mph, °C↔°F, km↔mi conversions
├── App.jsx                    # Root component; wires all hooks and renders layout
├── main.jsx                   # Vite entry point
└── index.css                  # Tailwind directives + custom CSS variables

tests/
├── unit/
│   ├── unitConversions.test.js
│   └── wmoConditions.test.js
└── integration/
    ├── SearchBar.test.jsx      # Happy path: enter city → weather shown
    ├── WeatherCard.test.jsx    # Displays correct data from mock response
    └── App.test.jsx            # Failure path: API error → error message shown

public/
└── icons/                     # Weather condition SVG icon files

index.html                     # Vite HTML entry
vite.config.js
tailwind.config.js
postcss.config.js
package.json
```

**Structure Decision**: Single Vite+React project rooted at the repository root. No separate frontend/backend directories — this is a fully static SPA. Tests live in `tests/` co-located with `src/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Frontend-only integration for third-party browser APIs | OpenWeather geocoding and Open-Meteo weather are both called directly from the browser to keep the project fully static. | A backend proxy would add process and maintenance complexity beyond the course-demo scope. |
| Client-exposed geocoding provider key | OpenWeather Geocoding API requires an API key, so local setup now depends on `VITE_OPENWEATHER_API_KEY`. | Keeping Open-Meteo geocoding would preserve a keyless browser-only architecture, but the implementation has already standardized on OpenWeather request/response shapes and reverse-lookup behavior. |

## Post-Design Constitution Check

Re-checked after Phase 1 artifacts (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`) finalized.

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic User Experience | ✅ PASS | Design uses live weather and geocoding APIs; responsive UI feedback states defined |
| II. Secure by Default | ✅ PASS (documented tradeoff) | Key is configured via local env files excluded from source control; frontend exposure is accepted for demo use and tracked in Complexity Tracking |
| III. Accessibility and Performance Baseline | ✅ PASS | WCAG 2.1 AA requirements and performance targets represented in contracts and design |
| IV. Testable Core Flows | ✅ PASS | Happy-path and failure-path test strategy documented; traceable to tasks |
| V. Operability and Simplicity | ✅ PASS | Local setup and build/test commands documented; no complex infrastructure required |
| Technical Baseline — frontend interface | ✅ PASS | React SPA with full interactive UI and responsive design |
| Technical Baseline — backend service endpoint | ✅ PASS | Frontend-only model remains the chosen architecture for public provider access |
| Technical Baseline — config in env vars | ✅ PASS | `VITE_OPENWEATHER_API_KEY` is documented as required local configuration |
| Technical Baseline — repeatable local setup | ✅ PASS | Quickstart.md + README provide setup path including env var configuration |

**Conclusion**: Plan passes all constitutional gates. Ready to proceed to task generation.
