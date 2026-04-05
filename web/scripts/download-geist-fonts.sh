#!/usr/bin/env bash
# 一键下载 Geist / Geist Mono 可变字体（woff2）到 app/fonts，供 next/font/local 离线构建。
# 依赖：curl 或 wget；默认从 jsDelivr 拉取 npm「geist」包内与官方一致的文件。
set -euo pipefail

GEIST_VERSION="${GEIST_VERSION:-1.7.0}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEST="${WEB_ROOT}/app/fonts"

SANS_URL="https://cdn.jsdelivr.net/npm/geist@${GEIST_VERSION}/dist/fonts/geist-sans/Geist-Variable.woff2"
MONO_URL="https://cdn.jsdelivr.net/npm/geist@${GEIST_VERSION}/dist/fonts/geist-mono/GeistMono-Variable.woff2"
LICENSE_URL="https://cdn.jsdelivr.net/npm/geist@${GEIST_VERSION}/LICENSE.txt"

# 备用镜像（jsDelivr 不可用时取消注释或设置 MIRROR=unpkg）
MIRROR="${MIRROR:-jsdelivr}"
if [[ "${MIRROR}" == "unpkg" ]]; then
  SANS_URL="https://unpkg.com/geist@${GEIST_VERSION}/dist/fonts/geist-sans/Geist-Variable.woff2"
  MONO_URL="https://unpkg.com/geist@${GEIST_VERSION}/dist/fonts/geist-mono/GeistMono-Variable.woff2"
  LICENSE_URL="https://unpkg.com/geist@${GEIST_VERSION}/LICENSE.txt"
fi

download() {
  local url="$1"
  local out="$2"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL --connect-timeout 30 --retry 3 -o "${out}" "${url}"
  elif command -v wget >/dev/null 2>&1; then
    wget -q --timeout=30 -t 3 -O "${out}" "${url}"
  else
    echo "需要 curl 或 wget" >&2
    exit 1
  fi
}

mkdir -p "${DEST}/geist-sans" "${DEST}/geist-mono"

echo "→ Geist ${GEIST_VERSION} → ${DEST}"
download "${SANS_URL}" "${DEST}/geist-sans/Geist-Variable.woff2"
download "${MONO_URL}" "${DEST}/geist-mono/GeistMono-Variable.woff2"
download "${LICENSE_URL}" "${DEST}/GEIST-LICENSE.txt"

# 简单校验（woff2 文件头 wOF2）
for f in "${DEST}/geist-sans/Geist-Variable.woff2" "${DEST}/geist-mono/GeistMono-Variable.woff2"; do
  if [[ ! -s "$f" ]]; then
    echo "错误：文件为空 $f" >&2
    exit 1
  fi
  h=$(head -c 4 "$f" | od -An -tx1 | tr -d ' \n')
  if [[ "$h" != "774f4632" ]]; then
    echo "警告：$f 可能不是有效 wOF2（若下载到 HTML 错误页请换 MIRROR=unpkg 或检查网络）" >&2
  fi
done

echo "完成。可执行: (cd ${WEB_ROOT} && npm run build)"
