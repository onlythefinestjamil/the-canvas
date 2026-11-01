// Audio decoding and waveform extraction via Web Audio API.

export interface WaveformPeaks {
  /** Min/max sample pairs per bucket, scaled to [-1, 1]. */
  peaks: number[];
  /** Total duration in seconds. */
  duration: number;
  /** Number of buckets. */
  buckets: number;
}

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!sharedCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedCtx = new Ctor();
  }
  return sharedCtx;
}

export async function decodeAudioBuffer(url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  const arr = await res.arrayBuffer();
  return await getCtx().decodeAudioData(arr);
}

/** Extract min/max waveform peaks from a decoded AudioBuffer. */
export function extractPeaks(buffer: AudioBuffer, buckets = 200): WaveformPeaks {
  const channel = buffer.getChannelData(0);
  const total = channel.length;
  const bucketSize = Math.max(1, Math.floor(total / buckets));
  const peaks: number[] = [];
  for (let i = 0; i < buckets; i++) {
    const start = i * bucketSize;
    const end = Math.min(total, start + bucketSize);
    let min = 1;
    let max = -1;
    for (let j = start; j < end; j++) {
      const v = channel[j];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    peaks.push(min);
    peaks.push(max);
  }
  return { peaks, duration: buffer.duration, buckets };
}

/** Render a waveform peak array to a canvas path. */
export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  peaks: WaveformPeaks,
  width: number,
  height: number,
  color = '#7c5cff'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const mid = height / 2;
  const step = width / peaks.buckets;
  for (let i = 0; i < peaks.buckets; i++) {
    const min = peaks.peaks[i * 2];
    const max = peaks.peaks[i * 2 + 1];
    const x = i * step;
    const y1 = mid - max * mid;
    const y2 = mid - min * mid;
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
  }
  ctx.stroke();
  ctx.restore();
}

/** Compute an audio gain envelope for fade in/out (linear). */
export function fadeGain(time: number, start: number, duration: number, fadeIn: number, fadeOut: number): number {
  const rel = time - start;
  if (rel < fadeIn) return Math.max(0, Math.min(1, rel / Math.max(1e-6, fadeIn)));
  const tail = start + duration - time;
  if (tail < fadeOut) return Math.max(0, Math.min(1, tail / Math.max(1e-6, fadeOut)));
  return 1;
}

/** Simple audio ducking: attenuate music gain based on presence of a "voice" clip. */
export function duckedVolume(time: number, musicVolume: number, voiceActive: boolean): number {
  return voiceActive ? musicVolume * 0.25 : musicVolume;
}
