# Retail Operations Dashboard

A self-contained retail analytics dashboard built as a public portfolio demo. It showcases store-location performance, fulfillment operations, customer demand intelligence, filtering, pagination, sorting, and chart aggregation using deterministic generated data.

This project is intentionally sanitized. It does not include company data, workplace databases, internal services, production credentials, OAuth configuration, Firebase, MongoDB, Redis, or internal branding.

## What This Demonstrates

- Express API with TypeScript contracts
- Deterministic in-memory demo data
- Indexed filtering and sorting
- Pagination for dashboard tables
- Chart aggregation endpoints
- Fulfillment drilldown workflow
- Demand intelligence views for locations and SKUs
- Dark and light theme support
- Jest coverage for retail filtering and services
- Docker packaging
- Vercel-compatible deployment

## Tech Stack

- Node.js
- Express
- TypeScript
- Jest
- Chart.js
- Tailwind runtime for the static dashboard UI
- Docker and Docker Compose
- Vercel serverless adapter

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:7778
```

The app starts in demo mode by default. No login, database, cache, or third-party auth provider is required.

## Environment

The demo works without creating a local `.env` file. Optional values are documented in `.env.example`:

```bash
NODE_ENV=development
PORT=7778
AUTH_MODE=disabled
LOG_LEVEL=info
```

Keep `AUTH_MODE=disabled` for the public portfolio demo.

## Scripts

```bash
npm run dev
npm run build
npm start
npm test
```

`npm run build` compiles TypeScript into `dist`.

`npm start` runs the compiled Express server.

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

Open:

```text
http://localhost:7778
```

The Docker image runs only the sanitized demo app and generated in-memory data.

## Vercel Deployment

This repository includes `vercel.json` and `api/index.ts`.

Recommended Vercel settings:

```text
Build Command: npm run build
Output Directory: public
Install Command: npm install
```

No Vercel environment variables are required for the demo.

Do not add workplace secrets, production database URLs, OAuth credentials, Firebase service accounts, or internal environment variables to Vercel.

## Public API

Retail dashboard:

```text
GET /api/retail/locations
GET /api/retail/locations/charts
```

Fulfillment:

```text
GET /api/retail/fulfillment/summary
GET /api/retail/fulfillment/location/:locationId
```

Demand intelligence:

```text
GET /api/retail/demand/weeks
GET /api/retail/demand/query
GET /api/retail/demand/categories
GET /api/retail/demand/trend/:locationName
```

Health:

```text
GET /health
```

## Demo Data

The dashboard generates retail-focused demo data at runtime:

- 72 store locations
- Multiple countries and regions
- Store statuses such as Active, Paused, Under Review, and Closed
- Store formats such as Flagship, Outlet, Marketplace, and Franchise
- Tags such as High Growth, At Risk, Premium, Seasonal, and Omnichannel
- Fulfillment summaries and SKU leaderboards
- Demand rankings for locations and products

The data is deterministic so tests and demos are repeatable.

## Testing

Run:

```bash
npm test
```

Coverage focuses on:

- Region, country, status, source, format, tag, and priority fulfillment filters
- Sorting by performance score and location name
- Pagination behavior
- Chart aggregation
- Demand intelligence response shape

## Portfolio Positioning

This is a sanitized public demo inspired by real retail operations dashboard patterns. It is designed to show architecture, API design, frontend interactions, deployment packaging, and testing approach without exposing private company systems or data.

Suggested public description:

```text
Retail Operations Dashboard is a self-contained demo rebuilt with generated data to showcase backend API design, dashboard UX, chart aggregation, filtering, pagination, Docker packaging, and Vercel deployment readiness.
```

## Privacy And Secrets

Before publishing, verify:

```bash
rg "company-name|internal|secret|firebase|mongo|redis|oauth|client_secret|private_key|password|token" .
```

Expected exclusions:

- `.env`
- `node_modules`
- `dist`
- `coverage`
- local editor files
- git metadata

Never commit local secrets or workplace configuration.
