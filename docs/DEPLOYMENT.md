# Deployment Notes

Gallery Flow V3 currently uses a lightweight React/Vite frontend and PocketBase backend. It is not a Next.js app.

## Hostinger Business Direction

The intended production shape is:

- build the Vite frontend into static files
- run PocketBase as the backend service
- keep uploaded gallery files in PocketBase storage
- serve admin thumbnails through PocketBase `thumb` URLs
- avoid committing runtime data or generated thumbnails

## Build

```bash
npm install
npm run build --prefix apps/web
```

The frontend build is written to:

```text
dist/apps/web
```

## PocketBase Runtime

Download the PocketBase binary for the target server and place it at:

```text
apps/pocketbase/pocketbase
```

Set environment variables from `.env.example`, especially:

```text
PB_ENCRYPTION_KEY
PB_SUPERUSER_EMAIL
PB_SUPERUSER_PASSWORD
VITE_POCKETBASE_URL
```

Run PocketBase with:

```bash
npm run start --prefix apps/pocketbase
```

## Data Backups

Before deploying schema or migration changes, back up:

- PocketBase `pb_data`
- uploaded gallery images
- production environment variables

## Open Items Before Production

- document exact Hostinger Node.js app startup command
- decide final public file URL and PocketBase URL
- verify protected gallery image access after deployment
- confirm thumbnail generation and caching on production storage
- review migration history and remove obsolete legacy migrations when safe
