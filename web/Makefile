# 部署已迁至仓库根目录：docker-compose.yml 与 Makefile 在上一级。
# 在 web/ 下执行 make 会转发到根目录，便于旧习惯。
ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)
.PHONY: default
default:
	@$(MAKE) -C $(ROOT) up
%:
	@$(MAKE) -C $(ROOT) $@
