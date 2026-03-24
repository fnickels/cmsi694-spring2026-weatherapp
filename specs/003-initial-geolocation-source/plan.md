# Implementation Plan: Initial Location from Geolocation

**Branch**: `003-initial-geolocation-source` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-initial-geolocation-source/spec.md`

## Summary

Replace initial weather-location sourcing on page load so it is geolocation-first using `navigator.geolocation.getCurrentPosition`, with explicit behavioral clarifications: 5-second timeout, immediate permission request on first load, fallback to manual-search-only on failure, late-result auto-apply only before any manual selection, and explicit retry attempts when users click Use My Location after denial.

## Technical Context

**Language/Version**: JavaScript (ES2022+), React 18, Node.js 20+ tooling  
**Primary Dependencies**: React, Vite, Tailwind CSS, Browser Geolocation API, Open-Meteo weather and geocoding services  
**Storage**: Browser `sessionStorage` for existing recent-search and UI session state; no database  
**Testing**: Vitest + React Testing Library + user-event + jsdom (unit/integration), Playwright (e2e)  
**Target Platform**: Modern desktop/mobile browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-project frontend SPA  
**Performance Goals**: Successful auto-detected first weather result appears within 6 seconds in at least 90% of granted-permission sessions; timeout fallback at 5 seconds  
**Constraints**: No backend required for this feature; no API secrets; geolocation behavior must respect browser permission model; no automatic fallback to browser-locale or fixed default weather on geolocation failure  
**Scale/Scope**: One first-load flow update touching existing hooks/components/services plus regression-safe tests across unit/integration/e2e

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic User Experience | PASS | Feature directly improves first-load relevance with live data from user coordinates |
| II. Secure by Default | PASS | Uses browser permission gating; no secrets added; no auth surface changes |
| III. Accessibility and Performance Baseline | PASS | Requires clear fallback and non-blocking manual input when geolocation fails |
| IV. Testable Core Flows | PASS | Happy-path and multiple failure/race paths are explicitly testable and scoped |
| V. Operability and Simplicity | PASS | Incremental update in existing SPA, no new infrastructure required |
| Technical Baseline - frontend interface | PASS | Existing React UI remains primary delivery surface |
| Technical Baseline - backend endpoint policy | PASS | Frontend-only model remains valid for keyless public weather APIs |
| Technical Baseline - config/secrets handling | PASS | No sensitive config introduced |
| Technical Baseline - repeatable local setup | PASS | Existing `npm install`, `npm run dev`, and test scripts remain sufficient |

## Project Structure

### Documentation (this feature)

```text
specs/003-initial-geolocation-source/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── initial-location-flow.md
│   └── geolocation-error-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── App.jsx
├── components/
│   ├── LocationPicker.jsx
│   ├── SearchBar.jsx
│   ├── ErrorMessage.jsx
│   ├── InitialLoadingIndicator.jsx
│   └── WeatherCard.jsx
├── hooks/
│   ├── useInitialLocation.js
│   ├── useGeolocation.js
│   └── useWeather.js
├── services/
│   ├── weather.js
│   └── geocoding.js
└── utils/
    └── locationState.js

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Keep the existing single-project SPA layout and implement this feature by refining first-load orchestration in hooks plus targeted UI state handling in current components. No new runtime layers or services are introduced.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Post-Design Constitution Check

Re-checked after Phase 1 artifacts (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`) were produced.

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Dynamic User Experience | PASS | Design preserves immediate weather value with resilient fallback states |
| II. Secure by Default | PASS | Permission model and failure handling remain browser-governed and explicit |
| III. Accessibility and Performance Baseline | PASS | Contracts require visible status/fallback messaging and uninterrupted manual control |
| IV. Testable Core Flows | PASS | Quickstart + contracts define happy path, denial path, timeout path, and late-result race validation |
| V. Operability and Simplicity | PASS | No added infrastructure; local execution and verification remain straightforward |
| Technical Baseline - frontend interface | PASS | UI-first behavior contract is explicitly documented |
| Technical Baseline - backend endpoint policy | PASS | No backend addition needed for this keyless/public API usage |
| Technical Baseline - config/secrets handling | PASS | Feature introduces no new configuration surface |
| Technical Baseline - repeatable local setup | PASS | quickstart.md documents repeatable setup, run, and verification commands |

**Conclusion**: Plan passes constitution gates and is ready for `/speckit.tasks`.
