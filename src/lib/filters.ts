// Filters: blur, sharpen, noise, pixelate, vignette, glitch, glow, etc.
import { hexToRgba } from './drawing';

export type FilterType =
  | 'gaussian-blur' | 'motion-blur' | 'radial-blur' | 'sharpen'
  | 'noise' | 'pixelate' | 'vignette' | 'glitch' | 'glow'
  | 'grayscale' | 'sepia' | 'vintage';

export interface FilterParams {
  amount?: number;
  radius?: number;
}

function clamp(v: number, lo = 0, hi = 255): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Box blur (approximation of Gaussian). */
function boxBlur(img: ImageData, radius: number): void {
  if (radius <= 0) return;
  const { width: w, height: h, data } = img;
  const tmp = new Uint8ClampedArray(data);
  const r = Math.floor(radius);
  // horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sr = 0, sg = 0, sb = 0, sa = 0, count = 0;
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= w) continue;
        const i = (y * w + nx) * 4;
        sr += tmp[i]; sg += tmp[i + 1]; sb += tmp[i + 2]; sa += tmp[i + 3];
        count++;
      }
      const i = (y * w + x) * 4;
      data[i] = sr / count;
      data[i + 1] = sg / count;
      data[i + 2] = sb / count;
      data[i + 3] = sa / count;
    }
  }
  // vertical pass
  tmp.set(data);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let sr = 0, sg = 0, sb = 0, sa = 0, count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        const i = (ny * w + x) * 4;
        sr += tmp[i]; sg += tmp[i + 1]; sb += tmp[i + 2]; sa += tmp[i + 3];
        count++;
      }
      const i = (y * w + x) * 4;
      data[i] = sr / count;
      data[i + 1] = sg / count;
      data[i + 2] = sb / count;
      data[i + 3] = sa / count;
    }
  }
}

function sharpen(img: ImageData, amount: number): void {
  const { width: w, height: h, data } = img;
  const src = new Uint8ClampedArray(data);
  const a = amount;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const i = (y * w + x) * 4 + c;
        const center = src[i];
        const top = src[((y - 1) * w + x) * 4 + c];
        const bottom = src[((y + 1) * w + x) * 4 + c];
        const left = src[(y * w + (x - 1)) * 4 + c];
        const right = src[(y * w + (x + 1)) * 4 + c];
        data[i] = clamp(center + a * (4 * center - top - bottom - left - right));
      }
    }
  }
}

function addNoise(img: ImageData, amount: number): void {
  const { data } = img;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * amount * 2;
    data[i] = clamp(data[i] + n);
    data[i + 1] = clamp(data[i + 1] + n);
    data[i + 2] = clamp(data[i + 2] + n);
  }
}

function pixelate(img: ImageData, size: number): void {
  if (size <= 1) return;
  const { width: w, height: h, data } = img;
  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let dy = 0; dy < size && y + dy < h; dy++) {
        for (let dx = 0; dx < size && x + dx < w; dx++) {
          const i = ((y + dy) * w + (x + dx)) * 4;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; a += data[i + 3];
          count++;
        }
      }
      r /= count; g /= count; b /= count; a /= count;
      for (let dy = 0; dy < size && y + dy < h; dy++) {
        for (let dx = 0; dx < size && x + dx < w; dx++) {
          const i = ((y + dy) * w + (x + dx)) * 4;
          data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
        }
      }
    }
  }
}

function vignette(img: ImageData, amount: number): void {
  const { width: w, height: h, data } = img;
  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.hypot(cx, cy);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dist = Math.hypot(x - cx, y - cy) / maxDist;
      const factor = 1 - (dist * dist) * (amount / 100);
      const i = (y * w + x) * 4;
      data[i] = clamp(data[i] * factor);
      data[i + 1] = clamp(data[i + 1] * factor);
      data[i + 2] = clamp(data[i + 2] * factor);
    }
  }
}

