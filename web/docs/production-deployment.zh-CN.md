# 生产环境部署（Docker）

本文说明如何使用 **仓库根目录** 的 `docker-compose.yml` 与 `Makefile` 部署 Toolnova：**Web（Next.js standalone）** 与 **Markdown PDF（Python + Playwright）** 一键启动。运行镜像自包含，**不要将源码挂载进容器**。

英文版见 [production-deployment.md](./production-deployment.md)。

## 前置条件

- 已安装 Docker Engine 与 Docker Compose 插件（`docker compose`），或 Docker Desktop。
- **构建机**：完整仓库检出（或至少 `web/` 与 `services/markdown-pdf/`），用于 `docker build` / `make build`。
- **仅运行机**：只需根目录 **`docker-compose.yml`** + 可选 **`.env`** + **已 `docker pull`（或 `docker load`）的镜像**，**不需要**宿主机上的项目源码。

## 文件位置（仓库根目录）

| 文件 | 说明 |
|------|------|
| `docker-compose.yml` | 声明 `web` 与 `markdown-pdf` 服务，**仅 `image:`**，无 `build:` |
| `Makefile` | 构建镜像、`compose up/down/logs` |
| `.env.example` | 复制为 `.env` 后按需修改镜像名、端口、PDF 密钥等 |

在 **`toolnova/` 根目录** 执行：

```bash
docker compose up -d
# 或
make up
```

## 构建期环境变量（Next 镜像）

所有 `NEXT_PUBLIC_*` 在 `next build` 时写入前端产物；修改后须**重新构建 web 镜像**，仅重启容器无效。

| 变量 | 是否必填 | 说明 |
| ---- | -------- | ---- |
| `NEXT_PUBLIC_SITE_URL` | 生产必填 | 站点规范来源，**不要**末尾斜杠。 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 否 | GA4，仅在用户 Cookie 同意后加载。 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | 否* | AdSense 发布商 ID。 |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | 否* | 页脚广告位 slot。 |

\*页脚广告需两项同时设置在**构建**时。

在**仓库根目录**构建示例：

```bash
make build-web NEXT_PUBLIC_SITE_URL=https://example.com

# 或同时构建 Web + PDF
make build NEXT_PUBLIC_SITE_URL=https://example.com

# 可选 GA / AdSense（构建期）
make build-web \
  NEXT_PUBLIC_SITE_URL=https://example.com \
  NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX \
  NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX \
  NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=1234567890
```

也可将 `NEXT_PUBLIC_*` 写入根目录 `.env` 后执行 `make build-web`（勿提交密钥）。

## 运行期环境变量（Compose / `.env`）

镜像名、端口等见根目录 **`.env.example`**。常用项：

| 变量 | 说明 |
|------|------|
| `TOOLNOVA_WEB_IMAGE` | Web 镜像，默认 `toolnova-web:latest` |
| `TOOLNOVA_MARKDOWN_PDF_IMAGE` | PDF 镜像，默认 `toolnova-markdown-pdf:latest` |
| `WEB_PORT` | 宿主机映射，默认 `3000` |
| `PDF_SERVICE_URL` | Next 访问 PDF 的 URL，Compose 内默认 `http://markdown-pdf:8000` |
| `PDF_SERVICE_SECRET` / `PDF_INTERNAL_API_TOKEN` | 若设置，两者应一致，用于内部鉴权 |
| `MARKDOWN_EXPORT_BASE_FONT_PX` | 可选。Markdown 导出 HTML/PDF 的正文基础字号（12–22 px），默认 14；见 `web/.env.example`。Compose 已透传至 `web` 容器。 |

### 生产启动（已有镜像）

```bash
cd /path/to/toolnova   # 仅需 compose + .env，可无源码
docker pull your-registry/toolnova-web:1.0.0
docker pull your-registry/toolnova-markdown-pdf:1.0.0
# 编辑 .env 中 TOOLNOVA_*_IMAGE 指向上述 tag
docker compose up -d
```

或使用 Makefile：`make up`。

### 从 `web/` 子目录操作

`web/Makefile` 会**转发**到仓库根目录，例如：

```bash
cd web && make up
cd web && make build-web NEXT_PUBLIC_SITE_URL=https://example.com
```

## 常用 Make 目标

| 目标 | 说明 |
|------|------|
| `make` / `make up` | `docker compose up -d`（不构建） |
| `make down` | 停止并删除容器 |
| `make logs` | 跟踪 web 与 markdown-pdf 日志 |
| `make ps` | 服务状态 |
| `make build` | 构建 web + pdf 镜像 |
| `make build-web` / `make build-pdf` | 单独构建 |
| `make build-amd64` | Apple Silicon 上产出 linux/amd64（buildx） |
| `make rebuild` | 无缓存构建两镜像后 up |
| `make print-docker-build` 等 | 打印可复制命令 |

## 方式 B：不用 Makefile，仅 `docker compose` 与 `docker build`

构建（在仓库根目录，路径相对于根）：

```bash
docker build -t toolnova-web:latest \
  --build-arg NEXT_PUBLIC_SITE_URL=https://example.com \
  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID= \
  --build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID= \
  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER= \
  -f web/Dockerfile web

docker build -t toolnova-markdown-pdf:latest \
  -f services/markdown-pdf/Dockerfile services/markdown-pdf
```

启动：

```bash
docker compose up -d
```

## 方式 C：镜像仓库工作流

1. CI 构建并 `docker push` 两个镜像。
2. 生产机 `docker pull` 后，放置根目录 `docker-compose.yml` 与 `.env`，执行 `docker compose up -d`。

## Markdown 导出 PDF

架构与实现见 [docs/5-Markdown导出PDF-Python-Playwright方案.md](../../docs/5-Markdown导出PDF-Python-Playwright方案.md)。Compose 已默认设置 `PDF_SERVICE_URL=http://markdown-pdf:8000`。

## 上线检查清单

1. **`NEXT_PUBLIC_SITE_URL`** 在构建 Web 镜像时设为真实 HTTPS 来源（无末尾斜杠）。
2. GA / AdSense 在**构建时**写入 Web 镜像。
3. 对外 HTTPS：在容器前配置反向代理 / Ingress，完成 TLS。
4. **Google Search Console**：验证资源并提交 `https://<域名>/sitemap.xml`。
5. Cookie / 同意：GA、AdSense 仅在用户接受后加载。

## 故障排查

- **`Image ... not found`**：先 `docker pull` 或在本机构建后再 `compose up`；Compose **不会**自动 `build`。
- **站点仍为旧域名或统计 ID**：用正确 `NEXT_PUBLIC_*` **重建 Web 镜像**。
- **端口占用**：修改 `.env` 中 `WEB_PORT`。
- **仅需 Web、暂不部署 PDF**：可临时使用自定义 compose 覆盖，或从 `docker-compose.yml` 中自行删减 `markdown-pdf` 服务并调整 `PDF_SERVICE_URL`（本仓库默认提供双服务一体栈）。
