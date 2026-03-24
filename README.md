# cmsi694-spring2026-weatherapp

Location-based current weather web app built with React + Vite.

## Installation

```bash
npm install
```

## Running Locally

```bash
npm run dev
```

App runs at http://localhost:5173.

## Geolocation Requirements

- Geolocation works on `localhost` during local development.
- In deployed environments, geolocation **requires HTTPS** — the browser will not expose location data over plain HTTP.
- On first visit, the site automatically requests your location and loads local weather. Allow the browser prompt to see instant results.
- If location access is denied, unavailable, or times out after 5 seconds, a notice is shown and you can still search by city name manually.
- When a geolocation request fails, no browser-locale or fixed default weather is auto-loaded; manual search remains the fallback path.
- Clicking Use My Location after denial or timeout retries geolocation.

## Implemented Changes

- Weather card now displays latitude/longitude using hemisphere notation (for example, `34.05° N | 118.24° W`).
- Local time is shown as `Location's Local Time` and includes both timezone abbreviation and IANA timezone (for example, `PDT (America/Los_Angeles)`).
- Auto-detected weather remains clearly marked with an `Auto-located` badge.
- For unresolved locations, the label shows `Location (approximate)`.
- `Coordinates fall within` is now conditional: it only appears when a meaningful city is not available, using fallback area inference from state/country, then timezone area, then coordinate zone.

## Testing

```bash
npm test
```

Run non-watch test mode:

```bash
npx vitest run
```

## E2E Testing (Playwright)

Install browser binaries:

```bash
npx playwright install chromium firefox webkit
```

On Linux, install host dependencies if prompted:

```bash
sudo npx playwright install-deps
```

Run browser E2E suite:

```bash
npm run e2e
```

Run headed mode:

```bash
npm run e2e:headed
```

## Building

```bash
npm run build
```

Preview build output:

```bash
npm run preview
```