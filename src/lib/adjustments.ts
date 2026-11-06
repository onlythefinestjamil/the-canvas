// Adjustment layer operations — per-pixel color math on ImageData.
import type { AdjustmentLayerData, AdjustmentType } from './layers';
import type { CropRegion } from './transform';

export interface PixelOp {
  (rgba: [number, number, number, number], y: number, x: number): void;
}

function clamp(v: number, lo = 0, hi = 255): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function applyToImageData(img: ImageData, op: PixelOp): void {
  const d = img.data;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      op([d[i], d[i + 1], d[i + 2], d[i + 3]], y, x);
      d[i] = rgba[0];
      d[i + 1] = rgba[1];
      d[i + 2] = rgba[2];
      d[i + 3] = rgba[3];
    }
  }
}

// need a mutable alias
let rgba: [number, number, number, number] = [0, 0, 0, 0];

function makeOp(adj: AdjustmentType, params: Record<string, number>): PixelOp {
  switch (adj) {
    case 'brightness-contrast': {
      const b = params.brightness ?? 0; // -100..100
      const c = params.contrast ?? 0; // -100..100
      const cf = (259 * (c + 255)) / (255 * (259 - c));
      return (px) => {
        px[0] = clamp(cf * (px[0] - 128) + 128 + b * 1.5);
        px[1] = clamp(cf * (px[1] - 128) + 128 + b * 1.5);
        px[2] = clamp(cf * (px[2] - 128) + 128 + b * 1.5);
      };
    }
    case 'hue-saturation': {
      const hue = (params.hue ?? 0) / 360;
      const sat = (params.saturation ?? 0) / 100;
      const light = (params.lightness ?? 0) / 100;
      return (px) => {
        let [r, g, b] = [px[0] / 255, px[1] / 255, px[2] / 255];
        const [h, s, l] = rgbToHsl(r, g, b);
        let nh = (h + hue) % 1;
        if (nh < 0) nh += 1;
        const ns = clamp(s + sat, 0, 1);
        const nl = clamp(l + light, 0, 1);
        const [nr, ng, nb] = hslToRgb(nh, ns, nl);
        px[0] = nr * 255;
        px[1] = ng * 255;
        px[2] = nb * 255;
      };
    }
    case 'color-balance': {
      const r = params.red ?? 0;
      const g = params.green ?? 0;
      const bl = params.blue ?? 0;
      return (px) => {
        px[0] = clamp(px[0] + r);
        px[1] = clamp(px[1] + g);
        px[2] = clamp(px[2] + bl);
      };
    }
    case 'levels': {
      const inBlack = params.inBlack ?? 0;
      const inWhite = params.inWhite ?? 255;
      const gamma = params.gamma ?? 1;
      const range = Math.max(1, inWhite - inBlack);
      return (px) => {
        for (let c = 0; c < 3; c++) {
          let v = ((px[c] - inBlack) / range) * 255;
          v = clamp(v);
          v = 255 * Math.pow(v / 255, 1 / gamma);
          px[c] = v;
        }
      };
    }
    case 'curves': {
      const black = params.black ?? 0;
      const white = params.white ?? 255;
      const mid = params.mid ?? 128;
      return (px) => {
        for (let c = 0; c < 3; c++) {
          let v = (px[c] - black) * 255 / Math.max(1, white - black);
          // simple S-curve around mid
          v = clamp(v + (v - mid) * 0.3);
          px[c] = v;
        }
      };
    }
    case 'invert':
      return (px) => {
        px[0] = 255 - px[0];
        px[1] = 255 - px[1];
        px[2] = 255 - px[2];
      };
    case 'sepia': {
      const amount = (params.amount ?? 100) / 100;
      return (px) => {
        const r = px[0], g = px[1], b = px[2];
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb2 = 0.272 * r + 0.534 * g + 0.131 * b;
        px[0] = r * (1 - amount) + sr * amount;
        px[1] = g * (1 - amount) + sg * amount;
        px[2] = b * (1 - amount) + sb2 * amount;
      };
    }
    case 'grayscale': {
      const amount = (params.amount ?? 100) / 100;
      return (px) => {
        const lum = 0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2];
        px[0] = px[0] * (1 - amount) + lum * amount;
        px[1] = px[1] * (1 - amount) + lum * amount;
        px[2] = px[2] * (1 - amount) + lum * amount;
      };
    }
    case 'vibrance': {
      const amt = (params.amount ?? 0) / 100;
      return (px) => {
        const max = Math.max(px[0], px[1], px[2]);
        const avg = (px[0] + px[1] + px[2]) / 3;
        const sat = (max - avg) * 2 / 255;
        const factor = 1 + amt * (1 - sat);
        px[0] = clamp(avg + (px[0] - avg) * factor);
        px[1] = clamp(avg + (px[1] - avg) * factor);
        px[2] = clamp(avg + (px[2] - avg) * factor);
      };
    }
    case 'temperature': {
      const temp = params.temperature ?? 0; // -100..100
      const tint = params.tint ?? 0;
      return (px) => {
        px[0] = clamp(px[0] + temp * 0.5);
        px[2] = clamp(px[2] - temp * 0.5);
        px[1] = clamp(px[1] + tint * 0.5);
      };
    }
    default:
      return () => {};
  }
}

/** Apply an adjustment to the pixels of an ImageData copy. */
export function applyAdjustment(
  img: ImageData,
  adjustment: AdjustmentType,
  params: Record<string, number>,
): ImageData {
  const op = makeOp(adjustment, params);
  rgba = [0, 0, 0, 0];
  applyToImageData(img, (px, _y, _x) => {
    rgba = px;
    op(px, _y, _x);
  });
  return img;
}

/** Render an adjustment layer's effect onto a backing canvas region. */
export function renderAdjustmentToCanvas(
  backing: HTMLCanvasElement,
  layer: AdjustmentLayerData,
  region?: CropRegion,
): void {
  const ctx = backing.getContext('2d', { willReadFrequently: true })!;
  const rx = region?.x ?? 0;
  const ry = region?.y ?? 0;
  const rw = region?.width ?? backing.width;
  const rh = region?.height ?? backing.height;
  if (rw <= 0 || rh <= 0) return;
  const img = ctx.getImageData(rx, ry, rw, rh);
  applyAdjustment(img, layer.adjustment, layer.params);
  ctx.putImageData(img, rx, ry);
}

// ---- color conversions ----
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
    h /= 360;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}
