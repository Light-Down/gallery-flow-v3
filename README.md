# Gallery Flow V3

Gallery Flow V3 is an open-source wedding gallery platform built with React, Vite, and PocketBase. The project focuses on fast admin workflows, stable image rendering, visual chapter creation, and a premium emotional gallery experience for photographers and couples.

## License

This project is licensed under GPL-3.0-only. Modified versions that are distributed must also keep the same open-source freedoms.

## Stack

- React and Vite frontend in `apps/web`
- PocketBase backend in `apps/pocketbase`
- npm workspaces from the repository root

## Getting Started

1. Install Node.js from `.nvmrc`.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Download the PocketBase binary for your platform into `apps/pocketbase/pocketbase` and make it executable.
4. Copy `.env.example` to `.env` and set strong local secrets.
5. Run the app:

   ```bash
   npm run dev
   ```

The web app runs through Vite and PocketBase serves the gallery backend on port `8090`.

## Repository Hygiene

Runtime data, uploaded images, generated thumbnails, local databases, build output, and PocketBase binaries are intentionally ignored. Keep only source code, migrations, hooks, and documentation in Git.

## Deployment Notes

The current architecture is intentionally lightweight for Hostinger Business hosting: Vite builds static frontend assets, PocketBase handles data/files, and admin thumbnails should use PocketBase thumbnail URLs instead of original high-resolution images.
