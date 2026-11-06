// Transform operations: move, scale, rotate, flip, crop.
import type { Layer, ImageLayer } from './layers';

export function flipHorizontal(layer: Layer): void {
  if (layer.type === 'image' || layer.type === 'background') {
    const img = layer as ImageLayer;
    const ctx = img.canvas.getContext('2d')!;
    const tmp = document.createElement('canvas');
    tmp.width = img.canvas.width;
    tmp.height = img.canvas.height;
    const tctx = tmp.getContext('2d')!;
    tctx.translate(tmp.width, 0);
    tctx.scale(-1, 1);
    tctx.drawImage(img.canvas, 0, 0);
    ctx.clearRect(0, 0, img.canvas.width, img.canvas.height);
    ctx.drawImage(tmp, 0, 0);
  } else {
    layer.x += layer.width;
    // mirror offset for non-image layers
  }
}

export function flipVertical(layer: Layer): void {
  if (layer.type === 'image' || layer.type === 'background') {
    const img = layer as ImageLayer;
    const ctx = img.canvas.getContext('2d')!;
    const tmp = document.createElement('canvas');
    tmp.width = img.canvas.width;
    tmp.height = img.canvas.height;
    const tctx = tmp.getContext('2d')!;
    tctx.translate(0, tmp.height);
    tctx.scale(1, -1);
    tctx.drawImage(img.canvas, 0, 0);
    ctx.clearRect(0, 0, img.canvas.width, img.canvas.height);
    ctx.drawImage(tmp, 0, 0);
  }
}

export function rotateLayer(layer: Layer, degrees: number): void {
  if (layer.type === 'image' || layer.type === 'background') {
    const img = layer as ImageLayer;
    const ctx = img.canvas.getContext('2d')!;
    const tmp = document.createElement('canvas');
    tmp.width = img.canvas.width;
    tmp.height = img.canvas.height;
    const tctx = tmp.getContext('2d')!;
    tctx.translate(tmp.width / 2, tmp.height / 2);
    tctx.rotate((degrees * Math.PI) / 180);
    tctx.translate(-tmp.width / 2, -tmp.height / 2);
    tctx.drawImage(img.canvas, 0, 0);
    ctx.clearRect(0, 0, img.canvas.width, img.canvas.height);
    ctx.drawImage(tmp, 0, 0);
  } else {
    layer.rotation = (layer.rotation + degrees) % 360;
  }
}

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Crop all image layers to a region, shifting their x/y offsets. */
export function applyCrop(
  layers: Layer[],
  canvasWidth: number,
  canvasHeight: number,
  region: CropRegion,
): { layers: Layer[]; width: number; height: number } {
  const rx = Math.max(0, Math.round(region.x));
  const ry = Math.max(0, Math.round(region.y));
  const rw = Math.min(canvasWidth - rx, Math.round(region.width));
  const rh = Math.min(canvasHeight - ry, Math.round(region.height));
  if (rw <= 0 || rh <= 0) return { layers, width: canvasWidth, height: canvasHeight };

  const newLayers: Layer[] = layers.map((layer) => {
    if (layer.type === 'image' || layer.type === 'background') {
      const img = layer as ImageLayer;
      const ctx = img.canvas.getContext('2d', { willReadFrequently: true })!;
      const sx = rx - layer.x;
      const sy = ry - layer.y;
      const out = document.createElement('canvas');
      out.width = rw;
      out.height = rh;
      const octx = out.getContext('2d')!;
      // draw the portion of the layer canvas that falls in the crop region
      octx.drawImage(
        img.canvas,
        sx,
        sy,
        rw,
        rh,
        0,
        0,
        rw,
        rh,
      );
      return {
        ...img,
        canvas: out,
        x: 0,
        y: 0,
        width: rw,
        height: rh,
      } as ImageLayer;
    }
    return {
      ...layer,
      x: layer.x - rx,
      y: layer.y - ry,
    } as Layer;
  });

  return { layers: newLayers, width: rw, height: rh };
}

export function duplicateLayer(layer: Layer): Layer {
  if (layer.type === 'image' || layer.type === 'background') {
    const img = layer as ImageLayer;
    const copy = document.createElement('canvas');
    copy.width = img.canvas.width;
    copy.height = img.canvas.height;
    copy.getContext('2d')!.drawImage(img.canvas, 0, 0);
    return {
      ...img,
      id: `${img.id}_copy_${Math.random().toString(36).slice(2, 7)}`,
      name: `${img.name} copy`,
      x: img.x + 10,
      y: img.y + 10,
      canvas: copy,
    } as ImageLayer;
  }
  return {
    ...layer,
    id: `${layer.id}_copy_${Math.random().toString(36).slice(2, 7)}`,
    name: `${layer.name} copy`,
    x: layer.x + 10,
    y: layer.y + 10,
  } as Layer;
}
