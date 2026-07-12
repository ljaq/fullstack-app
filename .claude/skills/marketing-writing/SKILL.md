---
name: marketing-writing
description: |
  为「出门玩儿」撰写公众号、公众号贴图、小红书与视频号（竖屏短视频）营销内容。工作目录 .marketing/，成稿输出到 articles/gongzhonghao、articles/gongzhonghaotietu、articles/xiaohongshu 或 articles/shipinhao。公众号写 .md 后运行 skill 内脚本生成 .fragment.html，禁止 AI 手写 HTML。
  需要封面、轮播配图等视觉成品时，**优先**使用 guizang-social-card-skill（杂志/Swiss 社交卡片）；成品仍落盘 designs/<slug>/output/ 且文件名带 slug 前缀。
  公众号必出 2.35:1 列表封面；公众号贴图与小红书必出 3:4 帖子封面。封面 HTML 源文件放 designs/，PNG 导出到 designs/<slug>/output/ 且**文件名带 slug 前缀**（如 `<slug>-cover-2.35-1.png`），articles 只引用路径。
  视频号走 web-video-presentation 做可录屏网页演示；文章可新写或复用公众号/小红书成稿。
  生成前读 HISTORY.md 防重复，按需读 .docs PRD，写完后更新 HISTORY。
  Use when user asks to write marketing copy, 公众号文章, 公众号贴图, 小红书笔记, 视频号, 短视频, 种草文案, or work in .marketing/.
---

# 营销写作

**Skill 根路径**：`{SKILL_ROOT}` = `.agents/skills/marketing-writing` 或 `.claude/skills/marketing-writing`（按实际安装位置替换下文命令中的路径）。

**Guizang 配图 skill**：`{GUIZANG_SKILL}` = `.agents/skills/guizang-social-card-skill` 或 `.claude/skills/guizang-social-card-skill`（出图时**先读**其 `SKILL.md` 再动手）。

## 工作目录

```
.marketing/
├── HISTORY.md          # 生成前必读、生成后必更新
├── README.md           # 产品速记（纯场景/情感向写稿可读）
├── assets/             # 截图等原始素材
├── designs/            # 配图工程（HTML 源 + output/ PNG，不进 articles）
│   └── YYYY-MM-DD-<slug>/   # slug 与文章 .md 对齐；出图优先 guizang → index.html
│       ├── index.html         # guizang 默认（多页 .poster.xhs / .wide / .square）
│       ├── cover-2.35-1.html  # 备选：手写单页封面
│       ├── cover-3-4.html
│       ├── slide-01.html …
│       └── output/
│           ├── <slug>-cover-2.35-1.png   # 成品 PNG 必须带 slug 前缀
│           ├── <slug>-cover-3-4.png
│           └── <slug>-slide-01.png …
└── articles/
    ├── gongzhonghao/       # 公众号：.md + 脚本生成的 .fragment.html
    ├── gongzhonghaotietu/  # 公众号贴图
    ├── xiaohongshu/        # 小红书
    └── shipinhao/          # 视频号（每视频一目录）
```

## 执行清单

按顺序完成；防重复检查融入第 1、9 步。

- [ ] **1. 读 HISTORY** — 打开 `.marketing/HISTORY.md`，确认无相同/相近选题、钩子、功能卖点 + 场景、季节/节日角度；若重复则换角度或告知用户；系列续篇/改版重写须在 HISTORY 注明
- [ ] **2. 读 README 速记** — `.marketing/README.md` 产品事实；功能口径不确定时再读 `.docs` PRD（见下表）
- [ ] **3. 浏览 assets** — 列出 `.marketing/assets/` 可用截图，文中标注路径，如 `![首页](../assets/小程序-首页.jpg)`
- [ ] **4. 写稿落盘** — 命名与 slug 见「命名规范」；视频号为目录 + `article.md`
- [ ] **5. 配图** — **优先** `{GUIZANG_SKILL}` 出封面/轮播；成品落盘 `designs/YYYY-MM-DD-<slug>/output/<slug>-*.png`（见「designs 配图」）
- [ ] **6. 公众号 HTML** — 写完/改完 `.md` 后运行 `md-to-gongzhonghao-html.ts`（仅公众号）
- [ ] **7. 视频号演示** — 切换 `web-video-presentation` skill（仅视频号，见「视频号」）
- [ ] **8. frontmatter** — `cover` / `images` / `assets` 引用 `../designs/.../output/*.png` 或 `../assets/...`，禁止 `./xxx.cover.png`
- [ ] **9. 更新 HISTORY** — 追加一行：`- YYYY-MM-DD | 平台 | 标题 | 核心角度/关键词`

