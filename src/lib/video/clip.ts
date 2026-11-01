// Clip factories, speed/duration math, and source metadata helpers.

import { DEFAULT_EFFECTS, uid, type Clip, type ClipSource, type ColorAdjust, type ClipEffects } from './types';

/** Effective source duration consumed by a clip given its trim and speed. */
export function sourceConsumed(clip: Clip): number {
  return (clip.outPoint - clip.inPoint) / Math.max(1e-3, Math.abs(clip.speed));
}

/** Convert a timeline (absolute) time to the corresponding source time for a clip. */
export function timeToSource(clip: Clip, absoluteTime: number): number {
  const offset = absoluteTime - clip.start;
  if (offset < 0) return clip.inPoint;
  const t = clip.inPoint + offset * Math.max(1e-3, Math.abs(clip.speed));
  return Math.min(t, clip.outPoint);
}

export function makeClip(
  trackId: string,
  source: ClipSource,
  start: number,
  duration: number,
  opts: Partial<Clip> = {}
): Clip {
  return {
    id: uid('clip'),
    trackId,
    source,
    start,
    duration,
    inPoint: 0,
    outPoint: opts.sourceDuration ?? duration,
    speed: 1,
    reverse: false,
    volume: 1,
    fadeIn: 0,
    fadeOut: 0,
    effects: cloneEffects(DEFAULT_EFFECTS),
    ...opts,
  };
}

export function cloneEffects(e: ClipEffects): ClipEffects {
  return {
    color: { ...(e.color) } as ColorAdjust,
    filters: e.filters.map((f) => ({ ...f })),
    blur: e.blur,
    sharpen: e.sharpen,
    vignette: e.vignette,
    motionBlur: e.motionBlur,
    stabilization: e.stabilization,
    speedRamp: [...e.speedRamp],
  };
}

/** Read metadata for a media file (video/image dimensions, duration). */
export function readMediaMeta(
  url: string
): Promise<{ width: number; height: number; duration: number; thumbnail?: string }> {
  return new Promise((resolve) => {
    const isVideo = /\.(mp4|mov|avi|webm|m4v)(\?|$)/i.test(url);
    const isAudio = /\.(wav|mp3|aac|m4a|ogg)(\?|$)/i.test(url);
    if (isAudio) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.src = url;
      audio.onloadedmetadata = () =>
        resolve({ width: 0, height: 0, duration: audio.duration || 0 });
      audio.onerror = () => resolve({ width: 0, height: 0, duration: 0 });
      return;
    }
    if (isVideo) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      v.src = url;
      v.onloadedmetadata = () => {
        // Seek near the start to capture a poster frame.
        const cap = () => {
          let thumb: string | undefined;
          try {
            const c = document.createElement('canvas');
            c.width = 160;
            c.height = Math.max(1, Math.round((v.videoHeight / Math.max(1, v.videoWidth)) * 160));
            const ctx = c.getContext('2d');
            if (ctx) {
              ctx.drawImage(v, 0, 0, c.width, c.height);
              thumb = c.toDataURL('image/jpeg', 0.5);
            }
          } catch {
            /* taint — skip */
          }
          resolve({ width: v.videoWidth, height: v.videoHeight, duration: v.duration || 0, thumbnail: thumb });
        };
        v.currentTime = Math.min(0.1, (v.duration || 0) / 2);
        v.onseeked = cap;
        v.onerror = () => resolve({ width: v.videoWidth, height: v.videoHeight, duration: v.duration || 0 });
        setTimeout(cap, 600);
      };
      v.onerror = () => resolve({ width: 0, height: 0, duration: 0 });
    } else {
      const img = new Image();
      img.onload = () => {
        let thumb: string | undefined;
        try {
          const c = document.createElement('canvas');
          c.width = 160;
          c.height = Math.max(1, Math.round((img.naturalHeight / Math.max(1, img.naturalWidth)) * 160));
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, c.width, c.height);
            thumb = c.toDataURL('image/jpeg', 0.6);
          }
        } catch {
          /* skip */
        }
        resolve({ width: img.naturalWidth, height: img.naturalHeight, duration: 0, thumbnail: thumb });
      };
      img.onerror = () => resolve({ width: 0, height: 0, duration: 0 });
      img.src = url;
    }
  });
}

export function clipEnd(clip: Clip): number {
  return clip.start + clip.duration;
}

export function formatTimecode(seconds: number, fps = 30): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const totalFrames = Math.round(seconds * fps);
  const f = totalFrames % fps;
  const totalSec = Math.floor(totalFrames / fps);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const pad = (n: number, l = 2) => n.toString().padStart(l, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}
