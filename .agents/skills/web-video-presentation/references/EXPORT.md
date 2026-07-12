# 导出 MP4（Playwright 自动录屏）

合成口播后，**不必手动 OBS 录屏**。项目内置 `npm run export:mp4`：

```bash
cd presentation
npm run export:mp4
```

默认输出：`presentation/output/export.mp4`  
自定义：`PRESENTATION_EXPORT_MP4=/path/to/out.mp4 npm run export:mp4`

## 前置

1. 章节做完 + `npm run extract-narrations` + `npm run synthesize-audio`
2. 全局工具已装：见 [`SETUP.md`](SETUP.md)（ffmpeg + playwright chromium + edge-tts）
3. `src/registry/export-visual-min.ts` 里按 global step 填好每步动画最小时长（章节增删后同步改）

## 原理（音画同步 + 动画完整）

| 步骤 | 做什么 |
|---|---|
| 1 | concat 口播 → 用**合成音轨总长**校准各段 speech 时长 |
| 2 | 每步 hold = max(speech, 动画最小时长 × 无头补偿) + 口播后缓冲 |
| 3 | 口播后不足的 hold 用 **ffmpeg apad 补静音**（画面多等多久，音轨就多长多久） |
| 4 | Playwright 录屏 + 页面内 `performance.now()` 时间轴切步（`?export=1&timeline=1`） |
| 5 | ffmpeg 合并视频 + 延迟口播（`adelay` 对齐 0.8s 片头） |

> **不要用 `?auto=1` 做无头导出**：Chrome 常拦截 autoplay，步进会回退到字数估时，动画被截断、音画漂移。

## 调试

- `presentation/output/export-timeline.json` — 每步 speech / hold / pad
- 某步动画仍被切 → 加大 `EXPORT_VISUAL_MIN_SEC[该步]` 或 `EXPORT_POST_SPEECH_PAD_SEC`

## 与手动录屏对比

| | `export:mp4` | OBS + `?auto=1` |
|---|---|---|
| 操作 | 一条命令 | 全屏 + 按 Space + 裁头尾 |
| 画质 | 25fps 无头录屏，够用 | 可 60fps，更丝滑 |
| 同步 | 脚本保证 | 浏览器内 autoplay，天然同步 |
| 适用 | 视频号宣发批量出片 | 追求最高画质 |

手动录屏流程见 [`RECORDING.md`](RECORDING.md)。
