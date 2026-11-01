// Export: render the project to a video file via MediaRecorder + canvas capture.

import type { VideoProject } from './types';
import { clipEnd } from './clip';
import { clipsAtTime } from './timeline';
import { canvasFilterString, drawVignette, drawFilmGrain } from './effects';
import { timeToSource } from './clip';
import { renderText, textAnimationState } from './text-overlay';
import { fadeGain } from './audio';

export interface ExportOptions {
  format: 'mp4' | 'webm' | 'mov';
  codec: 'h264' | 'h265' | 'vp9' | 'av1';
  resolution: '480p' | '720p' | '1080p' | '4k';
  fps: 24 | 30 | 60;
  bitrate: number; // kbps
  mode: 'cbr' | 'vbr';
  audioCodec: 'aac' | 'mp3';
  audioBitrate: number; // kbps
}

export const DEFAULT_EXPORT: ExportOptions = {
  format: 'webm',
  codec: 'h264',
  resolution: '1080p',
  fps: 30,
  bitrate: 8000,
  mode: 'vbr',
  audioCodec: 'aac',
  audioBitrate: 192,
};

const RES_MAP = { '480p': [854, 480], '720p': [1280, 720], '1080p': [1920, 1080], '4k': [3840, 2160] } as const;

export interface ExportQueueItem {
  id: string;
  project: VideoProject;
  options: ExportOptions;
  status: 'queued' | 'running' | 'done' | 'error';
  progress: number; // 0..1
  url?: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
}

/** MIME type for a given export options combo. */
export function mimeFor(opts: ExportOptions): string {
  if (opts.format === 'webm') return `video/webm;codecs=${opts.codec === 'h264' ? 'vp9' : opts.codec}`;
  if (opts.format === 'mov') return 'video/quicktime';
  return 'video/mp4';
}

/** Pick the best supported mime for MediaRecorder on this browser. */
export function pickRecorderMime(opts: ExportOptions): string {
  const candidates = [mimeFor(opts), 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c;
  }
  return 'video/webm';
}

interface ActiveMedia {
  video: HTMLVideoElement;
  audio?: HTMLAudioElement;
  img?: HTMLImageElement;
}

