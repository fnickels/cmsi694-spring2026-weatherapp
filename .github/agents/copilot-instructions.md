# cmsi694-spring2026-weatherapp Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-24

## Active Technologies
- JavaScript (ES2022+) with React 18 and Node 20 for local tooling + React 18, Vite 5, Tailwind CSS 3, Open-Meteo REST API, Leaflet + React-Leaflet, OpenStreetMap raster tiles, RainViewer public tile endpoints, NASA GIBS WMTS/TMS raster layers (004-forecast-maps-display)
- In-memory `Map` cache plus `sessionStorage` for tab-scoped forecast and overlay response reuse; no database (004-forecast-maps-display)

- JavaScript (ES2022+) — React 18, Node 20 (dev tooling only) + React 18, Vite 5, Tailwind CSS 3, Open-Meteo REST API (no key required) (001-location-weather-app)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (ES2022+) — React 18, Node 20 (dev tooling only): Follow standard conventions

## Recent Changes
- 004-forecast-maps-display: Added JavaScript (ES2022+) with React 18 and Node 20 for local tooling + React 18, Vite 5, Tailwind CSS 3, Open-Meteo REST API, Leaflet + React-Leaflet, OpenStreetMap raster tiles, RainViewer public tile endpoints, NASA GIBS WMTS/TMS raster layers
- 001-location-weather-app: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 001-location-weather-app: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
