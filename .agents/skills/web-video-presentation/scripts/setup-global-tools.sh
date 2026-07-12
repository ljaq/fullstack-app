#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# setup-global-tools.sh — 一次性安装 web-video-presentation 全局工具
#
# 避免每个 presentation 项目重复安装 TTS / 录屏 / 转码依赖。
# agent 在首次合成音频或导出 MP4 前应检查；缺失时引导用户跑本脚本。
#
# 用法：
#   bash <path-to-web-video-presentation>/scripts/setup-global-tools.sh
#   bash .../setup-global-tools.sh --check   # 只检查，不安装
# ─────────────────────────────────────────────────────────────
set -euo pipefail

CHECK_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --check) CHECK_ONLY=true ;;
    -h|--help)
      sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
  esac
done

ok=0
warn=0
fail=0

mark_ok()   { ok=$((ok + 1));   echo "  ✓ $1"; }
mark_warn() { warn=$((warn + 1)); echo "  ⚠ $1"; }
mark_fail() { fail=$((fail + 1)); echo "  ✗ $1"; }

has_cmd() { command -v "$1" >/dev/null 2>&1; }

install_edge_tts() {
  if has_cmd edge-tts || python3 -m edge_tts --version >/dev/null 2>&1; then
    mark_ok "edge-tts"
    return
  fi
  if $CHECK_ONLY; then mark_fail "edge-tts（pip install edge-tts）"; return; fi
  echo "▸ installing edge-tts…"
  if has_cmd pip3; then pip3 install --user edge-tts
  elif has_cmd pip; then pip install --user edge-tts
  else mark_fail "pip not found — install Python pip first"; return
  fi
  if has_cmd edge-tts || python3 -m edge_tts --version >/dev/null 2>&1; then
    mark_ok "edge-tts installed"
  else
    mark_warn "edge-tts installed but not in PATH — add Python user bin to PATH"
    echo "    e.g. export PATH=\"\$HOME/Library/Python/3.9/bin:\$PATH\"  # macOS" >&2
  fi
}

install_ffmpeg() {
  if has_cmd ffmpeg; then mark_ok "ffmpeg"; return; fi
  if $CHECK_ONLY; then mark_fail "ffmpeg（brew install ffmpeg / apt install ffmpeg）"; return; fi
  echo "▸ installing ffmpeg…"
  if has_cmd brew; then brew install ffmpeg
  elif has_cmd apt-get; then sudo apt-get update && sudo apt-get install -y ffmpeg
  else mark_fail "install ffmpeg manually"; return
  fi
  has_cmd ffmpeg && mark_ok "ffmpeg installed" || mark_fail "ffmpeg install failed"
}

install_jq() {
  if has_cmd jq; then mark_ok "jq"; return; fi
  if $CHECK_ONLY; then mark_fail "jq（brew install jq）"; return; fi
  echo "▸ installing jq…"
  if has_cmd brew; then brew install jq
  elif has_cmd apt-get; then sudo apt-get install -y jq
  else mark_fail "install jq manually"; return
  fi
  has_cmd jq && mark_ok "jq installed" || mark_fail "jq install failed"
}

install_playwright() {
  if node -e "require('playwright')" >/dev/null 2>&1 || npm list -g playwright >/dev/null 2>&1; then
    mark_ok "playwright (npm)"
  elif $CHECK_ONLY; then
    mark_fail "playwright（npm install -g playwright）"
  else
    echo "▸ installing playwright globally…"
    npm install -g playwright
    mark_ok "playwright installed"
  fi

  if ls "$HOME/Library/Caches/ms-playwright/chromium-"* >/dev/null 2>&1 \
    || ls "$HOME/.cache/ms-playwright/chromium-"* >/dev/null 2>&1; then
    mark_ok "playwright chromium browser"
    return
  fi
  if $CHECK_ONLY; then
    mark_fail "playwright chromium（playwright install chromium）"
    return
  fi
  echo "▸ installing playwright chromium (one-time, ~150MB)…"
  if has_cmd playwright; then playwright install chromium
  else npx playwright install chromium
  fi
  mark_ok "playwright chromium installed"
}

install_tsx() {
  if has_cmd tsx || npm list -g tsx >/dev/null 2>&1; then mark_ok "tsx"; return; fi
  if $CHECK_ONLY; then mark_warn "tsx optional globally — each project has local tsx via scaffold"; return; fi
  echo "▸ installing tsx globally (optional)…"
  npm install -g tsx && mark_ok "tsx installed" || mark_warn "tsx global install skipped"
}

echo "web-video-presentation global tools"
echo

install_edge_tts
install_ffmpeg
install_jq
install_playwright
install_tsx

echo
if [[ $fail -gt 0 ]]; then
  echo "✗ missing $fail required tool(s). Run without --check to install."
  exit 1
fi
echo "✓ ready — edge-tts + ffmpeg + jq + playwright"
[[ $warn -gt 0 ]] && echo "  ($warn optional warning(s) above)"
