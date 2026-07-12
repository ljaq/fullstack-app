# 全局工具安装（一次性）

每个 `presentation/` 项目**不需要**重复安装 TTS、Playwright 浏览器、ffmpeg。
在机器上**跑一次** skill 仓库里的脚本即可：

```bash
bash <path-to-web-video-presentation>/scripts/setup-global-tools.sh
```

只检查是否就绪：

```bash
bash <path-to-web-video-presentation>/scripts/setup-global-tools.sh --check
```

## 会装什么

| 工具 | 用途 | 安装方式 |
|---|---|---|
| **edge-tts** | 默认 TTS（中文免费、无 API key） | `pip install edge-tts` |
| **ffmpeg** | MP4 转码 / 口播拼接 / 补静音 | `brew install ffmpeg` 或 apt |
| **jq** | 读 `audio-segments.json` | `brew install jq` |
| **playwright** + chromium | 无头录屏导出 MP4 | `npm install -g playwright` + `playwright install chromium` |
| **tsx**（可选） | 跑 TS 脚本；脚手架项目内仍有本地 tsx | `npm install -g tsx` |

## macOS PATH 提示

edge-tts 通过 pip `--user` 安装后，可加到 `~/.zshrc`：

```bash
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
```

（Python 小版本号按 `python3 --version` 调整。）

## agent 约定

- **Checkpoint Audio 之前**：若 `--check` 失败，先引导用户跑 `setup-global-tools.sh`，再 `npm run synthesize-audio`。
- **Phase 4 导出 MP4 之前**：同样检查；缺 playwright / ffmpeg 时不要假装导出成功。
- 脚手架 `npm install` **只装项目依赖**（Vite / React / 本地 tsx），**不**重复下载 Playwright 浏览器。

## 环境变量覆盖

| 变量 | 作用 |
|---|---|
| `FFMPEG` | 指定 ffmpeg 可执行文件路径 |
| `PRESENTATION_EXPORT_MP4` | 导出成片路径（默认 `presentation/output/export.mp4`） |
| `PRESENTATION_TTS` | TTS provider（默认 `edge-tts`） |
| `PRESENTATION_TTS_VOICE` | 音色（edge-tts 默认 `zh-CN-YunxiNeural`） |