**HISTORY 示例**：

```markdown
- 2026-05-21 | 小红书 | 周末徒步完用这个做海报 | 功能向：海报生成 + 路线回放
- 2026-05-25 | 视频号 | 徒步完一键出海报 | article 完成，待演示
- 2026-05-26 | 视频号 | 路线回放太治愈了 | presentation 已完成，已导出 mp4
```

### 按需读 .docs

| 场景 | 建议阅读 |
|------|----------|
| 介绍产品全貌、MVP 功能 | `.docs/prd/MVP版本需求文档.md` |
| 公众号/小程序联动、分享引流 | `.docs/prd/v0.0.6-小程序端公众号发布需求文档.md` |
| 管理员/数据类内容 | `.docs/prd/v0.0.5-管理员后台需求文档.md` |
| Web 端同步 | `.docs/prd/v0.0.4-web端功能同步需求文档.md` |
| 纯场景/情感/季节向种草 | 跳过 PRD，README 速记即可 |
| 功能口径不确定 | 先读 PRD 再写，禁止编造 |

## 命名规范

| 类型 | 格式 | 规则 |
|------|------|------|
| 文章 | `articles/<平台>/YYYY-MM-DD-<slug>.md` | slug 英文 kebab-case，≤4 词，如 `gps-track-engine` |
| 视频号 | `articles/shipinhao/YYYY-MM-DD-<slug>/article.md` | 同 slug 规则 |
| 配图工程 | `designs/YYYY-MM-DD-<slug>/` | **与文章 slug 必须一致** |
| 配图成品 PNG | `output/<slug>-<类型>.png` | **必须带 slug 前缀**，避免跨文章重名；类型如 `cover-2.35-1`、`cover-3-4`、`slide-01` |

**禁止**：在 `articles/` 新建 `.cover.html`、`.cover.png` 或手工 HTML 配图源；articles 只放 `.md`（公众号另有脚本生成的 `.fragment.html`）。**禁止**输出无前缀的通用名（如 `cover-2.35-1.png`），上传公众号/贴图编辑器时易与历史文章混淆。

## designs 配图

写稿定稿后、更新 HISTORY 之前完成。HTML 源只放 `designs/`，成品 PNG 只放 `designs/.../output/`。

### 出图优先级（封面 / 轮播 / 配图）

需要任何**视觉成品**（列表封面、3:4 封面、轮播卡片、截图种草组图）时，按下列顺序执行，**不要**默认手写单页 HTML 或 `GenerateImage`：

| 优先级 | 方式 | 何时用 |
|--------|------|--------|
| **1** | **`guizang-social-card-skill`** | 默认首选：读 `{GUIZANG_SKILL}/SKILL.md`，走 intake → 分镜 → Editorial/Swiss → seed 模板 → 导出 PNG；见下「与 guizang 衔接」 |
| 2 | 本 skill 手写 HTML + `cover-to-png.ts` | 极简纯字封面、用户明确不要杂志/Swiss 风、或仅需单页快速占位 |
| 3 | `GenerateImage` | 最后备选；落盘仍须 `output/<slug>-<描述>.png` 并校验比例 |

### 与 guizang 衔接

1. **任务目录** = `.marketing/designs/YYYY-MM-DD-<slug>/`（与文章 slug 一致）；guizang 的 `assets/` 可指向 `../../assets/` 产品截图。
2. **输入**：定稿 `.md` 全文 + 平台画幅 + `.marketing/assets/` 可用图；户外/产品向优先 **Editorial**（Forest Ink / Dune）或 **Swiss**（Safety Orange / Lemon Green）；品牌色 `#383a40` / `#2e7d32` 可在 theme 或任务级 CSS 中体现。
3. **HTML 源**：按 guizang 惯例用 `index.html`（从 `template-editorial-card.html` 或 `template-swiss-card.html` 复制）；也可保留 `cover-3-4.html` 等别名，但**禁止**为配图另写与 guizang 无关的「营销专用」大段 CSS。
4. **画幅 → 营销成品文件名**（导出后**必须**重命名为带 slug 前缀）：

