/**
 * Per-step minimum animation duration for MP4 export (seconds).
 *
 * After all chapters are done, fill EXPORT_VISUAL_MIN_SEC with one entry per
 * global step (coldopen step0, step1, …). Missing entries fall back to
 * DEFAULT_VISUAL_MIN_SEC.
 *
 * Tune when export:mp4 cuts animations mid-way in headless Chrome.
 */
export const DEFAULT_VISUAL_MIN_SEC = 1.0;

/** Longest on-screen animation per global step — update when chapters change. */
export const EXPORT_VISUAL_MIN_SEC: readonly number[] = [
  // Example project (01-example): 3 steps
  0.9, 0.9, 0.9,
];

export function visualMinForStep(index: number): number {
  return EXPORT_VISUAL_MIN_SEC[index] ?? DEFAULT_VISUAL_MIN_SEC;
}

/** Headless Chrome often runs CSS slower than wall clock. */
export const EXPORT_HEADLESS_ANIM_FACTOR = 1.75;
export const EXPORT_ANIM_TAIL_SEC = 0.15;
/** Extra silence after each line so CSS can finish; synced via apad in export-mp4. */
export const EXPORT_POST_SPEECH_PAD_SEC = 0.4;

export function exportStepHoldSec(speechSec: number, visualMinSec: number): number {
  const visualNeed =
    visualMinSec * EXPORT_HEADLESS_ANIM_FACTOR + EXPORT_ANIM_TAIL_SEC;
  return Math.max(speechSec, visualNeed) + EXPORT_POST_SPEECH_PAD_SEC;
}
