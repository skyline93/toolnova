# Debian + Chromium + Playwright（见 docs/5-Markdown导出PDF-Python-Playwright方案.md）
# playwright install --with-deps 需 root 调 apt；不能在非 root 下 su，故先装依赖再切 appuser。
#
# apt / pip：阿里云。Chromium：先尝试 npmmirror（国内快），若镜像未同步当前版本则自动改走官方 CDN。
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
    PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/ \
    PIP_TRUSTED_HOST=mirrors.aliyun.com

WORKDIR /app

# 使用阿里云 Debian 源（覆盖默认 deb822 sources，避免仍指向 deb.debian.org）
RUN rm -f /etc/apt/sources.list.d/debian.sources \
    && printf '%s\n' \
      'deb https://mirrors.aliyun.com/debian/ bookworm main contrib non-free non-free-firmware' \
      'deb https://mirrors.aliyun.com/debian/ bookworm-updates main contrib non-free non-free-firmware' \
      'deb https://mirrors.aliyun.com/debian-security bookworm-security main contrib non-free non-free-firmware' \
      > /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /opt/pw-browsers \
    && chmod 755 /opt/pw-browsers

COPY requirements.txt .
# npmmirror 常滞后于 Playwright 新版本；404 时回退官方下载（构建仍成功，仅该步可能较慢）
RUN pip install --no-cache-dir -r requirements.txt \
    && (PLAYWRIGHT_DOWNLOAD_HOST=https://cdn.npmmirror.com/binaries/playwright playwright install --with-deps chromium \
        || (echo "playwright: npmmirror 无当前 Chromium 包，改用官方 CDN" && playwright install --with-deps chromium))

COPY app ./app
COPY assets ./assets

RUN useradd -r -u 1001 -m -d /home/appuser appuser \
    && chown -R appuser:appuser /app /opt/pw-browsers

USER appuser

EXPOSE 8000

ENV WEB_CONCURRENCY=2

CMD ["sh", "-c", "gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w ${WEB_CONCURRENCY} -b 0.0.0.0:8000 --timeout 120 --graceful-timeout 30 --access-logfile - --error-logfile -"]
