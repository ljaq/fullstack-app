#!/usr/bin/env bash
# 在服务器上执行：安装依赖、构建；PM2 若已有则 restart，否则用指定 npm script 首次 start。
#
# 用法：
#   bash scripts/server-deploy.sh <pm2 进程名> <pnpm 脚本名>
# 例：
#   bash scripts/server-deploy.sh fullstack-app-prod start:prod
#   bash scripts/server-deploy.sh fullstack-app-dev start:test
#
# 环境变量备选：PM2_APP_NAME、PM2_START_SCRIPT（未传参时生效，默认 start:prod）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PM2_NAME="${1:-${PM2_APP_NAME:-fullstack-app}}"
START_SCRIPT="${2:-${PM2_START_SCRIPT:-start:prod}}"

command -v pnpm >/dev/null 2>&1 || {
  echo "pnpm 未安装，请先: corepack enable && corepack prepare pnpm@latest --activate" >&2
  exit 1
}
command -v pm2 >/dev/null 2>&1 || {
  echo "pm2 未安装，请先: npm i -g pm2" >&2
  exit 1
}

echo "[deploy] install deps..."
export CI="${CI:-true}"
NODE_ENV=development pnpm install --frozen-lockfile

echo "[deploy] build..."
pnpm build

if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  echo "[deploy] pm2 restart: ${PM2_NAME}"
  pm2 restart "$PM2_NAME"
else
  echo "[deploy] pm2 start (首次): ${PM2_NAME} -> pnpm ${START_SCRIPT}"
  pm2 start pnpm --name "$PM2_NAME" -- "$START_SCRIPT"
  pm2 save
fi

echo "[deploy] done."
