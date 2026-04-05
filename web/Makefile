# Toolnova Web — Docker（需安装 Docker 与 docker compose 插件）
#
# 流程：在开发环境先构建镜像，再分发到生产；生产侧仅启动，不构建。
#
#   make build        构建镜像（在此传入全部 NEXT_PUBLIC_*）
#   make build-amd64  在 macOS ARM64 上交叉构建 linux/amd64 镜像（供 x86 服务器运行）
#   make up           后台启动容器（不构建；镜像须已存在或已 pull）
#   make              等同 make up
#
# 构建示例：
#   make build NEXT_PUBLIC_SITE_URL=https://example.com
#
# 可选构建期变量（命令行或同目录 .env，仅影响 make build）：
#   NEXT_PUBLIC_GA_MEASUREMENT_ID  NEXT_PUBLIC_ADSENSE_CLIENT_ID  NEXT_PUBLIC_ADSENSE_SLOT_FOOTER
#
# 启动示例（生产已有所需镜像）：
#   make up IMAGE=registry.example/toolnova-web:1.0.0 WEB_PORT=8080

COMPOSE := docker compose
COMPOSE_FILE := docker-compose.yml

NEXT_PUBLIC_SITE_URL ?= https://localhost:3000
NEXT_PUBLIC_GA_MEASUREMENT_ID =
NEXT_PUBLIC_ADSENSE_CLIENT_ID =
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER =
WEB_PORT ?= 3000
IMAGE ?= toolnova-web:latest
# 交叉构建目标平台（Docker Desktop / buildx + QEMU）
PLATFORM_LINUX_AMD64 := linux/amd64

# Compose 会读取同目录 .env；Make 亦可选加载（KEY=value，勿用含空格的值），便于 make build
-include .env
ifneq ($(strip $(TOOLNOVA_WEB_IMAGE)),)
IMAGE := $(TOOLNOVA_WEB_IMAGE)
endif

# 供 compose 与 docker build -t 使用同一镜像名；NEXT_PUBLIC_* 仅传入 docker build
export NEXT_PUBLIC_SITE_URL
export NEXT_PUBLIC_GA_MEASUREMENT_ID
export NEXT_PUBLIC_ADSENSE_CLIENT_ID
export NEXT_PUBLIC_ADSENSE_SLOT_FOOTER
export WEB_PORT
export TOOLNOVA_WEB_IMAGE := $(IMAGE)

DOCKER_BUILD_ARGS := \
	--build-arg NEXT_PUBLIC_SITE_URL=$(NEXT_PUBLIC_SITE_URL) \
	--build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=$(NEXT_PUBLIC_GA_MEASUREMENT_ID) \
	--build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID=$(NEXT_PUBLIC_ADSENSE_CLIENT_ID) \
	--build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=$(NEXT_PUBLIC_ADSENSE_SLOT_FOOTER)

.PHONY: default help build build-amd64 up down logs rebuild rebuild-amd64 ps print-run print-docker-build print-docker-build-amd64

default: up

help:
	@echo "Toolnova web — Docker"
	@echo ""
	@echo "流程：先 make build（开发机），再 make up / 分发镜像后在生产 make up。"
	@echo ""
	@echo "Make 目标："
	@echo "  make / make up     仅启动容器（docker compose up -d，不构建）"
	@echo "  make build         构建镜像（docker build，传入 NEXT_PUBLIC_*）"
	@echo "  make build-amd64   交叉构建 linux/amd64 镜像（Apple Silicon → x86 服务器；buildx --load）"
	@echo "  make down          停止并删除容器"
	@echo "  make logs          跟踪 web 日志"
	@echo "  make rebuild       无缓存构建镜像并启动"
	@echo "  make rebuild-amd64 无缓存交叉构建 linux/amd64 镜像并启动"
	@echo "  make ps            查看 compose 服务状态"
	@echo "  make print-run          打印生产用 docker run（不构建）"
	@echo "  make print-docker-build       打印 docker build 命令"
	@echo "  make print-docker-build-amd64 打印交叉构建 docker buildx 命令"
	@echo ""
	@echo "构建期变量：NEXT_PUBLIC_SITE_URL、GA/AdSense 等；启动期：WEB_PORT、IMAGE"
	@echo ""
	@echo "生产 docker run（镜像须已存在或已拉取）："
	@echo "  docker run -d --name toolnova-web --restart unless-stopped -p 3000:3000 toolnova-web:latest"

build:
	docker build -t $(IMAGE) $(DOCKER_BUILD_ARGS) -f Dockerfile .

# Apple Silicon 等 ARM 主机上构建可在 linux/amd64 运行的镜像（需 Docker buildx，Desktop 自带）
build-amd64:
	docker buildx build --platform $(PLATFORM_LINUX_AMD64) -t $(IMAGE) $(DOCKER_BUILD_ARGS) -f Dockerfile . --load

up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

logs:
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f web

rebuild:
	docker build --no-cache -t $(IMAGE) $(DOCKER_BUILD_ARGS) -f Dockerfile .
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

rebuild-amd64:
	docker buildx build --no-cache --platform $(PLATFORM_LINUX_AMD64) -t $(IMAGE) $(DOCKER_BUILD_ARGS) -f Dockerfile . --load
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

ps:
	$(COMPOSE) -f $(COMPOSE_FILE) ps

print-run:
	@echo "docker run -d --name toolnova-web --restart unless-stopped -p $(WEB_PORT):3000 $(IMAGE)"

print-docker-build:
	@echo "docker build -t $(IMAGE) \\"
	@echo "  --build-arg NEXT_PUBLIC_SITE_URL=$(NEXT_PUBLIC_SITE_URL) \\"
	@echo "  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=$(NEXT_PUBLIC_GA_MEASUREMENT_ID) \\"
	@echo "  --build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID=$(NEXT_PUBLIC_ADSENSE_CLIENT_ID) \\"
	@echo "  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=$(NEXT_PUBLIC_ADSENSE_SLOT_FOOTER) \\"
	@echo "  -f Dockerfile ."

print-docker-build-amd64:
	@echo "docker buildx build --platform $(PLATFORM_LINUX_AMD64) -t $(IMAGE) \\"
	@echo "  --build-arg NEXT_PUBLIC_SITE_URL=$(NEXT_PUBLIC_SITE_URL) \\"
	@echo "  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=$(NEXT_PUBLIC_GA_MEASUREMENT_ID) \\"
	@echo "  --build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID=$(NEXT_PUBLIC_ADSENSE_CLIENT_ID) \\"
	@echo "  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=$(NEXT_PUBLIC_ADSENSE_SLOT_FOOTER) \\"
	@echo "  -f Dockerfile . --load"