| 营销需求 | guizang 画板 | 建议导出尺寸 | 营销 `output/` 文件名 |
|----------|--------------|--------------|------------------------|
| 公众号列表封面 | `.poster.wide` | 2100×900（21:9）→ 若后台要 2.35:1 再渲 2350×1000 | `<slug>-cover-2.35-1.png` |
| 贴图 / 小红书封面 | `.poster.xhs` | 1080×1440 | `<slug>-cover-3-4.png` |
| 轮播第 N 页 | `.poster.xhs` 各页 | 1080×1440 | `<slug>-slide-NN.png` |
| 公众号分享方图（可选） | `.poster.square` | 1080×1080 | `<slug>-cover-1-1.png`（按需写入 frontmatter） |

5. **公众号 2.35:1**：guizang 默认 21:9（2100×900）。以 `.poster.wide` 为视觉源；若编辑器要求 2.35:1，用 `cover-to-png.ts` 按 2350×1000 重渲或等比裁切，**成品文件名仍为** `<slug>-cover-2.35-1.png`。
6. **校验**：按需运行 `{GUIZANG_SKILL}/validate-social-deck.mjs`；缩略图自检规则见下文「自检」。
7. **禁止**：guizang 已覆盖的场景下再手写一套平行封面 HTML；成品不得落在 `articles/`。

### 必出封面

| 平台 | 成品 | 比例 | 像素建议 | HTML 源 |
|------|------|------|----------|---------|
| 公众号 | `output/<slug>-cover-2.35-1.png` | 2.35:1 | 2350×1000 或 900×383 | `cover-2.35-1.html` |
| 公众号贴图 | `output/<slug>-cover-3-4.png` | 3:4 | 1080×1440 | `cover-3-4.html` |
| 小红书 | `output/<slug>-cover-3-4.png` | 3:4 | 1080×1440 | `cover-3-4.html` |

视频号封面由 `web-video-presentation` 或 `publish.md` 处理，本步跳过。

**PNG 命名**：成品文件名 = `<slug>-` + HTML 基名（去 `.html`）。HTML 源可保持短名（如 `cover-3-4.html`），`cover-to-png.ts` 会从目录 `YYYY-MM-DD-<slug>` 自动加前缀；手写 `capture.mjs` 或 `GenerateImage` 落盘时须手动遵守。

### 制作流程

1. 从定稿 `.md` 提炼：主标题（≤12 字）、核心情绪/场景、1 个利益点或反差钩子
2. 创建或复用 `designs/YYYY-MM-DD-<slug>/`
3. **默认**：读 `{GUIZANG_SKILL}/SKILL.md`，在同一目录按 guizang workflow 产出 `index.html` 与多页 `.poster.xhs` / `.poster.wide`，导出 PNG 并重命名为 `output/<slug>-cover-*.png`、`output/<slug>-slide-NN.png`（见「与 guizang 衔接」）
4. **备选**（仅优先级 2）：手写 `cover-*.html` / `slide-NN.html`；品牌色 `#383a40` / `#faf9f7`，高亮 `#2e7d32` / `#c0392b`；可引用 `../../assets/` 截图。截图导出（仓库根目录；脚本自动加 slug 前缀）：

```bash
pnpm exec tsx {SKILL_ROOT}/scripts/cover-to-png.ts .marketing/designs/YYYY-MM-DD-slug/cover-2.35-1.html 2350 1000
pnpm exec tsx {SKILL_ROOT}/scripts/cover-to-png.ts .marketing/designs/YYYY-MM-DD-slug/cover-3-4.html 1080 1440
# → output/slug-cover-2.35-1.png、output/slug-cover-3-4.png
```

5. frontmatter 引用成品（相对 articles 路径，**含 slug 前缀**）：

