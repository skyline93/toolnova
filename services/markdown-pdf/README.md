# Markdown PDF 服务（Python + Playwright）

本目录用于实现 **独立后端**：将前端提交的 **与预览一致的 HTML**（方案 A）经 **Headless Chromium** 转为 PDF。

完整架构、API、Pydantic 模型约定、Gunicorn + Uvicorn Worker、性能与安全要求见：

**[docs/5-Markdown导出PDF-Python-Playwright方案.md](../../docs/5-Markdown导出PDF-Python-Playwright方案.md)**

## 本地开发（代码就绪后）

```bash
cd services/markdown-pdf
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
playwright install --with-deps chromium
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 生产启动（示例）

```bash
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  -w "${WEB_CONCURRENCY:-4}" \
  -b 0.0.0.0:8000 \
  --timeout 120 \
  --graceful-timeout 30
```

## 环境变量（运行时）

| 变量 | 说明 |
|------|------|
| `WEB_CONCURRENCY` | Gunicorn worker 数，默认 `2` |
| `PDF_TIMEOUT_MS` | `set_content` 超时（毫秒），默认 `28000` |
| `PDF_MAX_CONCURRENT` | 每进程并发 PDF 上限，默认 `2` |
| `INTERNAL_API_TOKEN` | 若设置，请求头须带 `X-Internal-Token`（与 Next 的 `PDF_SERVICE_SECRET` 一致） |

Next 在调用 `/v1/pdf` 时会附带可选字段 **`font_override_css`**（由 Web 服务端读取 **`MARKDOWN_EXPORT_BASE_FONT_PX`** 生成，见 `web/.env.example`），插在基础 `markdown-export.css` 之后，用于与 HTML 导出相同的正文字号。旧客户端不传该字段时默认为空，行为与此前一致。

## 镜像与 Compose

与 **Web** 一键启动：使用仓库根目录的 **`docker-compose.yml`**（仅需已构建/已拉取的镜像，无需挂载源码）。环境变量见根目录 **`.env.example`**（`TOOLNOVA_MARKDOWN_PDF_IMAGE`、`PDF_INTERNAL_API_TOKEN` 等）。

单独构建镜像（在仓库根目录执行）：

```bash
docker build -t toolnova-markdown-pdf:latest -f services/markdown-pdf/Dockerfile services/markdown-pdf
```

镜像构建时：**apt**（阿里云 Debian）、**pip**（阿里云 PyPI）；**Chromium** 会先请求 **npmmirror**（`cdn.npmmirror.com/binaries/playwright`），若该版本尚未同步（常见 404）则**自动**再执行一次 `playwright install` 走**官方 CDN**，保证构建成功；镜像站跟上新版本后，首次尝试即可命中加速。

单独运行：

```bash
docker run --rm -p 8000:8000 -e WEB_CONCURRENCY=2 toolnova-markdown-pdf:latest
```

代码入口：`app/main.py`，样式：`assets/markdown-export.css`（与站点预览样式语义对齐，变更时请对照 `web/app/globals.css`）。
