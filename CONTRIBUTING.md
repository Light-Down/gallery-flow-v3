# Contributing to Gallery Flow V3

Thank you for helping improve Gallery Flow V3.

## License Agreement

Gallery Flow V3 is licensed under `GPL-3.0-only`. By contributing code, documentation, design files, tests, or other project materials, you agree that your contribution is provided under the same license.

This keeps the project open: distributed modified versions must preserve the same open-source freedoms.

## Development Setup

```bash
npm install
npm run dev
```

PocketBase requires a local binary at `apps/pocketbase/pocketbase`. Runtime data, uploaded images, generated thumbnails, and local databases are not tracked in Git.

## Before Submitting Changes

Run the checks from the repository root:

```bash
npm run lint --prefix apps/web
npm run build --prefix apps/web
```

## Scope

Please keep changes focused. Gallery Flow V3 prioritizes:

- stable image upload and rendering
- fast admin workflows
- lightweight Hostinger-compatible architecture
- premium wedding gallery UX
- clean PocketBase migrations and source-controlled schema changes

Avoid committing local data, real client galleries, generated image files, PocketBase database files, binaries, or secrets.
