// Text/titles: default styles, animation presets, and per-frame evaluation.

import type { TextAnimation, TextOverlay, TextStyle } from './types';
import { uid } from './types';

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 64,
  fontWeight: 700,
  color: '#ffffff',
  align: 'center',
  background: null,
  stroke: '#000000',
  strokeWidth: 0,
  shadow: true,
};

export const TEXT_ANIMATIONS: { id: TextAnimation; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade' },
  { id: 'slide', label: 'Slide In' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'scale', label: 'Scale In' },
];

export const FONT_FAMILIES = [
  'Inter, sans-serif',
  'Arial, sans-serif',
  'Georgia, serif',
  "'Courier New', monospace",
  'Impact, sans-serif',
  "'Times New Roman', serif",
];

export function makeTextOverlay(text: string): TextOverlay {
  return {
    id: uid('text'),
    text,
    style: { ...DEFAULT_TEXT_STYLE },
    x: 0.5,
    y: 0.5,
    animation: 'fade',
    animationDuration: 0.6,
  };
}

/** Evaluate text animation state (0 = not visible, 1 = fully visible, plus reveal fraction for typewriter). */
export function textAnimationState(
  text: string,
  time: number,
  start: number,
  duration: number,
  anim: TextAnimation,
  animDuration: number
): { opacity: number; offsetX: number; offsetY: number; scale: number; charsRevealed: number } {
  const rel = Math.max(0, time - start);
  const end = start + duration;
  const tail = Math.max(0, end - time);
  const intro = Math.min(1, rel / Math.max(1e-3, animDuration));
  const outro = Math.min(1, tail / Math.max(1e-3, animDuration));
  const fade = Math.min(intro, outro);
  switch (anim) {
    case 'fade':
      return { opacity: fade, offsetX: 0, offsetY: 0, scale: 1, charsRevealed: textChars(text) };
    case 'slide':
      return { opacity: fade, offsetX: (1 - intro) * -40, offsetY: 0, scale: 1, charsRevealed: textChars(text) };
    case 'bounce':
      return {
        opacity: intro,
        offsetX: 0,
        offsetY: Math.sin(intro * Math.PI) * -20,
        scale: 1,
        charsRevealed: textChars(text),
      };
    case 'scale':
      return { opacity: intro, offsetX: 0, offsetY: 0, scale: 0.6 + intro * 0.4, charsRevealed: textChars(text) };
    case 'typewriter': {
      const chars = textChars(text);
      const revealed = Math.floor(intro * chars);
      return { opacity: 1, offsetX: 0, offsetY: 0, scale: 1, charsRevealed: revealed };
    }
    default:
      return { opacity: 1, offsetX: 0, offsetY: 0, scale: 1, charsRevealed: textChars(text) };
  }
}

function textChars(text: string): number {
  return Array.from(text).length;
}

/** Render a text overlay to a canvas 2D context. */
export function renderText(
  ctx: CanvasRenderingContext2D,
  overlay: TextOverlay,
  state: ReturnType<typeof textAnimationState>,
  width: number,
  height: number
) {
  const txt = overlay.text;
  const revealed = state.charsRevealed;
  const shown = overlay.animation === 'typewriter' ? Array.from(txt).slice(0, revealed).join('') : txt;
  if (!shown) return;
  const x = overlay.x * width;
  const y = overlay.y * height;
  ctx.save();
  ctx.globalAlpha *= state.opacity;
  ctx.translate(x + state.offsetX, y + state.offsetY);
  ctx.scale(state.scale, state.scale);
  const { style } = overlay;
  ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
  ctx.textAlign = style.align;
  ctx.textBaseline = 'middle';
  if (style.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = style.fontSize * 0.08;
    ctx.shadowOffsetY = style.fontSize * 0.03;
  }
  if (style.background) {
    const metrics = ctx.measureText(shown);
    const w = metrics.width;
    const h = style.fontSize * 1.2;
    const pad = 8;
    const bx = (style.align === 'center' ? -w / 2 : style.align === 'right' ? -w : 0) - pad;
    ctx.fillStyle = style.background;
    ctx.fillRect(bx, -h / 2 - pad, w + pad * 2, h + pad * 2);
  }
  if (style.stroke && style.strokeWidth > 0) {
    ctx.lineWidth = style.strokeWidth;
    ctx.strokeStyle = style.stroke;
    ctx.strokeText(shown, 0, 0);
  }
  ctx.fillStyle = style.color;
  ctx.fillText(shown, 0, 0);
  ctx.restore();
}
