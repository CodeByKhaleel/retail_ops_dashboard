# Deployment Notes

This project is intended to deploy as a sanitized demo.

## Vercel

1. Create a new Vercel project from the GitHub repository.
2. Use these settings:

```text
Build Command: npm run build
Install Command: npm install
Output Directory: leave empty
```

3. Do not configure environment variables unless you are changing the demo defaults.
4. Deploy.

The included `vercel.json` routes requests to the Express app exported from `api/index.ts`. The serverless function includes `public/**`, so Express serves the static dashboard assets and API routes from the same sanitized demo app.

## Docker

Run locally:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:7778
```

## GitHub Publishing Checklist

Before the first push:

```bash
npm test
npm run build
rg "Edvoy|Firebase|Mongo|Redis|OAuth|oauth|client_secret|private_key|password|production|internal" .
```

Do not commit `.env`, local credentials, work docs, database dumps, screenshots containing private data, or old git history from a workplace repository.
