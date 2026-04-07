# Toolnova（web）

[English](./README.md) | **简体中文**

基于 Next.js App Router 的前端：工具页、国际化（`en`、`zh-CN`）、SEO（metadata、sitemap、JSON-LD），以及 PDF 合并 API 路由。界面采用 **Radix Themes** 3（主色为 **blue**，与谷歌蓝一致；slate 灰阶、白底、卡片/按钮/输入框轻阴影），并用 Tailwind CSS 4 做少量工具类与局部样式。

## 快速开始

**Docker（生产形态镜像）** — 先在开发环境构建，生产仅启动、不构建。在仓库根目录：

```bash
cd web
make build NEXT_PUBLIC_SITE_URL=https://你的域名.com
make up
```

生产环境使用已推送或已导入的镜像（例如 `make up IMAGE=registry/toolnova-web:标签`）。可选构建期变量见 [docs/production-deployment.zh-CN.md](./docs/production-deployment.zh-CN.md)。`make help` 列出全部目标。

**本地开发** — 安装依赖、复制环境文件、启动开发服务：

```bash
cd web
npm install
cp .env.example .env.local
# 设置 NEXT_PUBLIC_SITE_URL（例如 http://localhost:3000）
npm run dev
```

## 本地开发

与上文 [快速开始](#快速开始) 中「本地开发」命令相同。

## 环境变量

详见 [`.env.example`](./.env.example)。生产环境请将 **`NEXT_PUBLIC_SITE_URL`** 设为真实站点来源（**不要**末尾斜杠）。

| 变量 | 说明 |
| ---- | ---- |
| `NEXT_PUBLIC_SITE_URL` | 元数据、sitemap、结构化数据使用的规范 URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4；**仅在用户在 Cookie 横幅中点击「全部接受」后**才会加载 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense 发布商 ID（`ca-pub-…`） |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | 页脚预留广告位对应的展示广告单元 slot id |
| `MARKDOWN_EXPORT_BASE_FONT_PX` | 可选，**仅服务端**（勿加 `NEXT_PUBLIC_`）：Markdown 导出 HTML/PDF 正文字号（12–22 px），默认 14 |

## 上线清单（初版）

1. 使用 Docker 时在**构建阶段**设置 **`NEXT_PUBLIC_SITE_URL`**（Makefile / Compose 旁 `.env` / `docker build --build-arg`）；使用 Vercel 时在构建前配置项目环境变量。详见 [docs/production-deployment.zh-CN.md](./docs/production-deployment.zh-CN.md)。
2. 部署生产构建：执行 `npm run build` 再启动 standalone、按文档使用 Docker，或采用平台自带的 Next 部署方式。
3. **Google Search Console**：完成域名/资源验证，提交 `https://<你的域名>/sitemap.xml`。
4. **Cookie 横幅**：首次访问需选择「全部接受」或「仅必要」；**GA / AdSense 脚本仅在「全部接受」后**加载。
5. **AdSense**：在 Google 申请并通过后，再填写 client 与 slot 环境变量；在此之前页脚为固定高度的占位区，以降低 CLS。
6. **GA4**：可选；若需要统计数据，在配置测量 ID 的前提下仍依赖用户先同意。

## Docker

项目在 `next.config.ts` 中启用了 `output: "standalone"`。生产向的构建与运行说明（Compose、Makefile、`docker run`、镜像仓库流程）见 [docs/production-deployment.zh-CN.md](./docs/production-deployment.zh-CN.md)。

## 技术说明

- 界面：[`@radix-ui/themes`](https://www.radix-ui.com/themes) v3（根级 `Theme`、布局与表单等预置组件）。全局样式通过 `@radix-ui/themes/styles.css` 引入；`Theme` 主色为 `accentColor: blue`（与谷歌蓝系一致），辅以 `grayColor: slate`、`panelBackground: solid`、`radius: large`、开启 `hasBackground`。`globals.css` 在浅色模式下将页面设为纯白底，为卡片、按钮、文本域、选择器、分段控件及原生上传/下拉等增加轻微阴影；CodeMirror JSON 高亮中的键名、布尔值、光标与选区亦使用同一蓝色系。
- 样式：Tailwind CSS 4（`globals.css` 与 `@theme`）用于字体变量、CodeMirror / Markdown 辅助样式，以及部分原生控件（例如时区等超长 `<select>`）。
- 国际化：`next-intl`，语言前缀策略为 `as-needed`（英文默认无前缀）。
- 中间件负责语言检测；PDF 合并接口为 `/api/merge-pdf`（不参与语言前缀路由）。
