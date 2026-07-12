import { useEffect, useRef } from "react";

declare global {
  interface Window {
    __EXPORT_TIMELINE__?: {
      preRollSec: number;
      durationsSec: number[];
      finalHoldSec: number;
    };
    __EXPORT_DONE__?: boolean;
    __EXPORT_RUNNING__?: boolean;
  }
}

function waitUntil(deadlineMs: number): Promise<void> {
  return new Promise((resolve) => {
    const tick = () => {
      if (performance.now() >= deadlineMs) resolve();
      else requestAnimationFrame(tick);
    };
    tick();
  });
}

/**
 * Export-only step driver: `?export=1&timeline=1` + `window.__EXPORT_TIMELINE__`
 * injected by `scripts/export-mp4.ts`.
 */
export function useExportTimeline(onAdvance: () => void) {
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("export") !== "1" || q.get("timeline") !== "1") return;

    const cfg = window.__EXPORT_TIMELINE__;
    if (!cfg?.durationsSec?.length) return;

    let cancelled = false;
    window.__EXPORT_DONE__ = false;
    if (window.__EXPORT_RUNNING__) return;
    window.__EXPORT_RUNNING__ = true;

    const { preRollSec, durationsSec, finalHoldSec } = cfg;
    const anchor = performance.now();

    (async () => {
      let offsetMs = preRollSec * 1000;
      for (let i = 0; i < durationsSec.length; i++) {
        offsetMs += durationsSec[i]! * 1000;
        await waitUntil(anchor + offsetMs);
        if (cancelled) return;
        if (i < durationsSec.length - 1) onAdvanceRef.current();
      }
      await waitUntil(anchor + offsetMs + finalHoldSec * 1000);
      if (!cancelled) window.__EXPORT_DONE__ = true;
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
