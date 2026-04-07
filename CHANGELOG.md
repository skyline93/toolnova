# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **ND 减光镜计算器**（`/nd-calculator`）：基准快门（预设/自定义）、ND 倍数或挡位、多片叠加；等效快门展示、摘要复制；`web/lib/nd-filter.ts` 纯函数；中英文文案。
- 文档：`docs/8-ND减光镜计算器-规格说明.md`（ND 曝光换算工具的产品与技术规格，含数学模型、接入清单与分期）。
- **色相环与配色参考**（`/color-wheel`）：Canvas 色相环、H/S/L 滑块与数值、HEX 应用、互补/分裂互补/三角/类似色/单色和谐方案、单块与整组复制 HEX、相对黑白 WCAG 对比度与预览条；URL `?hex=` 同步（`replaceState` 防抖）；中英文文案；新分类「日常与设计」。
- Light / dark appearance for the site with a header toggle; preference is stored in `localStorage` and mirrored to a `toolnova-theme` cookie so the server can emit the correct `dark` class on `<html>` without inline boot scripts.
- Navigation strings for the theme toggle (`themeUseLight` / `themeUseDark`) in `web/messages/*/common.json`.

### Fixed

- **Markdown 预览**（分栏模式）：`web/app/globals.css` 中为分栏 Grid 使用 `minmax(0, 1fr)`，并为源码/预览列及编辑区 Flex 链路设置 `min-width: 0`，避免长代码块或宽表格通过 min-content 挤占对侧宽度；预览列增加 `overflow-x: auto` 以在列内横向滚动溢出内容。

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
