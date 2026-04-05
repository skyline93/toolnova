# Toolnova — 根目录部署（Docker Compose + 多镜像构建）
#
# 生产：仅需 docker-compose.yml + 已拉取的镜像 + 可选 .env → docker compose up -d
# 构建：在开发机/CI 执行 make build-web / make build-pdf（或 make build）
#
#   make / make up     启动全部服务（不构建）
#   make build         构建 web + markdown-pdf 镜像
#   make build-web     仅构建 Next.js 镜像
#   make build-pdf     仅构建 PDF 服务镜像
#
COMPOSE := docker compose
COMPOSE_FILE := docker-compose.yml

IMAGE_WEB ?= toolnova-web:latest
IMAGE_PDF ?= toolnova-markdown-pdf:latest
WEB_PORT ?= 3000

NEXT_PUBLIC_SITE_URL ?= https://localhost:3000
NEXT_PUBLIC_GA_MEASUREMENT_ID =
NEXT_PUBLIC_ADSENSE_CLIENT_ID =
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER =

PLATFORM_LINUX_AMD64 := linux/amd64

-include .env
ifneq ($(strip $(TOOLNOVA_WEB_IMAGE)),)
IMAGE_WEB := $(TOOLNOVA_WEB_IMAGE)
endif
ifneq ($(strip $(TOOLNOVA_MARKDOWN_PDF_IMAGE)),)
IMAGE_PDF := $(TOOLNOVA_MARKDOWN_PDF_IMAGE)
endif

export TOOLNOVA_WEB_IMAGE := $(IMAGE_WEB)
export TOOLNOVA_MARKDOWN_PDF_IMAGE := $(IMAGE_PDF)
export WEB_PORT
export NEXT_PUBLIC_SITE_URL
export NEXT_PUBLIC_GA_MEASUREMENT_ID
export NEXT_PUBLIC_ADSENSE_CLIENT_ID
export NEXT_PUBLIC_ADSENSE_SLOT_FOOTER

DOCKER_WEB_ARGS := \
	--build-arg NEXT_PUBLIC_SITE_URL=$(NEXT_PUBLIC_SITE_URL) \
	--build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=$(NEXT_PUBLIC_GA_MEASUREMENT_ID) \
	--build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID=$(NEXT_PUBLIC_ADSENSE_CLIENT_ID) \
	--build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=$(NEXT_PUBLIC_ADSENSE_SLOT_FOOTER)

.PHONY: default help build build-web build-pdf build-amd64 build-web-amd64 build-pdf-amd64 \
	up down logs ps rebuild rebuild-amd64 print-run print-docker-build print-docker-build-pdf \
	print-docker-build-web-amd64 print-docker-build-pdf-amd64

default: up

help:
	@echo "Toolnova — 仓库根目录"
	@echo ""
	@echo "  make / make up       docker compose up -d（需镜像已存在）"
	@echo "  make down            停止并移除容器"
	@echo "  make logs            跟踪 web 与 markdown-pdf 日志"
	@echo "  make ps              compose 状态"
	@echo "  make build           构建 web + markdown-pdf"
	@echo "  make build-web       仅构建 Next 镜像（-f web/Dockerfile web）"
	@echo "  make build-pdf       仅构建 PDF 镜像"
	@echo "  make build-amd64     交叉构建两个镜像（linux/amd64，需 buildx）"
	@echo "  make rebuild         无缓存构建两镜像后 up"
	@echo ""
	@echo "构建期：NEXT_PUBLIC_* ；启动期：见根目录 .env.example"
	@echo "Compose 文件：$(COMPOSE_FILE)"

build-web:
	docker build -t $(IMAGE_WEB) $(DOCKER_WEB_ARGS) -f web/Dockerfile web

build-pdf:
	docker build -t $(IMAGE_PDF) -f services/markdown-pdf/Dockerfile services/markdown-pdf

build: build-web build-pdf

build-web-amd64:
	docker buildx build --platform $(PLATFORM_LINUX_AMD64) -t $(IMAGE_WEB) $(DOCKER_WEB_ARGS) -f web/Dockerfile web --load

build-pdf-amd64:
	docker buildx build --platform $(PLATFORM_LINUX_AMD64) -t $(IMAGE_PDF) -f services/markdown-pdf/Dockerfile services/markdown-pdf --load

build-amd64: build-web-amd64 build-pdf-amd64

up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

logs:
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f web markdown-pdf

ps:
	$(COMPOSE) -f $(COMPOSE_FILE) ps

rebuild:
	docker build --no-cache -t $(IMAGE_WEB) $(DOCKER_WEB_ARGS) -f web/Dockerfile web
	docker build --no-cache -t $(IMAGE_PDF) -f services/markdown-pdf/Dockerfile services/markdown-pdf
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

rebuild-amd64: build-amd64
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

print-run:
	@echo "docker compose -f $(COMPOSE_FILE) up -d"
	@echo "# 或单容器示例：docker run -d -p $(WEB_PORT):3000 -e PDF_SERVICE_URL=http://HOST:8000 $(IMAGE_WEB)"

print-docker-build:
	@echo "docker build -t $(IMAGE_WEB) \\"
	@echo "  --build-arg NEXT_PUBLIC_SITE_URL=$(NEXT_PUBLIC_SITE_URL) \\"
	@echo "  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=$(NEXT_PUBLIC_GA_MEASUREMENT_ID) \\"
	@echo "  --build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID=$(NEXT_PUBLIC_ADSENSE_CLIENT_ID) \\"
	@echo "  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=$(NEXT_PUBLIC_ADSENSE_SLOT_FOOTER) \\"
	@echo "  -f web/Dockerfile web"

print-docker-build-pdf:
	@echo "docker build -t $(IMAGE_PDF) -f services/markdown-pdf/Dockerfile services/markdown-pdf"

print-docker-build-web-amd64:
	@echo "docker buildx build --platform $(PLATFORM_LINUX_AMD64) -t $(IMAGE_WEB) \\"
	@echo "  --build-arg NEXT_PUBLIC_SITE_URL=$(NEXT_PUBLIC_SITE_URL) \\"
	@echo "  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=$(NEXT_PUBLIC_GA_MEASUREMENT_ID) \\"
	@echo "  --build-arg NEXT_PUBLIC_ADSENSE_CLIENT_ID=$(NEXT_PUBLIC_ADSENSE_CLIENT_ID) \\"
	@echo "  --build-arg NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=$(NEXT_PUBLIC_ADSENSE_SLOT_FOOTER) \\"
	@echo "  -f web/Dockerfile web --load"

print-docker-build-pdf-amd64:
	@echo "docker buildx build --platform $(PLATFORM_LINUX_AMD64) -t $(IMAGE_PDF) \\"
	@echo "  -f services/markdown-pdf/Dockerfile services/markdown-pdf --load"
