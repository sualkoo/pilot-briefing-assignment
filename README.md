# Pilot Briefing

A pre-flight weather briefing tool for pilots. Enter ICAO airport codes or WMO country codes, select one or more report types, and get the latest aviation weather data in a single view.

**Supported report types:**

- **METAR** — current surface observations
- **TAF** — terminal aerodrome forecasts
- **SIGMET** — significant meteorological hazard alerts

Weather data is fetched from the [IBLSoft OPMET RPC API](https://ogcie.iblsoft.com/ria/opmetquery). Results are grouped by station and displayed in a paginated table.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [Angular CLI](https://angular.dev/tools/cli) 21

```bash
npm install -g @angular/cli
```

## Setup

```bash
npm install
```

## Running locally

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

## Running unit tests

```bash
npm test
```

## Production build

```bash
npm run build
```

Build artifacts are placed in the `dist/` directory.
