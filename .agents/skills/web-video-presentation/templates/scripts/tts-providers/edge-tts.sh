# edge-tts — free Microsoft Edge TTS backend, no API key.
# Install once globally: bash <skill>/scripts/setup-global-tools.sh

tts_check() {
  if command -v edge-tts >/dev/null; then
    return 0
  fi
  python3 -m edge_tts --version >/dev/null 2>&1 || {
    echo "✗ edge-tts not found in PATH or as python module." >&2
    return 1
  }
}

tts_install_help() {
  cat <<'EOF' >&2
Install edge-tts (free, Chinese voices, no API key):
  pip install edge-tts
  # or once for all projects:
  bash <path-to-web-video-presentation>/scripts/setup-global-tools.sh

List voices:
  edge-tts --list-voices | grep zh-CN

Then:
  npm run synthesize-audio
EOF
}

tts_synthesize() {
  local text="$1"
  local out="$2"
  local voice="${3:-zh-CN-YunxiNeural}"
  if command -v edge-tts >/dev/null; then
    edge-tts --text "$text" --voice "$voice" --write-media "$out" >/dev/null 2>&1
  else
    python3 -m edge_tts --text "$text" --voice "$voice" --write-media "$out" >/dev/null 2>&1
  fi
}
