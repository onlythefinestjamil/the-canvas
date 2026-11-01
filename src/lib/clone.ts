// Clone stamp & healing brush tools.
import type { ImageLayer } from './layers';
import { getLayerCtx } from './drawing';

export interface CloneSource {
  x: number;
  y: number;
}

/** Copy a circular region from the source point and paint it at the target. */
export function cloneStamp(
  layer: ImageLayer,
  from: { x: number; y: number },
  to: { x: number; y: number },
  source: CloneSource,
  size: number,
  opacity = 100,
): void {
  const ctx = getLayerCtx(layer);
  const r = size / 2;
  const sx = Math.floor(source.x + (to.x - from.x));
  const sy = Math.floor(source.y + (to.y - from.y));
  ctx.save();
  ctx.globalAlpha = opacity / 100;
  // draw a circular slice from the same canvas
  ctx.beginPath();
  ctx.arc(to.x, to.y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    layer.canvas,
    sx - r,
    sy - r,
    size,
    size,
    to.x - r,
    to.y - r,
    size,
    size,
  );
  ctx.restore();
}

/** Healing brush: clone + average with surrounding pixels for a smooth blend. */
export function healBrush(
  layer: ImageLayer,
  from: { x: number; y: number },
  to: { x: number; y: number },
  source: CloneSource,
  size: number,
): void {
  const ctx = getLayerCtx(layer);
  const r = Math.floor(size / 2);
  const sx = Math.floor(source.x + (to.x - from.x));
  const sy = Math.floor(source.y + (to.y - from.y));
  // sample a region, blur it lightly, paint at target
  const region = ctx.getImageData(sx - r, sy - r, size, size);
  const d = region.data;
  // light box blur on the sampled region
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) {
        const sum =
          d[i + c] +
          d[i - 4 + c] +
          d[i + 4 + c] +
          d[i - size * 4 + c] +
          d[i + size * 4 + c];
        d[i + c] = sum / 5;
      }
    }
  }
  // apply with feathered alpha via a temp canvas
  const tmp = document.createElement('canvas');
  tmp.width = size;
  tmp.height = size;
  tmp.getContext('2d')!.putImageData(region, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(to.x, to.y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(tmp, to.x - r, to.y - r);
  ctx.restore();
}
