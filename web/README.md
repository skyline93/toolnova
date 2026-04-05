# Toolnova (web)

**English** | [简体中文](./README.zh-CN.md)

Next.js App Router frontend: tools, i18n (`en`, `zh-CN`), SEO (metadata, sitemap, JSON-LD), PDF merge API route. UI uses **Radix Themes** 3 (blue accent — Google-blue aligned — plus slate neutrals, white canvas, light elevation shadows) and Tailwind CSS 4 for light utility styling.

## Local development

```bash
npm install
cp .env.example .env.local
# edit NEXT_PUBLIC_SITE_URL (e.g. http://localhost:3000)
npm run dev
```

## Environment variables

See [`.env.example`](./.env.example). **`NEXT_PUBLIC_SITE_URL`** should be your real origin in production (no trailing slash).

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap, structured data |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4; **only loads after “Accept all”** on the cookie banner |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense client id (`ca-pub-…`) |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | Display ad unit slot id for the reserved footer placement |

## Launch checklist

1. Set **`NEXT_PUBLIC_SITE_URL`** on the host (Vercel project env, Docker `-e`, etc.).
2. Deploy production build: `npm run build` then start the standalone output or use the platform’s Next preset.
3. **Search Console**: verify property, submit `https://<domain>/sitemap.xml`.
4. **Cookie banner**: first-time visitors must choose analytics or essential-only; GA/AdSense scripts run only after **Accept all**.
5. **AdSense**: apply in Google; after approval set client + slot env vars; until then the footer shows a reserved placeholder (fixed min-height to limit CLS).
6. **GA4**: optional; set measurement ID if you want stats after consent.

## Docker

The app is configured with `output: "standalone"` in `next.config.ts`. Build the image from the `web/` directory using the included `Dockerfile` (if present) or your own multi-stage build copying `.next/standalone`.

## Stack notes

- UI: [`@radix-ui/themes`](https://www.radix-ui.com/themes) v3 (global `Theme`, layout primitives, form controls). Styles load via `@radix-ui/themes/styles.css`; root `Theme` uses `accentColor: blue` (aligned with Google blue for links/buttons), `grayColor: slate`, `panelBackground: solid`, `radius: large`, `hasBackground` on. `globals.css` forces a white light canvas (`--color-background: #fff`), adds subtle `box-shadow` on cards, buttons, fields, segmented control, and native file/select controls, and tunes CodeMirror JSON tokens to the same blue family.
- Styling: Tailwind CSS 4 (`globals.css` + `@theme`) for fonts, CodeMirror/markdown helpers, and a few native controls (e.g. long `<select>` lists).
- Internationalization: `next-intl`, locale prefix `as-needed` (English unprefixed).
- Middleware handles locale detection; PDF merge lives at `/api/merge-pdf` (not localized).
