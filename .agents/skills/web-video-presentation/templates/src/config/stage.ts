/**
 * Stage dimensions — overwritten by scaffold.sh via --aspect / --platform.
 * Default: 16:9 landscape (1920×1080) for B 站 / YouTube.
 * Use --aspect=9:16 or --platform=channels for 微信视频号 / 抖音竖屏 (1080×1920).
 */
export const STAGE = {
  width: 1920,
  height: 1080,
  aspect: "16:9" as const,
  aspectLabel: "16:9",
  orientation: "landscape" as const,
} as const;

export type StageConfig = typeof STAGE;
