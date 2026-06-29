# PixelDay Server

Small API for PixelDay data. The Expo app should call this API over HTTPS; it should not connect directly to PostgreSQL.

## Local Setup

```bash
cp .env.example .env
npm install
npm run migrate
npm run dev
```

Health check:

```bash
curl http://127.0.0.1:8787/health
```

## Arch Server Shape

- PostgreSQL listens on localhost only.
- Node API listens on `127.0.0.1:8787` or a private interface.
- Caddy/Nginx terminates HTTPS for `api.qtitpc.dev`.
- Expo app calls `https://api.qtitpc.dev`.

## Deploy Notes

Example deployment files live in `deploy/`:

- `postgres.bootstrap.sql`
- `pixelday-api.service`
- `Caddyfile.example`

Expected server path: `/opt/pixelday/server`.

Basic Arch package set:

```bash
sudo pacman -Syu nodejs npm postgresql caddy
```

## First Tables

- `users`
- `tasks`
- `diary_entries`
- `calendar_events`

The API uses `x-user-id` for development. Real auth can replace this later without changing the data model much.
