# Research: Weather Forecast & Maps Display

## 1. Map Rendering Stack

- Decision: Use Leaflet with React-Leaflet behind a dedicated `WeatherMapCanvas` adapter and load the map bundle only when the Map view is first opened.
- Rationale: The feature only needs a marker, pan/zoom, raster overlays, and click/tap inspection. Leaflet is the simplest fit for that scope, lines up with the constitution’s simplicity principle, and avoids the extra surface area of a WebGL-first renderer when vector styling is not required.
- Alternatives considered:
  - MapLibre GL JS: stronger long-term choice for advanced vector or 3D mapping, but unnecessary complexity for a course-scale raster-overlay feature.
  - OpenLayers: powerful for WMTS/WMS-heavy GIS workflows, but steeper than needed for this app’s first release.

## 2. Forecast Data Acquisition and Normalization

- Decision: Keep Open-Meteo as the primary weather API and make one forecast request per selected location that includes daily and hourly series, then normalize the response into view-model objects for a 7-day daily strip plus a rolling 24-hour drill-down.
- Rationale: Open-Meteo already powers current weather in the app, requires no key, and returns both daily and hourly data in one request. A normalization layer keeps the UI independent from raw API shape and makes unit/integration testing straightforward.
- Alternatives considered:
  - Separate daily and hourly requests: simpler transforms but slower and more error-prone due to split request coordination.
  - Raw API shape passed into components: lower upfront effort but couples the UI to service details and makes future changes harder.

## 3. Overlay Source Strategy

- Decision: Use OpenStreetMap raster tiles for the base map, RainViewer public raster tiles for precipitation visualization, and NASA GIBS public imagery layers for temperature and cloud-cover overlays. Use Open-Meteo point queries to provide inspected values when users click or tap the map.
- Rationale: The feature requires no-key map visuals for precipitation, temperature, and cloud cover. No single free provider cleanly supplies all three as consumer-ready tiles, so the lowest-risk keyless combination is to separate concerns: OSM for base mapping, public tile imagery for regional overlay visuals, and Open-Meteo for precise per-point values and forecast details.
- Alternatives considered:
  - Open-Meteo-only overlays: strong point forecast API, but no turnkey public tile overlays for all required map layers.
  - Keyed weather-tile vendors: rejected because the spec prohibits API keys.
  - Building custom grid overlays from sampled forecast data: possible but too complex for the first release.

## 4. Overlay Inspection Behavior

- Decision: Treat click/tap inspection as a separate forecast lookup by latitude/longitude rather than trying to read values directly from overlay tile pixels.
- Rationale: Raster tile overlays are built for visualization, not reliable client-side data extraction. A dedicated point query gives deterministic inspected values, works across devices, and stays consistent with the spec’s click/tap interaction requirement.
- Alternatives considered:
  - Pixel inspection of raster tiles: brittle and not semantically meaningful for many public imagery sources.
  - Hover-only inspection: conflicts with the clarified cross-device interaction rule.

## 5. View Switching, Accessibility, and Fallbacks

- Decision: Implement `Current`, `Forecast`, and `Map` as a proper tab interface with manual activation, keyboard support, and lazy-mounted tab panels. Provide text legends for active overlays and a text-based fallback summary when the map is unavailable.
- Rationale: These views are peer result contexts, which maps directly to accessible tabs. Manual activation is preferable because Forecast and Map are lazy-loaded and should not trigger network work on arrow-key focus movement. Text legends and fallback summaries satisfy the constitution’s accessibility baseline and the spec’s failure-state requirements.
- Alternatives considered:
  - Plain button group without tab semantics: visually simpler, but weaker for keyboard and screen-reader users.
  - Route-based navigation: adds URL complexity and breaks the single-result context unnecessarily.

## 6. Caching and Lazy Loading

- Decision: Use a lightweight two-tier cache: in-memory request caching plus `sessionStorage` persistence for forecast and point-inspection responses. Fetch Forecast only when the Forecast tab is opened; import and initialize the map only when the Map tab is opened; request overlay tiles only for the active overlay.
- Rationale: The spec explicitly requires per-view lazy loading. A small custom cache fits the current repo better than adding a full data-fetching framework and preserves responsiveness when users switch among views for the same location.
- Alternatives considered:
  - TanStack Query or SWR: capable, but unnecessary additional dependency surface for this feature scope.
  - No cache: simplest implementation, but causes avoidable re-fetching and weaker perceived performance.
  - `localStorage`: longer persistence, but stale-weather risk is higher than with session-scoped caching.

## 7. Testing Strategy

- Decision: Keep unit tests focused on forecast transforms, cache helpers, and overlay-selection logic; use integration tests for tabs, loading/error flows, and view-triggered fetch behavior; use Playwright only for key browser behaviors such as opening the map, switching overlays, and tapping to inspect a point.
- Rationale: The repository already uses Vitest for component logic and Playwright for browser flows. A thin map adapter allows jsdom tests to mock the map boundary without depending on third-party DOM internals, while browser tests cover the few interactions that need a real layout engine.
- Alternatives considered:
  - Browser-only testing: too slow and brittle for failure-path coverage.
  - Deep DOM assertions against Leaflet internals: tightly coupled to third-party markup and not stable across upgrades.

## 8. Open Questions Resolved for Planning

- Decision: There are no remaining `NEEDS CLARIFICATION` items that block design or task generation.
- Rationale: The spec now fixes overlay scope, forecast granularity, point-inspection interaction, and lazy-loading behavior, while this research resolves the concrete service and architectural choices needed for implementation planning.
- Alternatives considered:
  - Deferring overlay-source choice to implementation: rejected because it would leave the contracts and tasks underspecified.