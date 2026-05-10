# Security Policy

## Supported Version

The `main` branch is the active development line.

## Reporting a Vulnerability

Please do not publish sensitive vulnerabilities in public issues. Use GitHub's private vulnerability reporting or contact the maintainer directly if private reporting is not available.

Useful details include:

- affected commit or version
- reproduction steps
- expected impact
- whether uploaded gallery files or authentication are involved

## Sensitive Data

Do not commit:

- `.env` files
- PocketBase `pb_data` folders
- uploaded gallery images
- generated thumbnails
- passwords, tokens, API keys, or real client data
- local PocketBase binaries

Use `.env.example` as the public template for required environment variables.
