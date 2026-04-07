# Toolnova

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

**`en`** · **`zh-CN`** · English | [简体中文](./README.zh-CN.md)

A collection of small online tools for developers and everyday work. Built with [Next.js](https://nextjs.org/) and [next-intl](https://next-intl.dev/), with English and Chinese (zh-CN) UI.

Application code lives in the `web/` directory.

## 🧰 Features

Tools include (non-exhaustive): Markdown preview, JSON/SQL formatters, UUID generator, Base64, timestamps, JWT decode, regex tester, diff checker, JSON to CSV, cron expression helper, time zone and date/age/loan/ROI calculators, image compression, PDF merge, and more. Routes and copy keys are defined in `web/lib/tool-routes.ts` and `web/messages/` per locale.

## 📋 Requirements

- Node.js 20+ (aligned with `@types/node` in `web/package.json` is fine)
- npm

## 💻 Local development

```bash
cd web
npm install
npm run dev
```

The app usually runs at <http://localhost:3000> (see the terminal output for the exact port).

## 🚀 Build and production

```bash
cd web
npm run build
npm run start
```

The project uses `output: "standalone"` for container-friendly deployments; see `docker-compose.yml` at the repo root for an example stack.

## 🔖 Versioning and changelog

| | |
| --- | --- |
| 📦 **Public version** | Single source of truth: `version` in `web/package.json`. |
| 📝 **Changelog** | [`CHANGELOG.md`](./CHANGELOG.md) at the repo root ([Keep a Changelog](https://keepachangelog.com/)). |
| 🔒 **Internal only** | Responses include `X-Toolnova-Version` (not shown in the UI); value from `web/package.json`. |

Suggested release flow:

1. Move items under `[Unreleased]` in `CHANGELOG.md` into a new dated section.
2. Bump `version` in `web/package.json` to match the changelog entry.
3. Optionally create a git tag (e.g. `v0.2.0`).

## 📄 License

If a `LICENSE` file exists at the repo root or under `web/`, that file applies.