```yaml
cover: ../designs/2026-05-21-gps-track-engine/output/gps-track-engine-cover-2.35-1.png   # 公众号
cover: ../designs/2026-05-21-gps-track-engine/output/gps-track-engine-cover-3-4.png      # 贴图 / 小红书
```

6. **自检**（缩略图预览）：公众号主文案可读、不看正文能猜主题；贴图/小红书有明确情绪、与 title 呼应但不机械重复全文；**文件名含 slug、不与 HISTORY 中其它文章 output 重名**

### 多页轮播

贴图轮播、小红书卡片：**优先** guizang 一组 3:4（封面 + 4–8 内容页，见 `{GUIZANG_SKILL}/references/content-planning.md`），导出后统一为 `output/<slug>-slide-NN.png`（封面页可同时保留 `<slug>-cover-3-4.png`）。

**备选**：同 slug 目录下 `slide-01.html`… + `cover-to-png.ts` 或存量 `capture.mjs`（参考 `designs/2026-05-21-product-launch/`，**新稿目录名改为文章 slug**）。文章 `images` / `assets` 按顺序引用。

**封面设计要点**（guizang 与手写 HTML 共用）：

- 2.35:1 / 21:9：大标题 > 副标题/标签 > 背景场景；主标题 ≤12 字
- 3:4：第一视觉是情绪（惊喜/治愈/共鸣/反差）；`<slug>-cover-3-4.png` 作 feed 缩略，轮播用 `<slug>-slide-NN.png`
- **封面截图框禁止倾斜**：手机框 / 主截图容器不用 `transform: rotate`；角标可水平放置，勿旋转

### slides.html 手写轮播规范（备选路径）

与 guizang 共用品牌色时，默认背景 **`#faf9f7`**（见 README 速记），**不用偏黄暖色**（如 Forest Ink `#f5f1e8`、Dune `#f0e6d2`），除非用户明确要求暖调。

**列表 / 要点卡**（痛点页等多条并列）：

- padding ≤ `14px`、字号 `17–18px`、行距 `1.45`、卡片间距 `8px`
- 列表容器**勿** `flex: 1` 撑满竖向空间，用 `align-self: flex-start` 让卡片保持内容高度
- 三条以内并列时，避免卡片被 flex 拉高成「大块空白卡」

**同主题多截图**（地图缩放高/中/低、前后步骤对比等递进关系）：

- **合成一页**展示（三列手机框 + 标签），不为每张截图单独占一页 slide
- 导出后仍可在 `images` / `assets` 中单独引用原始截图供编辑器使用

## 公众号 HTML 转换

Agent **只写** `.md`；`.fragment.html` **必须由脚本生成**，禁止 AI 手写或编辑 HTML。

```bash
pnpm exec tsx {SKILL_ROOT}/scripts/md-to-gongzhonghao-html.ts
pnpm exec tsx {SKILL_ROOT}/scripts/md-to-gongzhonghao-html.ts .marketing/articles/gongzhonghao/YYYY-MM-DD-slug.md
```

样式只改 `{SKILL_ROOT}/scripts/gongzhonghao-html/styles.ts`，勿写入 `package.json`。

**复制到公众号编辑器**：打开 `.fragment.html` 全选复制 → 粘贴正文区；相对路径图片若未显示则在编辑器内重新上传。

## 平台规范

封面与配图路径一律见「designs 配图」。

### 公众号

1. 标题 15–25 字；导语 1–2 句钩子；正文小标题分段，每段 2–4 行
2. 自然带出「出门玩儿」能力，附 1–2 张 assets 截图；结尾轻 CTA（搜索小程序名 / 扫码）
3. 语气：温暖、可靠、略文艺

```yaml
---
title: 文章标题
platform: gongzhonghao
date: 2026-05-21
tags: [徒步, 路线记录]
cover: ../designs/2026-05-21-gps-track-engine/output/gps-track-engine-cover-2.35-1.png
assets:
  - ../assets/小程序-首页.jpg
---
```

### 公众号贴图

顶部横向滑动多图 + 标题 + 标签 + 纯文字正文 + 可选地址。正文**纯文本**（无 Markdown 语法）；标题/标签/图片/地址由 frontmatter 承载，正文不重复标题。

