# 目标平台与画幅

脚手架通过 `--aspect` 或 `--platform` 选定**固定画幅**。内容始终写在该
坐标系里，外层 transform scale 缩到视口 —— 没有响应式断点。

---

## 画幅对照

| 画幅 | 像素 | 脚手架参数 | 典型平台 |
|---|---|---|---|
| **16:9 横屏**（默认） | 1920×1080 | `--aspect=16:9` | B 站、YouTube、知乎视频横屏 |
| **9:16 竖屏** | 1080×1920 | `--aspect=9:16` 或 `--platform=channels` | 微信视频号、抖音、小红书视频 |

> 微信视频号**竖屏 feed 以 9:16 为主**；横屏 16:9 也可发，但竖屏在
> 信息流里占比更高。用户说「做视频号」且未指定横竖 → 默认 **9:16**。

---

## 脚手架用法

```bash
# 默认横屏
bash scripts/scaffold.sh ./presentation --theme=midnight-press

# 视频号 / 抖音竖屏
bash scripts/scaffold.sh ./presentation --aspect=9:16 --theme=luji-trail
bash scripts/scaffold.sh ./presentation --platform=channels --theme=luji-trail
```

项目根会写入 `.aspect`（如 `9:16`），`src/config/stage.ts` 含对应宽高。

---

## 竖屏（9:16）章节设计要点

竖屏不是「把横屏内容旋转 90°」，布局要**重新构图**：

| 维度 | 16:9 横屏 | 9:16 竖屏 |
|---|---|---|
| 构图 | 可左右分栏、宽表格 | **纵向堆叠**为主，禁宽分栏 |
| 字号 | 标题 80~120px | 标题可略大，但**每行字数更少** |
| 舞台 padding | `--stage-pad-x` 96~140px | 横 48~64px、纵 80~120px |
| 列表 / 对比 | 可并排 | 改**上下对照**或逐步揭示 |
| 占位图比例 | `image · 16:9` | `image · 9:16` |
| 信息密度 | 每步 2~4 个元素 | **每步 1~2 个**，竖屏一屏更窄 |
| 安全区 | 四边 80px | 顶 100px、底 160px 少放关键字（平台 UI 可能遮挡） |

口播风格见 [`SCRIPT-STYLE.md`](SCRIPT-STYLE.md)「抖音 / 视频号竖屏」行。

---

## 录屏设置

### 16:9 横屏

| 工具 | 设置 |
|---|---|
| macOS Cmd+Shift+5 | 录浏览器窗口，全屏后输出 1920×1080 |
| OBS | Canvas 1920×1080，窗口捕获，60fps |

### 9:16 竖屏

| 工具 | 设置 |
|---|---|
| macOS Cmd+Shift+5 | 浏览器窗口调成**窄高**（约 405×720 预览），录**舞台区域**；或 OBS 竖屏 canvas |
| OBS | Canvas **1080×1920**，窗口捕获浏览器，裁到 `.stage-fitter` |
| 剪映 / CapCut 导入 | 项目比例选 **9:16**，成片 1080×1920 |

竖屏 dev 预览：浏览器窗口拉窄高，舞台会自动 scale 居中；录屏以**舞台实际像素**
1080×1920 为准（见 `src/config/stage.ts`）。

Auto 模式录屏流程与横屏相同：`?auto=1` → Space 启动 → 一镜到底。
详见 [`RECORDING.md`](RECORDING.md)。

---

## Checkpoint Plan 对齐

用户说「视频号 / 竖屏 / 抖音」时，agent 在 Checkpoint Plan **主动确认**：

1. 画幅：**9:16**（除非用户明确要横屏 16:9）
2. 口播风格：[`SCRIPT-STYLE.md`](SCRIPT-STYLE.md) 视频号竖屏列
3. 脚手架：`--aspect=9:16` 或 `--platform=channels`

已在 Phase 2.1 脚手架前确定画幅；**不要在章节写完后才改比例**。
