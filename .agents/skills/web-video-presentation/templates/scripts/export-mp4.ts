/**
 * Playwright 录屏 → MP4（口播后期合成）
 *
 * Requires global tools — run once:
 *   bash <skill>/scripts/setup-global-tools.sh
 *
 * Usage: npm run export:mp4
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  exportStepHoldSec,
  visualMinForStep,
} from "../src/registry/export-visual-min.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ROOT = resolve(__dirname, "..");
const PORT = 5199;
const STORAGE_KEY = "presentation-cursor-v4";
const SEGMENTS_PATH = join(ROOT, "audio-segments.json");
const OUT_DIR = join(ROOT, "output");
const OUT_MP4 =
  process.env.PRESENTATION_EXPORT_MP4 ?? join(OUT_DIR, "export.mp4");
const PRE_ROLL_SEC = 0.8;
const FINAL_HOLD_SEC = 1.5;

const CHROMIUM_ARGS = [
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding",
  "--disable-frame-rate-limit",
  "--force-color-profile=srgb",
];

function resolveFfmpeg(): string {
  if (process.env.FFMPEG && existsSync(process.env.FFMPEG)) {
    return process.env.FFMPEG;
  }
  const which = spawnSync("which", ["ffmpeg"], { encoding: "utf8" });
  if (which.status === 0 && which.stdout.trim()) return which.stdout.trim();
  try {
    const installer = require("@ffmpeg-installer/ffmpeg") as { path: string };
    if (installer?.path) return installer.path;
  } catch {
    /* optional project fallback */
  }
  throw new Error(
    "ffmpeg not found — run: bash <skill>/scripts/setup-global-tools.sh",
  );
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    try {
      const globalRoot = spawnSync("npm", ["root", "-g"], {
        encoding: "utf8",
      }).stdout.trim();
      return require(join(globalRoot, "playwright"));
    } catch {
      throw new Error(
        "playwright not found — run: bash <skill>/scripts/setup-global-tools.sh",
      );
    }
  }
}

async function readStageSize(): Promise<{ w: number; h: number }> {
  const mod = await import(
    pathToFileURL(join(ROOT, "src/config/stage.ts")).href
  );
  const STAGE = mod.STAGE as { width: number; height: number };
  return { w: STAGE.width, h: STAGE.height };
}

const FFMPEG = resolveFfmpeg();

interface Segment {
  chapter: string;
  step: number;
  text: string;
  audio: string;
}

interface ExportTimeline {
  preRollSec: number;
  durationsSec: number[];
  finalHoldSec: number;
}

function run(cmd: string, args: string[], cwd = ROOT): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${cmd} exited with ${code}`));
    });
  });
}

function runCaptureStderr(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    child.stderr?.on("data", (d: Buffer) => {
      err += d.toString();
    });
    child.on("error", reject);
    child.on("exit", () => resolvePromise(err));
  });
}

async function probeDurationSec(file: string): Promise<number> {
  try {
    const err = await runCaptureStderr(FFMPEG, ["-i", file]);
    const m = err.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    return parseInt(m[1]!, 10) * 3600 + parseInt(m[2]!, 10) * 60 + parseFloat(m[3]!);
  } catch {
    return 0;
  }
}

async function probeSegmentDurations(segments: Segment[]): Promise<number[]> {
  const durations: number[] = [];
  for (const seg of segments) {
    const audioPath = join(ROOT, "public", "audio", seg.audio);
    if (!existsSync(audioPath)) {
      throw new Error(`missing audio: ${seg.audio}`);
    }
    const probed = await probeDurationSec(audioPath);
    durations.push(
      probed > 0 ? probed : Math.max(1.5, seg.text.length * 0.25),
    );
  }
  return durations;
}

function scaleToMaster(probed: number[], masterSec: number): number[] {
  const sum = probed.reduce((a, b) => a + b, 0);
  if (sum <= 0 || masterSec <= 0) return probed;
  const scale = masterSec / sum;
  const scaled = probed.map((d) => d * scale);
  const drift = masterSec - scaled.reduce((a, b) => a + b, 0);
  scaled[scaled.length - 1]! += drift;
  return scaled;
}

function computeHoldDurations(speechSec: number[]): number[] {
  return speechSec.map((sec, i) =>
    exportStepHoldSec(sec, visualMinForStep(i)),
  );
}

function recordingDurationSec(timeline: ExportTimeline): number {
  return (
    timeline.preRollSec +
    timeline.durationsSec.reduce((a, b) => a + b, 0) +
    timeline.finalHoldSec
  );
}

function startPreview(): Promise<{ proc: ChildProcess; close: () => void }> {
  return new Promise((resolvePromise, reject) => {
    const proc = spawn(
      "npm",
      ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(PORT)],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] },
    );
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) reject(new Error("preview server timeout"));
    }, 60_000);
    const onData = (d: Buffer) => {
      const s = d.toString();
      if (!settled && s.includes("Local:")) {
        settled = true;
        clearTimeout(timer);
        resolvePromise({ proc, close: () => proc.kill("SIGTERM") });
      }
    };
    proc.stdout?.on("data", onData);
    proc.stderr?.on("data", onData);
    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    proc.on("exit", (code) => {
      if (!settled) {
        clearTimeout(timer);
        reject(new Error(`preview exited early: ${code}`));
      }
    });
  });
}

async function buildPaddedAudio(
  segments: Segment[],
  speechSec: number[],
  holdSec: number[],
): Promise<string> {
  const paddedDir = join(OUT_DIR, "padded-segments");
  mkdirSync(paddedDir, { recursive: true });
  const paddedPaths: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const src = join(ROOT, "public", "audio", segments[i]!.audio);
    const out = join(paddedDir, `${String(i).padStart(2, "0")}.m4a`);
    const pad = Math.max(0, holdSec[i]! - speechSec[i]!);
    const args = ["-y", "-i", src];
    if (pad > 0.001) args.push("-af", `apad=pad_dur=${pad.toFixed(4)}`);
    args.push("-c:a", "aac", "-b:a", "192k", out);
    await run(FFMPEG, args);
    paddedPaths.push(out);
  }
  const listPath = join(OUT_DIR, "audio-concat-padded.txt");
  writeFileSync(
    listPath,
    `${paddedPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n")}\n`,
    "utf8",
  );
  const outPath = join(OUT_DIR, "export-audio.m4a");
  await run(FFMPEG, [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    outPath,
  ]);
  return outPath;
}

