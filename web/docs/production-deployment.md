# Production deployment (Docker)

Deploy **Web (Next.js standalone)** and **Markdown PDF (Python + Playwright)** from the **repository root** using `docker-compose.yml` and `Makefile`. Images are self-contained; do not bind-mount application source.

For the Chinese version, see [production-deployment.zh-CN.md](./production-deployment.zh-CN.md).

## Prerequisites

- Docker Engine and the Compose plugin (`docker compose`), or Docker Desktop.
- **Build host**: full repo checkout (at least `web/` and `services/markdown-pdf/`) for `docker build` / `make build`.
- **Run-only host**: root **`docker-compose.yml`** + optional **`.env`** + **pulled or loaded images** — **no** source tree required on the server.

## Files at repository root

| File | Role |
|------|------|
| `docker-compose.yml` | `web` + `markdown-pdf` services, **`image:` only** (no `build:`) |
| `Makefile` | Build images, `compose up/down/logs` |
| `.env.example` | Copy to `.env`; set image names, ports, PDF secrets |

From **`toolnova/`** (repo root):

```bash
docker compose up -d
# or
make up
```

## Build-time variables (web image)

All `NEXT_PUBLIC_*` values are inlined at `next build`. Changing them requires **rebuilding the web image**; restarting the container is not enough.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Canonical origin, **no trailing slash**. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | GA4; loaded only after cookie consent. |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | No* | AdSense publisher id. |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | No* | Footer display slot id. |

\*Both AdSense vars must be set at **build** time for the footer slot to request ads.

Build from **repo root**:

```bash
make build-web NEXT_PUBLIC_SITE_URL=https://example.com

# or web + pdf
make build NEXT_PUBLIC_SITE_URL=https://example.com
```

You may put `NEXT_PUBLIC_*` in root `.env` for `make build-web` (do not commit secrets).

## Runtime variables (Compose / `.env`)

See root **`.env.example`**. Highlights:

| Variable | Purpose |
|----------|---------|
| `TOOLNOVA_WEB_IMAGE` | Web image ref (default `toolnova-web:latest`) |
| `TOOLNOVA_MARKDOWN_PDF_IMAGE` | PDF image ref (default `toolnova-markdown-pdf:latest`) |
| `WEB_PORT` | Host port (default `3000`) |
| `PDF_SERVICE_URL` | Default `http://markdown-pdf:8000` inside Compose |
| `PDF_SERVICE_SECRET` / `PDF_INTERNAL_API_TOKEN` | Optional shared secret |

### Start production (images already local)

```bash
cd /path/to/toolnova   # only compose + .env; source optional
docker pull your-registry/toolnova-web:1.0.0
docker pull your-registry/toolnova-markdown-pdf:1.0.0
# set TOOLNOVA_*_IMAGE in .env
docker compose up -d
```

### Running Make from `web/`

`web/Makefile` **forwards** to the repo root:

```bash
cd web && make up
cd web && make build-web NEXT_PUBLIC_SITE_URL=https://example.com
```

## Useful Make targets

| Target | Description |
|--------|-------------|
| `make` / `make up` | `docker compose up -d` (no build) |
| `make down` | Stop and remove containers |
| `make logs` | Follow web + markdown-pdf logs |
| `make ps` | Compose status |
| `make build` | Build web + pdf images |
| `make build-web` / `make build-pdf` | Build one image |
| `make build-amd64` | linux/amd64 via buildx (e.g. Apple Silicon) |
| `make rebuild` | No-cache build both, then up |
| `make print-docker-build` | Print raw `docker build` lines |

## Option B: raw `docker build` + `docker compose`

From repo root:

```bash
docker build -t toolnova-web:latest \
  --build-arg NEXT_PUBLIC_SITE_URL=https://example.com \
  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID= \
  --build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID= \
  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER= \
  -f web/Dockerfile web

docker build -t toolnova-markdown-pdf:latest \
  -f services/markdown-pdf/Dockerfile services/markdown-pdf

docker compose up -d
```

## Option C: Registry workflow

1. CI builds and `docker push` both images.
2. On the server: `docker pull`, place root `docker-compose.yml` + `.env`, run `docker compose up -d`.

## Markdown PDF export

See [docs/5-Markdown导出PDF-Python-Playwright方案.md](../../docs/5-Markdown导出PDF-Python-Playwright方案.md). Compose sets `PDF_SERVICE_URL=http://markdown-pdf:8000` by default.

## Launch checklist

1. Set **`NEXT_PUBLIC_SITE_URL`** when building the web image.
2. Set GA / AdSense at **build** time if needed.
3. Terminate TLS in front of the stack (reverse proxy / Ingress).
4. **Google Search Console**: verify and submit `https://<host>/sitemap.xml`.
5. Respect cookie consent before loading GA / AdSense.

## Troubleshooting

- **`Image ... not found`**: `docker pull` or build locally first; Compose does **not** build.
- **Stale site URL or analytics**: rebuild the **web** image with correct `NEXT_PUBLIC_*`.
- **Port in use**: change `WEB_PORT` in `.env`.
- **Web only (no PDF)**: use a custom override or edit compose to drop `markdown-pdf` and set `PDF_SERVICE_URL` accordingly; the default stack runs both.