- 图片至少 1 张，建议 3–9 张；`<slug>-cover-3-4.png` 可置于 `images` 首位
- 语气：简洁、信息密度高

```yaml
---
title: 周末西湖环线徒步攻略
platform: gongzhonghaotietu
date: 2026-05-24
tags: [徒步, 西湖, 周末]
cover: ../designs/2026-05-24-west-lake-loop/output/west-lake-loop-cover-3-4.png
address: 杭州市西湖区龙井路1号
images:
  - ../designs/2026-05-24-west-lake-loop/output/west-lake-loop-cover-3-4.png
  - ../designs/2026-05-24-west-lake-loop/output/west-lake-loop-slide-01.png
  - ../assets/小程序-路线详情.jpg
---

第一段纯文字正文。段落之间空一行。
```

HISTORY 平台写 `公众号贴图`。

### 小红书

1. 标题 ≤20 字，可含 emoji；开头第一句即钩子
2. 正文短句、空行多、列表或 emoji 分段；文末 5–8 个 `#标签`
3. 语气：口语、真实、第一人称

```yaml
---
title: 笔记标题
platform: xiaohongshu
date: 2026-05-21
tags: [徒步, 户外, 出门玩儿]
cover: ../designs/2026-05-21-poster-maker/output/poster-maker-cover-3-4.png
assets:
  - ../designs/2026-05-21-poster-maker/output/poster-maker-slide-01.png
  - ../assets/小程序-制作海报.jpg
---
```

### 视频号

产出 = 可录屏网页演示 + 可选 TTS，不是纯 Markdown。目录结构：

```
articles/shipinhao/YYYY-MM-DD-<slug>/
├── article.md          # 本 skill 产出（画面细节源，不删）
├── script.md           # web-video-presentation Phase 1
├── outline.md          # web-video-presentation Phase 1
└── presentation/       # web-video-presentation Phase 2
```

**article.md 要点**：45–90 秒口播（约 150–350 字）；钩子 → 场景/痛点 → 产品能力 1–3 点 → 轻 CTA；第一人称口语短句；文末或 frontmatter 列 `assets/` 路径；禁止编造未上线功能。

**内容来源**：新写；或复用公众号/小红书稿（删标签、压缩段落、改口语）；HISTORY 注明「复用 xxx 稿」。

**与 web-video-presentation 衔接**：

1. 本 skill：`article.md` 落盘 → 更新 HISTORY（「待演示」）
2. 读 `{SKILL_ROOT 同级}/web-video-presentation/SKILL.md`，Phase 1 产出 `script.md` + `outline.md`
3. Checkpoint 默认：画幅 **9:16**；主题优先 `luji-trail`；素材优先 `article.md` frontmatter 与 `assets/`
4. Phase 2–4 完成后更新 HISTORY（「presentation 已完成 / 已导出 mp4」）；发布文案可写 `publish.md`

```yaml
---
title: 徒步完一键出海报
platform: shipinhao
date: 2026-05-25
targetPlatforms: [视频号, 抖音]
sourceArticle: ../xiaohongshu/2026-05-21-weekend-poster.md
aspect: 9:16
tags: [徒步, 海报, 出门玩儿]
assets:
  - ../../assets/小程序-制作海报.jpg
---
```

## 协作 skills

| Skill | 何时用 |
|-------|--------|
| **`guizang-social-card-skill`** | **配图首选**：封面、3:4 轮播、公众号 21:9+1:1 封面对、截图/户外种草组图；落盘仍遵守本 skill 的 `designs/.../output/<slug>-*.png` |
| `web-video-presentation` | 视频号：article → 口播 + 录屏网页（必用） |
| `xhs-content-plan` | 小红书选题困难、竞品分析 |
| `xiaohongshu-ops` | 小红书语气/结构/标签优化 |
| `post-to-xhs` | 用户明确要求发布到小红书时（本 skill 不含发布） |

## Legacy（只读不增）

存量 `articles/**/*.cover.html`、`.cover.png` 及 topic 型 `designs/`（如 `2026-05-21-product-launch`）**不要复制到新稿**。新稿一律 `designs/YYYY-MM-DD-<slug>/` + frontmatter 引用 `../designs/.../output/`。存量迁移非本 skill 范围。
