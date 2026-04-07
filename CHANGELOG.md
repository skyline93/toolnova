# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

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
