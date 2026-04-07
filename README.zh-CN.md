# Toolnova

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

**`en`** · **`zh-CN`** · [English](./README.md) | 简体中文

面向开发者与日常办公场景的在线小工具集合，基于 [Next.js](https://nextjs.org/) 与 [next-intl](https://next-intl.dev/) 构建，支持中文与英文界面。

应用代码位于 `web/` 目录。

## 🧰 功能概览

当前内置工具包括但不限于：Markdown 预览、JSON / SQL 格式化、UUID 生成、Base64、时间戳、JWT 解析、正则测试、文本对比、JSON 转 CSV、Cron 表达式、时区与日期/年龄/贷款/ROI 等计算器、图片压缩、PDF 合并、**色相环与配色参考**等。路由与文案键名见 `web/lib/tool-routes.ts` 与各语言 `web/messages/`。

## 📋 环境要求

- Node.js 20+（与 `web/package.json` 中 `@types/node` 一致即可）
- npm

## 💻 本地开发

```bash
cd web
npm install
npm run dev
```

默认在 <http://localhost:3000> 启动（具体端口以终端输出为准）。

可选环境变量见 `web/.env.example`（例如 Markdown 导出字号 `MARKDOWN_EXPORT_BASE_FONT_PX`）；本地开发将文件复制为 `web/.env` 后按需填写。

## 🚀 构建与生产启动

```bash
cd web
npm run build
npm run start
```

项目使用 `output: "standalone"`，便于容器化部署；仓库根目录的 `docker-compose.yml` 可作为参考编排示例。

## 🔖 版本与变更记录

| | |
| --- | --- |
| 📦 **对外版本号** | 以 `web/package.json` 的 `version` 为唯一来源。 |
| 📝 **变更日志** | 仓库根目录 [`CHANGELOG.md`](./CHANGELOG.md)（[Keep a Changelog](https://keepachangelog.com/)）。 |
| 🔒 **内部可见、页面不展示** | HTTP 响应头 `X-Toolnova-Version`，便于运维与排查。 |

发布新版本时建议顺序：

1. 在 `CHANGELOG.md` 中整理 `[Unreleased]` 下的条目，并新增带日期的版本小节。
2. 将 `web/package.json` 中的 `version` 与变更日志中的版本号对齐。
3. 按需创建对应的 git tag（例如 `v0.2.0`）。

## 📄 许可证

若仓库根目录或 `web/` 下另有 `LICENSE` 文件，以该文件为准。
