# Toolnova (web)

**English** | [简体中文](./README.zh-CN.md)

Next.js App Router frontend: tools, i18n (`en`, `zh-CN`), SEO (metadata, sitemap, JSON-LD), PDF merge API route. UI uses **Radix Themes** 3 (blue accent — Google-blue aligned — plus slate neutrals, white canvas, light elevation shadows) and Tailwind CSS 4 for light utility styling.

## Quick start

**Docker (production-style image)** — build once (dev/CI), then start without building. From repo root:

```bash
cd web
make build NEXT_PUBLIC_SITE_URL=https://your-domain.com
make up
```

On production, use an image you already pushed or loaded (`make up IMAGE=your-registry/toolnova-web:tag`). Optional build-time variables (`NEXT_PUBLIC_GA_MEASUREMENT_ID`, AdSense ids) are documented in [docs/production-deployment.md](./docs/production-deployment.md). Run `make help` for all Makefile targets.

**Local development** — install dependencies, copy env, start dev server:

```bash
cd web
npm install
cp .env.example .env.local
# set NEXT_PUBLIC_SITE_URL (e.g. http://localhost:3000)
npm run dev
```

## Local development

Same commands as in [Quick start](#quick-start) (local dev block above).

## Environment variables

See [`.env.example`](./.env.example). **`NEXT_PUBLIC_SITE_URL`** should be your real origin in production (no trailing slash).

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap, structured data |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4; **only loads after “Accept all”** on the cookie banner |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense client id (`ca-pub-…`) |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | Display ad unit slot id for the reserved footer placement |
| `MARKDOWN_EXPORT_BASE_FONT_PX` | Optional **server-only** (no `NEXT_PUBLIC_`): Markdown HTML/PDF export base font size (12–22 px); default 14 |

## Launch checklist

1. Set **`NEXT_PUBLIC_SITE_URL`** at **build time** for Docker (Makefile / Compose `.env` / `docker build --build-arg`); for Vercel, use project env before build. See [docs/production-deployment.md](./docs/production-deployment.md).
2. Deploy production build: `npm run build` then start the standalone output, use Docker as in the docs, or use the platform’s Next preset.
3. **Search Console**: verify property, submit `https://<domain>/sitemap.xml`.
4. **Cookie banner**: first-time visitors must choose analytics or essential-only; GA/AdSense scripts run only after **Accept all**.
5. **AdSense**: apply in Google; after approval set client + slot env vars; until then the footer shows a reserved placeholder (fixed min-height to limit CLS).
6. **GA4**: optional; set measurement ID if you want stats after consent.

## Docker

The app uses `output: "standalone"` in `next.config.ts`. Production-oriented build and run instructions (Compose, Makefile, `docker run`, registry flow) are in [docs/production-deployment.md](./docs/production-deployment.md).

## Stack notes

- UI: [`@radix-ui/themes`](https://www.radix-ui.com/themes) v3 (global `Theme`, layout primitives, form controls). Styles load via `@radix-ui/themes/styles.css`; root `Theme` uses `accentColor: blue` (aligned with Google blue for links/buttons), `grayColor: slate`, `panelBackground: solid`, `radius: large`, `hasBackground` on. `globals.css` forces a white light canvas (`--color-background: #fff`), adds subtle `box-shadow` on cards, buttons, fields, segmented control, and native file/select controls, and tunes CodeMirror JSON tokens to the same blue family.
- Styling: Tailwind CSS 4 (`globals.css` + `@theme`) for fonts, CodeMirror/markdown helpers, and a few native controls (e.g. long `<select>` lists).
- Internationalization: `next-intl`, locale prefix `as-needed` (English unprefixed).
- Middleware handles locale detection; PDF merge lives at `/api/merge-pdf` (not localized).
