// Drawing tools: brush, pencil, eraser, fill (bucket), eyedropper.
import type { ImageLayer } from './layers';

export interface BrushSettings {
  size: number;
  hardness: number; // 0-100
  opacity: number; // 0-100
  color: string;
}

export function getLayerCtx(layer: ImageLayer): CanvasRenderingContext2D {
  return layer.canvas.getContext('2d', { willReadFrequently: true })!;
}

/** Paint a brush dab with soft-edge falloff based on hardness. */
export function brushDab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  settings: BrushSettings,
): void {
  const r = settings.size / 2;
  const hardness = settings.hardness / 100;
  const opacity = settings.opacity / 100;
  if (hardness >= 0.99) {
    // hard edge — solid circle
    ctx.globalAlpha = opacity;
    ctx.fillStyle = settings.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }
  // soft edge — radial gradient
  const grad = ctx.createRadialGradient(x, y, r * hardness, x, y, r);
  grad.addColorStop(0, settings.color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = opacity;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Stroke a line of brush dabs interpolating between two points. */
export function brushStroke(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  settings: BrushSettings,
  spacing = 0.15,
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  const step = Math.max(1, settings.size * spacing);
  const n = Math.max(1, Math.ceil(dist / step));
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n;
    brushDab(ctx, from.x + dx * t, from.y + dy * t, settings);
  }
}

/** Pencil: hard 1px-ish dots in a line. */
export function pencilStroke(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  settings: BrushSettings,
): void {
  ctx.save();
  ctx.globalAlpha = settings.opacity / 100;
  ctx.strokeStyle = settings.color;
  ctx.lineWidth = Math.max(1, settings.size);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

/** Eraser: paint with destination-out so it erases pixels. */
export function eraserDab(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  settings: BrushSettings,
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = settings.opacity / 100;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = settings.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

/** Flood-fill (bucket) from a seed point using a tolerance. */
export function floodFill(
  layer: ImageLayer,
  startX: number,
  startY: number,
  fillColor: string,
  tolerance = 32,
): void {
  const ctx = getLayerCtx(layer);
  const { width, height } = layer.canvas;
  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;
  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return;

  const startIdx = (sy * width + sx) * 4;
  const target = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];
  const fill = hexToRgba(fillColor);

  // don't fill if already the same color
  if (
    Math.abs(target[0] - fill[0]) <= 2 &&
    Math.abs(target[1] - fill[1]) <= 2 &&
    Math.abs(target[2] - fill[2]) <= 2
  ) {
    return;
  }

  const stack: number[] = [sx, sy];
  const visited = new Uint8Array(width * height);

  while (stack.length) {
    const py = stack.pop()!;
    const px = stack.pop()!;
    if (px < 0 || py < 0 || px >= width || py >= height) continue;
    const linear = py * width + px;
    if (visited[linear]) continue;
    const idx = linear * 4;
    if (
      Math.abs(data[idx] - target[0]) > tolerance ||
      Math.abs(data[idx + 1] - target[1]) > tolerance ||
      Math.abs(data[idx + 2] - target[2]) > tolerance ||
      Math.abs(data[idx + 3] - target[3]) > tolerance
    ) {
      continue;
    }
    visited[linear] = 1;
    data[idx] = fill[0];
    data[idx + 1] = fill[1];
    data[idx + 2] = fill[2];
    data[idx + 3] = fill[3];
    stack.push(px + 1, py, px - 1, py, px, py + 1, px, py - 1);
  }
  ctx.putImageData(img, 0, 0);
}

/** Eyedropper: sample the color at a point in a composited image. */
export function eyedropper(
  source: HTMLCanvasElement,
  x: number,
  y: number,
): string {
  const ctx = source.getContext('2d', { willReadFrequently: true })!;
  const px = Math.floor(x);
  const py = Math.floor(y);
  if (px < 0 || py < 0 || px >= source.width || py >= source.height) return '#000000';
  const d = ctx.getImageData(px, py, 1, 1).data;
  return rgbaToHex(d[0], d[1], d[2], d[3]);
}

// ---- helpers ----
export function hexToRgba(hex: string): [number, number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 6) h = h + 'ff';
  const n = parseInt(h.slice(0, 8), 16);
  return [(n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbaToHex(r: number, g: number, b: number, a = 255): string {
  const to = (v: number) => v.toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}${a < 255 ? to(a) : ''}`;
}
