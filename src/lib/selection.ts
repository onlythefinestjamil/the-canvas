// Selection tools: rectangular, lasso, magic wand.
import { hexToRgba } from './drawing';

export type SelectionMode = 'rect' | 'lasso' | 'wand';

export interface Selection {
  mode: SelectionMode;
  // For rect: x,y,w,h. For lasso/wand: pixel mask via Uint8Array.
  x: number;
  y: number;
  width: number;
  height: number;
  mask?: Uint8Array; // 1 = selected, 0 = not, size = width*height
}

export function emptySelection(): Selection | null {
  return null;
}

export function rectSelection(x: number, y: number, w: number, h: number): Selection {
  return { mode: 'rect', x, y, width: w, height: h, mask: undefined };
}

export function lassoSelection(points: { x: number; y: number }[], canvasW: number, canvasH: number): Selection {
  // build a bounding box + mask
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  minX = Math.max(0, Math.floor(minX));
  minY = Math.max(0, Math.floor(minY));
  maxX = Math.min(canvasW, Math.ceil(maxX));
  maxY = Math.min(canvasH, Math.ceil(maxY));
  const w = maxX - minX;
  const h = maxY - minY;
  if (w <= 0 || h <= 0) return { mode: 'lasso', x: 0, y: 0, width: 0, height: 0, mask: new Uint8Array(0) };
  const mask = new Uint8Array(w * h);
  // point-in-polygon test for each pixel in bounding box
  const pts = points;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = minX + x;
      const py = minY + y;
      if (pointInPolygon(px, py, pts)) mask[y * w + x] = 1;
    }
  }
  return { mode: 'lasso', x: minX, y: minY, width: w, height: h, mask };
}

function pointInPolygon(px: number, py: number, pts: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Magic wand: select all pixels within tolerance of the clicked pixel. */
export function magicWand(
  canvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  tolerance = 32,
): Selection | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const { width: w, height: h } = canvas;
  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return null;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const startIdx = (sy * w + sx) * 4;
  const target = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];
  const selected = new Uint8Array(w * h);
  const stack: number[] = [sx, sy];
  let minX = sx, minY = sy, maxX = sx, maxY = sy;
  while (stack.length) {
    const py = stack.pop()!;
    const px = stack.pop()!;
    if (px < 0 || py < 0 || px >= w || py >= h) continue;
    const linear = py * w + px;
    if (selected[linear]) continue;
    const idx = linear * 4;
    if (
      Math.abs(data[idx] - target[0]) > tolerance ||
      Math.abs(data[idx + 1] - target[1]) > tolerance ||
      Math.abs(data[idx + 2] - target[2]) > tolerance ||
      Math.abs(data[idx + 3] - target[3]) > tolerance
    ) {
      continue;
    }
    selected[linear] = 1;
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
    stack.push(px + 1, py, px - 1, py, px, py + 1, px, py - 1);
  }
  const sw = maxX - minX + 1;
  const sh = maxY - minY + 1;
  if (sw <= 0 || sh <= 0) return null;
  // crop mask to bounding box
  const mask = new Uint8Array(sw * sh);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      mask[y * sw + x] = selected[(y + minY) * w + (x + minX)] ?? 0;
    }
  }
  return { mode: 'wand', x: minX, y: minY, width: sw, height: sh, mask };
}

export function invertSelection(sel: Selection, canvasW: number, canvasH: number): Selection {
  const mask = new Uint8Array(canvasW * canvasH);
  if (sel.mode === 'rect') {
    for (let y = 0; y < canvasH; y++) {
      for (let x = 0; x < canvasW; x++) {
        mask[y * canvasW + x] =
          x >= sel.x && x < sel.x + sel.width && y >= sel.y && y < sel.y + sel.height ? 0 : 1;
      }
    }
  } else if (sel.mask) {
    for (let y = 0; y < canvasH; y++) {
      for (let x = 0; x < canvasW; x++) {
        let val = 1;
        if (
          x >= sel.x &&
          x < sel.x + sel.width &&
          y >= sel.y &&
          y < sel.y + sel.height
        ) {
          const mx = x - sel.x;
          const my = y - sel.y;
          if (sel.mask[my * sel.width + mx]) val = 0;
        }
        mask[y * canvasW + x] = val;
      }
    }
  }
  return { mode: 'wand', x: 0, y: 0, width: canvasW, height: canvasH, mask };
}

export function selectAll(canvasW: number, canvasH: number): Selection {
  return { mode: 'rect', x: 0, y: 0, width: canvasW, height: canvasH };
}

// re-export to avoid unused import
export { hexToRgba };
