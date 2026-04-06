# Toolnova 前端在 Vercel 上部署指南

本文说明如何将仓库中的 **Next.js 应用**（目录 `web/`）部署到 [Vercel](https://vercel.com)。适用于本仓库当前结构：根目录为 monorepo，前端代码在 `web/`。

---

## 1. 概述

| 项目 | 说明 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 包管理 | `npm`（以 `web/package-lock.json` 为准） |
| 国际化 | `next-intl`，语言 `en`、`zh-CN` |
| 与 Docker 的差异 | 根目录 `Makefile` / `web/Dockerfile` 面向自建容器；Vercel 使用平台托管的 Node 运行时，**不需要**在 Vercel 上构建 Docker 镜像 |

部署完成后，访问域名应能正常打开站点；若需 **Markdown 导出 PDF**，还需单独部署 PDF 后端并配置服务端环境变量（见第 5 节）。

---

## 2. 前置条件

1. [Vercel](https://vercel.com) 账号（可用 GitHub / GitLab / Bitbucket 登录）。
2. 本仓库已推送到 Git 托管平台，且你有权限连接 Vercel。
3. 本地可执行 `cd web && npm ci && npm run build` 通过（与 CI 一致）。

---

## 3. 在 Vercel 创建项目

### 3.1 从 Git 导入

1. 登录 Vercel → **Add New…** → **Project**。
2. **Import** 你的 `toolnova` 仓库。
3. **Configure Project** 时务必设置：

| 配置项 | 建议值 |
|--------|--------|
| **Framework Preset** | Next.js（通常会自动识别） |
| **Root Directory** | `web` |
| **Build Command** | `npm run build`（默认即可） |
| **Install Command** | `npm ci`（推荐锁定依赖；也可用默认 `npm install`） |
| **Output Directory** | 留空（Vercel 对 Next.js 会自动处理，勿填 `out` 除非你做静态导出） |

> **说明**：`web/next.config.ts` 中配置了 `output: "standalone"`，主要用于 **Docker** 产出独立目录；在 Vercel 上平台仍按标准 Next 构建部署，当前仓库本地 `npm run build` 已通过，一般无需为 Vercel 单独改配置。若遇平台兼容问题，再查阅 Vercel / Next 最新文档。

### 3.2 Node 版本

在 **Project → Settings → General → Node.js Version** 中选择与本地开发一致的 LTS（例如 **22.x**），与 `web/Dockerfile` 中的 `node:22` 对齐可减少环境差异。

---

## 4. 环境变量（必看）

在 **Project → Settings → Environment Variables** 中配置。区分：

- **客户端可见**：以 `NEXT_PUBLIC_` 开头，会打进浏览器端 bundle。
- **仅服务端**：无此前缀，只在 Serverless / Node 运行时可用（例如 API Route）。

### 4.1 建议至少配置

| 变量名 | 环境 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SITE_URL` | Production（建议 Preview 也设） | **生产站点完整 URL**，无尾部斜杠，例如 `https://www.example.com`。用于 `sitemap.xml`、`robots.txt`、站内绝对链接（见 `web/lib/site.ts`）。未设置时开发默认回退为 `http://localhost:3000`，**生产务必设置**，否则 SEO 与 canonical 会错误。 |

### 4.2 可选（分析与广告）

与根目录 `.env.example`、`Makefile` 中说明一致，按需填写：

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 衡量 ID |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense 客户端 ID |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | 页脚广告位 slot |

未设置时，相关组件会静默不加载（见 `web/components/conditional-analytics.tsx`、`ad-slot.tsx`）。

### 4.3 Markdown 导出 PDF（依赖独立后端）

`POST /api/markdown-pdf` 会将渲染后的 HTML 转发到 **外部 PDF 服务**（仓库内为 `services/markdown-pdf`，Playwright 方案）。在 Vercel 上需配置：

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `PDF_SERVICE_URL` | 使用导出 PDF 功能时 **必填** | PDF 服务的根地址，**不要**带末尾路径；代码会请求 `{PDF_SERVICE_URL}/v1/pdf`。须为 Vercel 服务器能访问的 **HTTPS** 地址（公网或可路由到你的 PDF 服务）。 |
| `PDF_SERVICE_SECRET` | 可选 | 若 PDF 服务启用了内部 Token，与此处一致；请求头会带 `X-Internal-Token`（见 `web/app/api/markdown-pdf/route.ts`）。 |

未配置 `PDF_SERVICE_URL` 时，该 API 返回 **503**，前端「导出 PDF」不可用；其余页面不受影响。

**部署 PDF 服务的常见方式**（择一即可）：

- 自有服务器 / 另一云厂商上跑 `services/markdown-pdf` 的 Docker 镜像；
- 与当前站同域反代（需自行配置网关与证书）。

确保 PDF 服务允许来自 Vercel 出口 IP 的访问（若你做了 IP 白名单，需放行或改为 Token 校验）。

### 4.4 环境作用域

对 `NEXT_PUBLIC_SITE_URL`：Production 填正式域名；Preview 可填 Vercel 预览域名（如 `https://xxx.vercel.app`），便于预览环境 sitemap/robots 正确。

不要将 **密钥** 提交到 Git；仅在 Vercel 控制台或团队密钥管理中配置。

---

## 5. 域名与 HTTPS

1. **Project → Settings → Domains** 添加自定义域名，按提示在 DNS 服务商处配置 **CNAME** 或 **A** 记录。
2. Vercel 自动提供 HTTPS。
3. 将 **`NEXT_PUBLIC_SITE_URL`** 设为该域名的 `https://` 地址，与浏览器实际访问一致。

---

## 6. 部署与预览

- **生产**：推送到在 Vercel 中绑定的 **Production** 分支（多为 `master` / `main`）会触发生产部署。
- **预览**：其他分支或 Pull Request 会生成 **Preview URL**，便于联调。

每次部署完成后，在部署详情页查看 **Build Logs**，确认 `npm run build` 成功。

---

## 7. 部署后自检清单

- [ ] 首页与各工具页可打开，语言切换（`en` / `zh-CN`）正常。
- [ ] `https://你的域名/sitemap.xml`、`/robots.txt` 中的 URL 为预期域名（依赖 `NEXT_PUBLIC_SITE_URL`）。
- [ ] 若使用 GA/AdSense：浏览器无相关脚本报错，合规提示（如 Cookie 横幅）符合你的政策。
- [ ] 若使用 Markdown 导出 PDF：`PDF_SERVICE_URL` 已配置，且 `POST /api/markdown-pdf` 返回 PDF 而非 503/502。

---

## 8. 常见问题

### 8.1 构建失败：找不到模块或锁文件不一致

在 **Root Directory = `web`** 前提下，使用 `npm ci` 且保证 `web/package-lock.json` 已提交并与 `package.json` 同步。

### 8.2 API `/api/markdown-pdf` 502

通常表示 Vercel 无法连上 `PDF_SERVICE_URL`（网络、TLS、防火墙）或 PDF 服务返回错误。检查 PDF 服务日志、URL 是否正确、Token 是否一致。

### 8.3 仅部署前端，不部署 PDF

可以不配置 `PDF_SERVICE_URL`；站点其余功能可用，仅 Markdown 导出 PDF 不可用。

### 8.4 与仓库根目录 Docker Compose 的关系

根目录 `docker-compose.yml` 将 `PDF_SERVICE_URL` 指向 Compose 内服务名（如 `http://markdown-pdf:8000`），**仅在同一 Docker 网络内有效**。Vercel **无法**使用该主机名，必须改为公网可达的 PDF 服务地址。

### 8.5 `MIDDLEWARE_INVOCATION_FAILED` 与 `ReferenceError: __dirname is not defined`（可追溯记录）

**现象**：部署到 Vercel 后请求失败，日志中出现 `MIDDLEWARE_INVOCATION_FAILED`，错误信息含 **`ReferenceError: __dirname is not defined`**。

**原因（摘要）**：

- 旧版 **`middleware.ts`** 在 Next.js 中按 **Edge Runtime** 执行；Edge **没有** Node 的全局变量 `__dirname`。
- 国际化栈（`next-intl` 的 `createMiddleware`）会依赖 `next/server`；构建产物里可能经由内部模块（历史上常见堆栈与 **`ua-parser-js`** 等）访问 `__dirname`，在 Edge 上即报错。本地 `next dev` 多为 Node 环境，容易与线上不一致。

**本仓库的长期处理方式（Next.js 16）**：

- Next.js 16 起推荐使用 **`proxy.ts`**（原 `middleware.ts` 仍可用但已 deprecated），**在 Node 运行时**处理请求边界，避免上述 Edge 限制；`next-intl` 文档亦以 `proxy.ts` 为准。
- 本仓库已将国际化入口放在 **`web/proxy.ts`**，与 `next-intl` 的 `createMiddleware(routing)` 用法一致；**请勿**再添加根目录 `middleware.ts`，以免回到 Edge 路径。

**外部参考**（便于日后对照版本与上游讨论）：Next.js 16 发布公告中 [Proxy（原 Middleware）](https://nextjs.org/blog/next-16#proxyts-formerly-middlewarets)；[next-intl：Proxy / middleware](https://next-intl.dev/docs/routing/middleware)。

---

## 9. 参考（仓库内）

| 文件 | 内容 |
|------|------|
| `web/package.json` | 脚本 `build` / `start` |
| `web/next.config.ts` | Next 配置、`next-intl` 插件 |
| `web/proxy.ts` | 国际化路由（Next 16：`proxy.ts`，Node 边界；原 `middleware.ts`） |
| `web/app/api/markdown-pdf/route.ts` | PDF 代理与环境变量 |
| 根目录 `.env.example` | 全栈示例环境变量名 |

---

按上述步骤配置 **Root Directory、`NEXT_PUBLIC_SITE_URL`**，并在需要时配置 **PDF 与公开分析变量**，即可在 Vercel 上完整运行 Toolnova 前端。
