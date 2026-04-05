# Production deployment (Docker)

This document describes how to build and run the Toolnova web app in production using Docker. The runtime image is self-contained (Next.js `output: "standalone"`); you do not mount application source into the container.

For the Chinese version, see [production-deployment.zh-CN.md](./production-deployment.zh-CN.md).

## Prerequisites

- Docker Engine and the Docker Compose plugin (`docker compose`), or Docker Desktop.
- On the build host: the full `web/` project tree (or CI checkout) as build context for `Dockerfile`.
- On a **pull-only** host: a pushed image in a registry; no source tree required for `docker run`.

## Build-time environment variables

All `NEXT_PUBLIC_*` values are inlined into the client bundle during `next build`. Changing them requires **rebuilding the image**; setting them only at `docker run` with `-e` does **not** update already-built assets.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_SITE_URL` | Yes (production) | Canonical site origin, **no trailing slash** (metadata, sitemap, JSON-LD). |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics 4 measurement ID. Loaded only after the user accepts analytics in the cookie banner. |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | No* | AdSense publisher id (`ca-pub-…`). |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | No* | Display ad slot id for the footer placement. |

\*For the footer ad slot to request ads, **both** AdSense variables must be set at build time. Omit them until your site is approved in AdSense if you prefer the placeholder footer.

Runtime variables `PORT` and `HOSTNAME` are set in the image (`3000` / `0.0.0.0`); override only if you know you need to.

## Option A: Docker Compose + Makefile (recommended)

**Build and run are separate.** `docker compose up` does **not** build images. Build on a dev machine or in CI, push (or transfer) the image, then start on production with an existing image only.

### 1. Build (dev / CI)

From the `web/` directory, with your real origin and optional `NEXT_PUBLIC_*` values:

```bash
make build NEXT_PUBLIC_SITE_URL=https://example.com

# Optional analytics / AdSense (all build-time)
make build \
  NEXT_PUBLIC_SITE_URL=https://example.com \
  NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX \
  NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX \
  NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=1234567890
```

You can put `NEXT_PUBLIC_*` in a local `web/.env` for convenience when running `make build` (do not commit secrets unnecessarily). Those variables are **not** read by Compose for starting the container—only `docker build` uses them.

### 2. Start (production or any host with the image)

After `docker pull your-registry/toolnova-web:1.0.0` (or the image is already local), from `web/`:

```env
# web/.env on the server (example — no NEXT_PUBLIC_* needed here)
TOOLNOVA_WEB_IMAGE=your-registry/toolnova-web:1.0.0
WEB_PORT=3000
```

```bash
make up
```

Or without `.env`: `make up IMAGE=your-registry/toolnova-web:1.0.0 WEB_PORT=3000`.

Useful targets: `make build`, `make up`, `make down`, `make logs`, `make rebuild` (no-cache build + up), `make print-run`, `make print-docker-build`. See `make help`.

## Option B: `docker build` + `docker run` (no Makefile)

Build from `web/`:

```bash
docker build -t toolnova-web:latest \
  --build-arg NEXT_PUBLIC_SITE_URL=https://example.com \
  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID= \
  --build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID= \
  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER= \
  -f Dockerfile .
```

Omit optional `--build-arg` lines entirely if your Docker version allows it; otherwise pass empty strings as above.

Run (image must already exist locally or after `docker pull`):

```bash
docker run -d --name toolnova-web --restart unless-stopped -p 3000:3000 toolnova-web:latest
```

Adjust the host port (`3000:3000` → `8080:3000`) and image name/tag as needed. Do not bind-mount the app source for production serving.

To print a copy-paste build command with current Makefile variables:

```bash
make print-docker-build
```

## Option C: Registry workflow

1. Build and tag on CI or a builder machine (with the same `--build-arg` values as production).
2. `docker push your-registry/toolnova-web:1.0.0`
3. On the server: `docker pull your-registry/toolnova-web:1.0.0` and `docker run ... your-registry/toolnova-web:1.0.0`

The bundled `docker-compose.yml` defines **only** `image:` (no `build:`), so production can start as soon as the image is present.

## Operational checklist

1. Set **`NEXT_PUBLIC_SITE_URL`** to the real HTTPS origin (no trailing slash).
2. Configure optional GA / AdSense at **build** time if required.
3. Put TLS termination in front of the container (reverse proxy, load balancer, or platform ingress) for public HTTPS.
4. Search Console: verify the property and submit `https://<domain>/sitemap.xml`.
5. Cookie / consent: GA and AdSense scripts load only after **Accept all**; plan messaging and policy accordingly.

## Troubleshooting

- **`docker compose up` / `make up` fails with image not found**: Build or pull the image first (`make build` on a dev host, or `docker pull` on the server). Compose does not build images.
- **Wrong canonical URL or analytics in the browser after deploy**: Rebuild the image with corrected `NEXT_PUBLIC_*` build args; restart is not enough without a rebuild.
- **Port already in use**: Change the host port in Compose (`WEB_PORT`) or `docker run -p`.
- **Name already in use**: `docker rm -f toolnova-web` (or your container name) before starting a new one.
