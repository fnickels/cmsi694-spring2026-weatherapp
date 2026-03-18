# Quickstart: Location-Based Current Weather App

**Branch**: `001-location-weather-app` | **Date**: 2026-03-17

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 20.x | `node --version` |
| npm | 10.x (bundled with Node 20) | `npm --version` |
| Git | Any recent version | `git --version` |

No API keys, accounts, environment variables, or external services are required.

---

## Installation

```bash
# 1. Clone the repository (if not already done)
git clone https://github.com/fnickels/cmsi694-spring2026-weatherapp.git
cd cmsi694-spring2026-weatherapp

# 2. Switch to the feature branch
git checkout 001-location-weather-app

# 3. Install dependencies
npm install
```

---

## Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The development server supports hot module replacement (HMR) — changes to source files update in the browser instantly without a full reload.

---

## Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Tests live in `tests/unit/` and `tests/integration/`. See [plan.md](plan.md) for the test coverage requirements.

---

## Production Build

```bash
npm run build
```

Output is placed in `dist/`. The `dist/` directory is a self-contained static site that can be served from any static file host or opened locally via `npx serve dist`.

To preview the production build locally:

```bash
npm run preview
```

---

## Project Structure (summary)

```
src/
├── components/     UI components (SearchBar, WeatherCard, etc.)
├── hooks/          Custom React hooks (useWeather, useGeolocation, useRecentSearches)
├── services/       Open-Meteo API calls (geocoding.js, weather.js)
├── utils/          WMO code mapping, unit conversions
├── App.jsx         Root component
└── main.jsx        Vite entry point

tests/
├── unit/           Pure function tests (conversions, WMO lookup)
└── integration/    Component/user-flow tests

public/icons/       Weather condition SVG icons (Meteocons)
```

---

## No Environment Variables Needed

This project uses the Open-Meteo public API (no key required). There is no `.env` file to configure. The app works out of the box after `npm install`.

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `npm install` fails | Ensure Node 20+ is installed: `node --version` |
| Port 5173 already in use | Run `npm run dev -- --port 3000` to use a different port |
| "Location not found" for a valid city | Check your internet connection; Open-Meteo requires outbound HTTPS |
| Geolocation not working | The browser requires HTTPS or `localhost` for the Geolocation API — `npm run dev` on localhost is sufficient |
| Tests fail with "Cannot find module" | Run `npm install` to ensure all dev dependencies are present |