async function main() {
  if (!existsSync(SEGMENTS_PATH)) {
    throw new Error("missing audio-segments.json — run npm run extract-narrations");
  }
  const segments = JSON.parse(readFileSync(SEGMENTS_PATH, "utf8")) as Segment[];
  const { w, h } = await readStageSize();
  mkdirSync(OUT_DIR, { recursive: true });

  console.log("▸ calibrating speech durations…");
  const rawAudioPath = join(OUT_DIR, "export-audio-raw.m4a");
  {
    const listPath = join(OUT_DIR, "audio-concat.txt");
    writeFileSync(
      listPath,
      `${segments
        .map((seg) => {
          const abs = join(ROOT, "public", "audio", seg.audio).replace(
            /'/g,
            "'\\''",
          );
          return `file '${abs}'`;
        })
        .join("\n")}\n`,
      "utf8",
    );
    await run(FFMPEG, [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      rawAudioPath,
    ]);
  }

  const masterSpeechSec = await probeDurationSec(rawAudioPath);
  const probed = await probeSegmentDurations(segments);
  const speechSec = scaleToMaster(probed, masterSpeechSec);
  const holdSec = computeHoldDurations(speechSec);
  const padTotal = holdSec.reduce(
    (s, h, i) => s + Math.max(0, h - speechSec[i]!),
    0,
  );

  console.log("▸ building padded narration…");
  const audioPath = await buildPaddedAudio(segments, speechSec, holdSec);

  const timeline: ExportTimeline = {
    preRollSec: PRE_ROLL_SEC,
    durationsSec: holdSec,
    finalHoldSec: FINAL_HOLD_SEC,
  };
  writeFileSync(
    join(OUT_DIR, "export-timeline.json"),
    `${JSON.stringify({ masterSpeechSec, speechSec, holdSec, padTotalSec: padTotal, timeline }, null, 2)}\n`,
  );

  const recordSec = recordingDurationSec(timeline);
  console.log(
    `▸ ${holdSec.length} steps · speech ${masterSpeechSec.toFixed(1)}s + pad ${padTotal.toFixed(1)}s · record ~${Math.round(recordSec)}s · ${w}×${h}`,
  );

  console.log("▸ building…");
  await run("npm", ["run", "build"]);
  rmSync(OUT_MP4, { force: true });

  console.log("▸ starting preview…");
  const preview = await startPreview();
  const { chromium } = await loadPlaywright();

  let webmPath = "";
  try {
    const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
    const context = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      recordVideo: { dir: OUT_DIR, size: { width: w, height: h } },
      locale: "zh-CN",
      reducedMotion: "no-preference",
    });
    await context.addInitScript(
      (payload: { key: string; timeline: ExportTimeline }) => {
        localStorage.removeItem(payload.key);
        window.__EXPORT_TIMELINE__ = payload.timeline;
        window.__EXPORT_DONE__ = false;
        window.__EXPORT_RUNNING__ = false;
      },
      { key: STORAGE_KEY, timeline },
    );
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/?manual=1&export=1&timeline=1`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector(".stage-frame", { timeout: 30_000 });
    console.log("▸ recording…");
    await page.waitForFunction(() => window.__EXPORT_DONE__ === true, undefined, {
      timeout: Math.ceil(recordSec * 1000) + 30_000,
    });
    const video = page.video();
    await context.close();
    await browser.close();
    webmPath = (await video?.path()) ?? "";
  } finally {
    preview.close();
  }

  if (!webmPath || !existsSync(webmPath)) {
    throw new Error("recording failed");
  }

  console.log("▸ merging…");
  const videoOnly = join(OUT_DIR, "export-video.mp4");
  const delayMs = Math.round(PRE_ROLL_SEC * 1000);
  await run(FFMPEG, [
    "-y",
    "-i",
    webmPath,
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "18",
    "-preset",
    "medium",
    videoOnly,
  ]);
  await run(FFMPEG, [
    "-y",
    "-i",
    videoOnly,
    "-i",
    audioPath,
    "-filter_complex",
    `[1:a]adelay=${delayMs}|${delayMs}[aout]`,
    "-map",
    "0:v:0",
    "-map",
    "[aout]",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    OUT_MP4,
  ]);
  console.log(`✓ ${OUT_MP4}`);
}

main().catch((err) => {
  console.error(`✗ ${err.message ?? err}`);
  process.exit(1);
});
