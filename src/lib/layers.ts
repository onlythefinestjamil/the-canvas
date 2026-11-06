// Core layer types and compositing for the Photoshop-like editor.

export type BlendMode =
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light'
  | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference'
  | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

export const BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
  'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion',
  'hue', 'saturation', 'color', 'luminosity',
];

export type LayerType = 'image' | 'text' | 'shape' | 'adjustment' | 'background' | 'group';

export type ShapeKind = 'rectangle' | 'ellipse' | 'line' | 'arrow';

export type AdjustmentType =
  | 'brightness-contrast' | 'hue-saturation' | 'color-balance' | 'levels'
  | 'curves' | 'invert' | 'sepia' | 'grayscale' | 'vibrance' | 'temperature';

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number; // 0-100
  blendMode: BlendMode;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
}

export interface ImageLayer extends BaseLayer {
  type: 'image' | 'background';
  canvas: HTMLCanvasElement;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface AdjustmentLayerData extends BaseLayer {
  type: 'adjustment';
  adjustment: AdjustmentType;
  params: Record<string, number>;
}

export type Layer = ImageLayer | TextLayer | ShapeLayer | AdjustmentLayerData;

let _id = 0;
export function uid(prefix = 'L'): string {
  _id += 1;
  return `${prefix}${Date.now().toString(36)}${_id}`;
}

export function createBlankCanvas(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c;
}

export function newImageLayer(width: number, height: number, name = 'Layer'): ImageLayer {
  return {
    id: uid('img'),
    name,
    type: 'image',
    visible: true,
    opacity: 100,
    blendMode: 'normal',
    locked: false,
    x: 0,
    y: 0,
    width,
    height,
    rotation: 0,
    canvas: createBlankCanvas(width, height),
  };
}

export function newBackgroundLayer(width: number, height: number, color = '#ffffff'): ImageLayer {
  const layer = newImageLayer(width, height, 'Background');
  layer.type = 'background';
  const ctx = layer.canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  return layer;
}

export function newTextLayer(width: number, height: number): TextLayer {
  return {
    id: uid('txt'),
    name: 'Text',
    type: 'text',
    visible: true,
    opacity: 100,
    blendMode: 'normal',
    locked: false,
    x: 0,
    y: 0,
    width,
    height,
    rotation: 0,
    text: 'Double-click to edit',
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: 600,
    color: '#ffffff',
    align: 'center',
  };
}

export function newShapeLayer(width: number, height: number, shape: ShapeKind): ShapeLayer {
  return {
    id: uid('shp'),
    name: shape[0].toUpperCase() + shape.slice(1),
    type: 'shape',
    visible: true,
    opacity: 100,
    blendMode: 'normal',
    locked: false,
    x: width / 4,
    y: height / 4,
    width: width / 2,
    height: height / 2,
    rotation: 0,
    shape,
    fill: '#7c5cff',
    stroke: '#ffffff',
    strokeWidth: 2,
  };
}

export function newAdjustmentLayer(
  width: number,
  height: number,
  adjustment: AdjustmentType,
): AdjustmentLayerData {
  const defaults: Record<AdjustmentType, Record<string, number>> = {
    'brightness-contrast': { brightness: 0, contrast: 0 },
    'hue-saturation': { hue: 0, saturation: 0, lightness: 0 },
    'color-balance': { red: 0, green: 0, blue: 0 },
    levels: { inBlack: 0, inWhite: 255, gamma: 1 },
    curves: { black: 0, white: 255, mid: 128 },
    invert: {},
    sepia: { amount: 100 },
    grayscale: { amount: 100 },
    vibrance: { amount: 0 },
    temperature: { temperature: 0, tint: 0 },
  };
  return {
    id: uid('adj'),
    name: adjustment,
    type: 'adjustment',
    visible: true,
    opacity: 100,
    blendMode: 'normal',
    locked: false,
    x: 0,
    y: 0,
    width,
    height,
    rotation: 0,
    adjustment,
    params: { ...defaults[adjustment] },
  };
}

// ---- Blend mode mapping to canvas globalCompositeOperation ----
const BLEND_MAP: Record<BlendMode, GlobalCompositeOperation> = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  'soft-light': 'soft-light',
  'hard-light': 'hard-light',
  'color-dodge': 'color-dodge',
  'color-burn': 'color-burn',
  darken: 'darken',
  lighten: 'lighten',
  difference: 'difference',
  exclusion: 'exclusion',
  hue: 'hue',
  saturation: 'saturation',
  color: 'color',
  luminosity: 'luminosity',
};

export function blendOp(mode: BlendMode): GlobalCompositeOperation {
  return BLEND_MAP[mode] ?? 'source-over';
}

// ---- Render a single layer onto a target 2D context ----
export function renderLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  scale = 1,
): void {
  if (!layer.visible || layer.opacity <= 0) return;
  ctx.save();
  ctx.globalAlpha = layer.opacity / 100;
  ctx.globalCompositeOperation = blendOp(layer.blendMode);

  if (layer.type === 'image' || layer.type === 'background') {
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    ctx.translate(cx, cy);
    if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(layer.canvas, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
  } else if (layer.type === 'text') {
    drawTextLayer(ctx, layer);
  } else if (layer.type === 'shape') {
    drawShapeLayer(ctx, layer);
  }
  // adjustment layers are applied non-destructively at composite time;
  // for preview we render them as a subtle overlay tint so they're visible.
  ctx.restore();
}

function drawTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer): void {
  const cx = layer.x + layer.width / 2;
  const cy = layer.y + layer.height / 2;
  ctx.translate(cx, cy);
  if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
  ctx.textAlign = layer.align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = layer.color;
  ctx.fillText(layer.text, 0, 0);
}

function drawShapeLayer(ctx: CanvasRenderingContext2D, layer: ShapeLayer): void {
  const cx = layer.x + layer.width / 2;
  const cy = layer.y + layer.height / 2;
  ctx.translate(cx, cy);
  if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
  const w = layer.width;
  const h = layer.height;
  ctx.fillStyle = layer.fill;
  ctx.strokeStyle = layer.stroke;
  ctx.lineWidth = layer.strokeWidth;
  if (layer.shape === 'rectangle') {
    ctx.fillRect(-w / 2, -h / 2, w, h);
    if (layer.strokeWidth > 0) ctx.strokeRect(-w / 2, -h / 2, w, h);
  } else if (layer.shape === 'ellipse') {
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (layer.strokeWidth > 0) ctx.stroke();
  } else if (layer.shape === 'line') {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.stroke();
  } else if (layer.shape === 'arrow') {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.stroke();
    // arrowhead
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2 - 14, -8);
    ctx.lineTo(w / 2 - 14, 8);
    ctx.closePath();
    ctx.fill();
  }
}

// Composite all layers onto a single canvas, returning it.
export function composite(
  layers: Layer[],
  width: number,
  height: number,
  scale = 1,
): HTMLCanvasElement {
  const out = createBlankCanvas(width, height);
  const ctx = out.getContext('2d')!;
  // render bottom-up (layers[0] is bottom)
  for (const layer of layers) {
    renderLayer(ctx, layer, scale);
  }
  return out;
}
