# PixelDay Deploy

## Data on the server

Docker mounts app data into:

```text
./server-data
```

Diary text and photos are mirrored by day:

```text
server-data/
  users/
    <user-id>/
      diary/
        2026-06-29/
          entry.txt
          entry.json
          1782735411597-photo.jpg
```

PostgreSQL still stores the canonical app data. The folder above is for easy inspection and backup of diary text/photos.

## Docker

Create env:

```bash
cp .env.docker.example .env
```

Edit `.env`:

```text
POSTGRES_PASSWORD=...
PUBLIC_BASE_URL=https://api-platform.qtitpc.dev
EXPO_PUBLIC_API_URL=https://api-platform.qtitpc.dev
PERSONAL_USER_EMAIL=your-email@example.com
PERSONAL_USER_NAME=Your Name
```

Build and start:

```bash
docker compose up -d --build
```

Check API:

```bash
curl http://127.0.0.1:8787/health
```

Open logs:

```bash
docker compose logs -f api
```

## Domain with a separate Cloudflare Tunnel

This repo uses a separate tunnel for PixelDay API:

```text
Name: pixelday-api-platform
ID: 44df062a-b2f1-4843-935a-6a659367315a
Hostname: api-platform.qtitpc.dev
```

The config is:

```bash
deploy/cloudflared-api-platform.yml
```

Run the tunnel:

```bash
cloudflared tunnel --config deploy/cloudflared-api-platform.yml run
```

To install it as a service without touching other tunnel configs, copy this file to its own path first:

```bash
sudo mkdir -p /etc/cloudflared-pixelday
sudo cp deploy/cloudflared-api-platform.yml /etc/cloudflared-pixelday/config.yml
sudo cloudflared --config /etc/cloudflared-pixelday/config.yml service install
```

The DNS route was created with:

```bash
cloudflared tunnel route dns pixelday-api-platform api-platform.qtitpc.dev
```

If you use Caddy instead of Cloudflare Tunnel, `deploy/Caddyfile.docker.example` has the equivalent reverse proxy.

## Build APK

Install EAS CLI if needed:

```bash
npm install -g eas-cli
```

Login and build an APK:

```bash
eas login
eas build -p android --profile preview
```

The `preview` profile in `eas.json` builds an APK and points the app at:

```text
https://api-platform.qtitpc.dev
```

For Play Store later:

```bash
eas build -p android --profile production
```

That produces an Android App Bundle (`.aab`).