function glitch(img: ImageData, amount: number): void {
  const { width: w, height: h, data } = img;
  const shift = Math.max(1, Math.floor((amount / 100) * 20));
  const src = new Uint8ClampedArray(data);
  for (let y = 0; y < h; y++) {
    const offset = Math.floor(Math.sin(y * 0.1) * shift);
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const sx = (x + offset + w) % w;
      const si = (y * w + sx) * 4;
      // shift red channel
      data[i] = src[si];
      data[i + 1] = src[i + 1];
      data[i + 2] = src[i + 2];
      data[i + 3] = src[i + 3];
    }
  }
  // scan lines
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      data[i] = clamp(data[i] * 0.7);
      data[i + 1] = clamp(data[i + 1] * 0.7);
      data[i + 2] = clamp(data[i + 2] * 0.7);
    }
  }
}

function glow(img: ImageData, amount: number): void {
  const { width: w, height: h, data } = img;
  const blurred = new ImageData(w, h);
  blurred.data.set(data);
  boxBlur(blurred, 8);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + blurred.data[i] * (amount / 100));
    data[i + 1] = clamp(data[i + 1] + blurred.data[i + 1] * (amount / 100));
    data[i + 2] = clamp(data[i + 2] + blurred.data[i + 2] * (amount / 100));
  }
}

function vintage(img: ImageData, _amount: number): void {
  const { width: w, height: h, data } = img;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = clamp(r * 0.9 + 30);
      data[i + 1] = clamp(g * 0.85 + 20);
      data[i + 2] = clamp(b * 0.7 + 10);
    }
  }
}

function grayscale(img: ImageData, amount: number): void {
  const a = amount / 100;
  const { data } = img;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i] * (1 - a) + lum * a;
    data[i + 1] = data[i + 1] * (1 - a) + lum * a;
    data[i + 2] = data[i + 2] * (1 - a) + lum * a;
  }
}

function sepiaFilter(img: ImageData, amount: number): void {
  const a = amount / 100;
  const { data } = img;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const sr = 0.393 * r + 0.769 * g + 0.189 * b;
    const sg = 0.349 * r + 0.686 * g + 0.168 * b;
    const sb = 0.272 * r + 0.534 * g + 0.131 * b;
    data[i] = r * (1 - a) + sr * a;
    data[i + 1] = g * (1 - a) + sg * a;
    data[i + 2] = b * (1 - a) + sb * a;
  }
}

function motionBlur(img: ImageData, radius: number): void {
  const { width: w, height: h, data } = img;
  const src = new Uint8ClampedArray(data);
  const r = Math.floor(radius);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sr = 0, sg = 0, sb = 0, sa = 0, count = 0;
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= w) continue;
        const i = (y * w + nx) * 4;
        sr += src[i]; sg += src[i + 1]; sb += src[i + 2]; sa += src[i + 3];
        count++;
      }
      const i = (y * w + x) * 4;
      data[i] = sr / count;
      data[i + 1] = sg / count;
      data[i + 2] = sb / count;
      data[i + 3] = sa / count;
    }
  }
}

/** Apply a filter to an ImageData in place. */
export function applyFilter(
  img: ImageData,
  filter: FilterType,
  params: FilterParams = {},
): void {
  const amount = params.amount ?? 50;
  const radius = params.radius ?? 3;
  switch (filter) {
    case 'gaussian-blur': boxBlur(img, radius); break;
    case 'motion-blur': motionBlur(img, radius); break;
    case 'radial-blur': boxBlur(img, radius * 2); break;
    case 'sharpen': sharpen(img, amount / 100); break;
    case 'noise': addNoise(img, amount / 2); break;
    case 'pixelate': pixelate(img, Math.max(2, Math.floor(amount / 5))); break;
    case 'vignette': vignette(img, amount); break;
    case 'glitch': glitch(img, amount); break;
    case 'glow': glow(img, amount); break;
    case 'grayscale': grayscale(img, amount); break;
    case 'sepia': sepiaFilter(img, amount); break;
    case 'vintage': vintage(img, amount); break;
  }
}

/** Apply a filter to a canvas, returning a new canvas with the result. */
export function applyFilterToCanvas(
  canvas: HTMLCanvasElement,
  filter: FilterType,
  params: FilterParams = {},
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyFilter(img, filter, params);
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// re-export hexToRgba to keep tree-shaking happy
export { hexToRgba };
