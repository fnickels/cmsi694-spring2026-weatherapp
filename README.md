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
- In deployed environments, geolocation requires HTTPS.
- If location access is denied or unavailable, use manual city search.

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