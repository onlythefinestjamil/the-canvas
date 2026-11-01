// Effects: color correction, filters, and canvas-2D filter strings.

import type { Clip, ClipEffects, ColorAdjust } from './types';

export interface FilterPreset {
  id: string;
  name: string;
  // CSS filter fragment applied for the "look".
  css: (intensity: number) => string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'vintage', name: 'Vintage', css: (i) => `sepia(${0.6 * i}) contrast(${1 + 0.1 * i}) saturate(${1.2 * i})` },
  { id: 'film-grain', name: 'Film Grain', css: (i) => `contrast(${1 + 0.05 * i}) brightness(${1 - 0.03 * i})` },
  { id: 'vhs', name: 'VHS', css: (i) => `saturate(${1.3 * i}) contrast(${1.1 * i}) blur(${0.4 * i}px)` },
  { id: 'glitch', name: 'Glitch', css: (i) => `hue-rotate(${30 * i}deg) saturate(${1.5 * i})` },
  { id: 'blur', name: 'Blur', css: (i) => `blur(${4 * i}px)` },
  { id: 'sharpen', name: 'Sharpen', css: () => `url(#sharpen)` },
  { id: 'glow', name: 'Glow', css: (i) => `brightness(${1 + 0.2 * i}) saturate(${1.3 * i})` },
  { id: 'vignette', name: 'Vignette', css: () => `` },
  { id: 'bw', name: 'Black & White', css: (i) => `grayscale(${i})` },
  { id: 'invert', name: 'Invert', css: (i) => `invert(${i})` },
];

export interface LutPreset {
  id: string;
  name: string;
  // Tone curve applied via color adjustments.
  adjustments: ColorAdjust;
}

export const LUTS: LutPreset[] = [
  { id: 'teal-orange', name: 'Teal & Orange', adjustments: { brightness: 0.05, contrast: 0.1, saturation: 0.15, temperature: 0.1, tint: -0.05, hue: 0 } },
  { id: 'cool', name: 'Cool Blue', adjustments: { brightness: 0, contrast: 0.05, saturation: 0, temperature: -0.2, tint: 0.05, hue: 0 } },
  { id: 'warm', name: 'Warm Sunset', adjustments: { brightness: 0.05, contrast: 0.05, saturation: 0.1, temperature: 0.2, tint: 0.05, hue: 0 } },
  { id: 'noir', name: 'Noir', adjustments: { brightness: -0.05, contrast: 0.3, saturation: -0.7, temperature: 0, tint: 0, hue: 0 } },
  { id: 'pastel', name: 'Pastel', adjustments: { brightness: 0.1, contrast: -0.1, saturation: -0.2, temperature: 0, tint: 0.05, hue: 0 } },
];

/** Build a CSS `filter` string from a clip's effects for the canvas element. */
export function cssFilterString(effects: ClipEffects): string {
  const c = effects.color;
  const parts: string[] = [];
  parts.push(`brightness(${1 + c.brightness})`);
  parts.push(`contrast(${1 + c.contrast})`);
  parts.push(`saturate(${1 + c.saturation})`);
  if (c.hue) parts.push(`hue-rotate(${c.hue}deg)`);
  if (effects.blur > 0) parts.push(`blur(${effects.blur}px)`);
  if (effects.sharpen > 0) parts.push(`url(#sharpen-${Math.round(effects.sharpen * 100)})`);
  for (const f of effects.filters) {
    const preset = FILTER_PRESETS.find((p) => p.id === f.id);
    if (preset) parts.push(preset.css(f.intensity));
  }
  return parts.join(' ');
}

/** Build a canvas filter string (slightly different from CSS — used by ctx.filter). */
export function canvasFilterString(effects: ClipEffects): string {
  const c = effects.color;
  const parts: string[] = [];
  parts.push(`brightness(${1 + c.brightness})`);
  parts.push(`contrast(${1 + c.contrast})`);
  parts.push(`saturate(${1 + c.saturation})`);
  if (c.hue) parts.push(`hue-rotate(${c.hue}deg)`);
  if (effects.blur > 0) parts.push(`blur(${effects.blur}px)`);
  return parts.join(' ');
}

/** Apply vignette overlay (must be drawn separately since CSS filter doesn't support it). */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
) {
  if (amount <= 0) return;
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${amount * 0.8})`);
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/** Apply film grain noise. */
export function drawFilmGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
  time: number
) {
  if (amount <= 0) return;
  const id = ctx.getImageData(0, 0, width, height);
  const data = id.data;
  const seed = Math.floor(time * 24) % 9973;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.sin(i * seed * 0.001) * 0.5 + 0.5) * amount * 60 - amount * 30;
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(id, 0, 0);
}

export function withEffect(effects: ClipEffects, overrides: Partial<ClipEffects>): ClipEffects {
  return { ...effects, ...overrides, color: { ...effects.color, ...overrides.color } };
}

export function applyLut(clip: Clip, lutId: string): Clip {
  const lut = LUTS.find((l) => l.id === lutId);
  if (!lut) return clip;
  return { ...clip, effects: { ...clip.effects, color: { ...lut.adjustments } } };
}
