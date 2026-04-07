# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **色相环与配色参考**（`/color-wheel`）：Canvas 色相环、H/S/L 滑块与数值、HEX 应用、互补/分裂互补/三角/类似色/单色和谐方案、单块与整组复制 HEX、相对黑白 WCAG 对比度与预览条；URL `?hex=` 同步（`replaceState` 防抖）；中英文文案；新分类「日常与设计」。
- Light / dark appearance for the site with a header toggle; preference is stored in `localStorage` and mirrored to a `toolnova-theme` cookie so the server can emit the correct `dark` class on `<html>` without inline boot scripts.
- Navigation strings for the theme toggle (`themeUseLight` / `themeUseDark`) in `web/messages/*/common.json`.

### Changed

- Theme implementation avoids `next-themes` and any `<script>` / `next/script` bootstrapping in layouts, preventing React 19 console errors around script ordering and client-rendered `<script>` nodes.
- Markdown preview and CodeMirror themes follow the same resolved light/dark mode as the rest of the UI.
- Documentation: default README is English (`README.md`); Chinese copy in `README.zh-CN.md`, with cross-links.
- Documentation: README badges (stack) and light emoji / labels in section headings and the versioning table.

## [0.1.0] - 2026-04-07

### Added

- Initial public tooling surface: Next.js app under `web/` with locale routing (`en`, `zh-CN`).
- Developer tools: Markdown preview, JSON/SQL formatters, UUID, Base64, timestamp, JWT, regex tester, diff checker, JSON to CSV, cron generator, and related routes per `web/lib/tool-routes.ts`.
- Calculators and utilities: time zone, date/age/loan/ROI calculators, image compressor, PDF merge.
- Site chrome: header, footer, cookie consent, conditional analytics wiring.
- Internal deployment version exposed via `X-Toolnova-Version` response header (not shown in the UI); version source is `web/package.json`.
- Project documentation: root `README.md` and this changelog.
