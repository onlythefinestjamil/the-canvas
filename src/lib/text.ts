// Text rendering & measurement for text layers.
import type { TextLayer } from './layers';

export function measureText(layer: TextLayer): { width: number; height: number } {
  const ctx = measureCanvas().getContext('2d')!;
  ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
  const m = ctx.measureText(layer.text || ' ');
  return { width: Math.ceil(m.width), height: Math.ceil(layer.fontSize * 1.4) };
}

let _measureCanvas: HTMLCanvasElement | null = null;
function measureCanvas(): HTMLCanvasElement {
  if (!_measureCanvas) _measureCanvas = document.createElement('canvas');
  return _measureCanvas;
}

export function fitTextLayer(layer: TextLayer): void {
  const { width, height } = measureText(layer);
  layer.width = Math.max(width, 20);
  layer.height = Math.max(height, 20);
}
