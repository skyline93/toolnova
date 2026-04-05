# 生产环境部署（Docker）

本文说明如何在生产环境使用 Docker 构建并运行 Toolnova 前端。运行镜像为自包含（Next.js `output: "standalone"`），**不要将应用源码目录挂载进容器**。

英文版见 [production-deployment.md](./production-deployment.md)。

## 前置条件

- 已安装 Docker Engine 与 Docker Compose 插件（`docker compose`），或 Docker Desktop。
- **构建机**：需要完整的 `web/` 工程目录（或 CI 检出）作为 `Dockerfile` 的构建上下文。
- **仅拉镜像的机器**：镜像需已推送到镜像仓库；使用 `docker run` 时**不需要**源码目录。

## 构建期环境变量

所有 `NEXT_PUBLIC_*` 会在执行 `next build` 时写入前端产物。修改这些值需要**重新构建镜像**；仅在 `docker run` 时用 `-e` 传入**无法**改变已构建好的前端资源。

| 变量 | 是否必填 | 说明 |
| ---- | -------- | ---- |
| `NEXT_PUBLIC_SITE_URL` | 生产必填 | 站点规范来源，**不要**末尾斜杠（metadata、sitemap、JSON-LD）。 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 否 | Google Analytics 4 测量 ID；仅在用户在 Cookie 横幅中选择「全部接受」后加载。 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | 否* | AdSense 发布商 ID（`ca-pub-…`）。 |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | 否* | 页脚展示广告位对应的广告单元 slot id。 |

\*页脚广告位要真正请求广告，构建时需**同时**设置两项 AdSense 变量。站点未通过 AdSense 审核前可留空，页脚为占位区域。

镜像内已设置运行时 `PORT=3000`、`HOSTNAME=0.0.0.0`；一般无需在运行时覆盖。

## 方式 A：Docker Compose + Makefile（推荐）

**构建与启动分离。**`docker compose up`**不会**构建镜像。在开发机或 CI 完成构建并推送（或离线分发）镜像后，生产环境**仅启动**已有镜像。

### 1. 构建（开发机 / CI）

在 `web/` 目录执行，传入真实站点与可选 `NEXT_PUBLIC_*`：

```bash
make build NEXT_PUBLIC_SITE_URL=https://example.com

# 含可选 GA / AdSense（均为构建期）
make build \
  NEXT_PUBLIC_SITE_URL=https://example.com \
  NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX \
  NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX \
  NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=1234567890
```

可在 `web/.env` 中配置 `NEXT_PUBLIC_*` 以便执行 `make build`（勿提交敏感信息）。**启动容器时** Compose 不会用这些变量，只有 `docker build` 使用。

### 2. 启动（生产或任意已有所需镜像的主机）

在 `docker pull your-registry/toolnova-web:1.0.0`（或镜像已在本地）之后，于 `web/` 目录：

```env
# 服务器上的 web/.env 示例（此处一般不需要 NEXT_PUBLIC_*）
TOOLNOVA_WEB_IMAGE=your-registry/toolnova-web:1.0.0
WEB_PORT=3000
```

```bash
make up
```

或不使用 `.env`：`make up IMAGE=your-registry/toolnova-web:1.0.0 WEB_PORT=3000`。

常用目标：`make build`、`make up`、`make down`、`make logs`、`make rebuild`（无缓存构建后再 up）、`make print-run`、`make print-docker-build`。详见 `make help`。

## 方式 B：`docker build` + `docker run`（不依赖 Makefile）

在 `web/` 目录构建：

```bash
docker build -t toolnova-web:latest \
  --build-arg NEXT_PUBLIC_SITE_URL=https://example.com \
  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID= \
  --build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID= \
  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER= \
  -f Dockerfile .
```

若 Docker 版本允许，可省略值为空的可选 `--build-arg` 行；否则按上文传入空字符串。

运行（镜像需已在本地或通过 `docker pull` 获取）：

```bash
docker run -d --name toolnova-web --restart unless-stopped -p 3000:3000 toolnova-web:latest
```

按需修改宿主机端口（如 `8080:3000`）与镜像名/标签。生产环境**不要** bind-mount 应用源码。

使用当前 Makefile 变量生成可复制的 `docker build` 命令：

```bash
make print-docker-build
```

## 方式 C：镜像仓库工作流

1. 在 CI 或构建机上完成构建并打标签（`--build-arg` 与线上一致）。
2. 执行 `docker push your-registry/toolnova-web:1.0.0`。
3. 在服务器：`docker pull your-registry/toolnova-web:1.0.0`，再执行 `docker run ... your-registry/toolnova-web:1.0.0`。

仓库中的 `docker-compose.yml` **只**声明 `image:`（无 `build:`），生产环境在镜像就绪后即可直接启动。

## 上线检查清单

1. **`NEXT_PUBLIC_SITE_URL`** 设为真实 HTTPS 来源（无末尾斜杠）。
2. 如需统计或广告，在**构建时**设置 GA / AdSense 相关变量。
3. 对外 HTTPS：在容器前放置反向代理、负载均衡或平台 Ingress，完成 TLS 终结。
4. **Google Search Console**：完成资源验证并提交 `https://<域名>/sitemap.xml`。
5. Cookie / 同意：GA、AdSense 仅在用户「全部接受」后加载；请配套隐私说明与策略。

## 故障排查

- **`docker compose up` / `make up` 报镜像不存在**：请先在开发机构建或在线上执行 `docker pull`。Compose **不会**自动构建镜像。
- **浏览器里仍是旧站点 URL或统计配置**：需用正确的 `NEXT_PUBLIC_*` **重新构建镜像**并部署，仅重启容器不够。
- **端口被占用**：修改 Compose 的 `WEB_PORT` 或 `docker run -p` 的宿主机端口。
- **容器名冲突**：先执行 `docker rm -f toolnova-web`（或你使用的容器名）再启动。