/** Render one frame to the target canvas. Returns nothing; caller handles recorder. */
export async function renderFrame(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  time: number,
  width: number,
  height: number,
  mediaCache: Map<string, ActiveMedia>
): Promise<void> {
  ctx.save();
  ctx.fillStyle = project.background;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  const active = clipsAtTime(project, time);
  for (const clip of active) {
    const track = project.tracks.find((t) => t.id === clip.trackId);
    if (!track || track.hidden) continue;
    if (track.kind === 'audio' || track.muted) continue;
    if (clip.source.type === 'color') {
      ctx.save();
      ctx.fillStyle = clip.source.color;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      continue;
    }
    if (clip.text && track.kind === 'text') {
      const state = textAnimationState(clip.text.text, time, clip.start, clip.duration, clip.text.animation, clip.text.animationDuration);
      renderText(ctx, clip.text, state, width, height);
      continue;
    }
    // media clip
    const key = clip.source.url;
    let m = mediaCache.get(key);
    if (!m) {
      if (clip.source.mediaType === 'video') {
        const v = document.createElement('video');
        v.src = key;
        v.crossOrigin = 'anonymous';
        v.muted = true;
        v.loop = false;
        v.playsInline = true;
        await new Promise<void>((res) => {
          v.onloadeddata = () => res();
          v.onerror = () => res();
        });
        m = { video: v };
      } else if (clip.source.mediaType === 'image') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = key;
        await new Promise<void>((res) => {
          img.onload = () => res();
          img.onerror = () => res();
        });
        m = { video: null as never, img };
      } else {
        continue;
      }
      mediaCache.set(key, m);
    }
    if (clip.source.mediaType === 'video' && m.video) {
      const srcTime = timeToSource(clip, time);
      if (Math.abs(m.video.currentTime - srcTime) > 0.05) {
        try {
          m.video.currentTime = srcTime;
        } catch {
          /* seek blocked */
        }
      }
      const vw = m.video.videoWidth || width;
      const vh = m.video.videoHeight || height;
      const scale = Math.min(width / vw, height / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (width - dw) / 2;
      const dy = (height - dh) / 2;
      ctx.save();
      ctx.filter = canvasFilterString(clip.effects);
      ctx.globalAlpha = fadeGain(time, clip.start, clip.duration, clip.fadeIn, clip.fadeOut);
      ctx.drawImage(m.video, dx, dy, dw, dh);
      ctx.filter = 'none';
      if (clip.effects.vignette > 0) drawVignette(ctx, width, height, clip.effects.vignette);
      if (clip.effects.filters.some((f) => f.id === 'film-grain')) {
        const grain = clip.effects.filters.find((f) => f.id === 'film-grain');
        if (grain) drawFilmGrain(ctx, width, height, grain.intensity, time);
      }
      ctx.restore();
    } else if (clip.source.mediaType === 'image' && m.img) {
      const iw = m.img.naturalWidth || width;
      const ih = m.img.naturalHeight || height;
      const scale = Math.min(width / iw, height / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (width - dw) / 2;
      const dy = (height - dh) / 2;
      ctx.save();
      ctx.filter = canvasFilterString(clip.effects);
      ctx.globalAlpha = fadeGain(time, clip.start, clip.duration, clip.fadeIn, clip.fadeOut);
      ctx.drawImage(m.img, dx, dy, dw, dh);
      ctx.filter = 'none';
      if (clip.effects.vignette > 0) drawVignette(ctx, width, height, clip.effects.vignette);
      ctx.restore();
    }
    // Text overlay drawn on top of video clips if defined.
    if (clip.text && track.kind === 'video') {
      const state = textAnimationState(clip.text.text, time, clip.start, clip.duration, clip.text.animation, clip.text.animationDuration);
      renderText(ctx, clip.text, state, width, height);
    }
  }
}

/** Total duration of the project in seconds (max clip end). */
export function totalDuration(project: VideoProject): number {
  let end = 0;
  for (const c of project.clips) end = Math.max(end, clipEnd(c));
  return Math.max(0.5, end);
}

/** Run a full export and resolve with a Blob URL. Reports progress via onProgress. */
export async function exportProject(
  project: VideoProject,
  options: ExportOptions,
  onProgress?: (p: number) => void
): Promise<string> {
  const [w, h] = RES_MAP[options.resolution];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  const stream = (canvas as HTMLCanvasElement).captureStream(options.fps);

  // Mix audio from clips via WebAudio.
  let audioCtx: AudioContext | null = null;
  let dest: MediaStreamAudioDestinationNode | null = null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctor();
    dest = audioCtx.createMediaStreamDestination();
    for (const track of stream.getAudioTracks()) stream.removeTrack(track);
    for (const tr of dest.stream.getAudioTracks()) stream.addTrack(tr);
  } catch {
    /* no audio */
  }

  const mime = pickRecorderMime(options);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: options.bitrate * 1000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const done = new Promise<string>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };
    recorder.onerror = (ev) => reject((ev as unknown as { error?: Error })?.error ?? new Error('recorder error'));
  });

  const mediaCache = new Map<string, ActiveMedia>();
  const duration = totalDuration(project);
  const frameDur = 1 / options.fps;
  recorder.start();
  if (audioCtx) await audioCtx.resume().catch(() => {});

  // Prime media + schedule audio.
  for (const clip of project.clips) {
    if (clip.source.type !== 'file' && clip.source.type !== 'gallery') continue;
    if (clip.source.mediaType !== 'video' && clip.source.mediaType !== 'image') continue;
    if (mediaCache.has(clip.source.url)) continue;
    if (clip.source.mediaType === 'video') {
      const v = document.createElement('video');
      v.src = clip.source.url;
      v.crossOrigin = 'anonymous';
      v.muted = true;
      v.playsInline = true;
      await new Promise<void>((r) => {
        v.onloadeddata = () => r();
        v.onerror = () => r();
      });
      mediaCache.set(clip.source.url, { video: v });
    }
  }

  // Connect audio for any audio clips to the destination.
  if (audioCtx && dest) {
    for (const clip of project.clips) {
      if (clip.source.type === 'color') continue;
      if (clip.source.mediaType !== 'audio') continue;
      try {
        const resp = await fetch(clip.source.url);
        const buf = await resp.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(buf);
        const node = audioCtx.createBufferSource();
        node.buffer = decoded;
        const gain = audioCtx.createGain();
        gain.gain.value = clip.volume;
        node.connect(gain);
        gain.connect(dest);
        // Schedule playback at the clip's start time (relative to recorder start = now).
        const when = audioCtx.currentTime + Math.max(0, clip.start);
        node.start(when, clip.inPoint, clip.outPoint - clip.inPoint);
      } catch {
        /* skip audio */
      }
    }
  }

  // Render frames.
  for (let t = 0; t < duration; t += frameDur) {
    await renderFrame(ctx, project, t, w, h, mediaCache);
    onProgress?.(t / duration);
    // Yield to the event loop so MediaRecorder can capture the frame.
    await new Promise<void>((r) => setTimeout(r, frameDur * 500));
  }
  await renderFrame(ctx, project, duration, w, h, mediaCache);
  onProgress?.(1);
  recorder.stop();
  if (audioCtx) audioCtx.close();
  return done;
}
