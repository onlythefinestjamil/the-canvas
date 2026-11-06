// Shape drawing helpers for the shape tool.
import type { ShapeLayer, ShapeKind } from './layers';

export function shapeKindFromTool(tool: string): ShapeKind | null {
  if (tool === 'rectangle' || tool === 'ellipse' || tool === 'line' || tool === 'arrow') {
    return tool as ShapeKind;
  }
  return null;
}

/** Update a shape layer's geometry from a drag rectangle. */
export function updateShapeFromDrag(
  layer: ShapeLayer,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): void {
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const w = Math.abs(endX - startX);
  const h = Math.abs(endY - startY);
  layer.x = x;
  layer.y = y;
  layer.width = Math.max(1, w);
  layer.height = layer.shape === 'line' || layer.shape === 'arrow' ? Math.max(2, h) : Math.max(1, h);
}

export function shapeSvg(layer: ShapeLayer): string {
  const { x, y, width: w, height: h, fill, stroke, strokeWidth, shape } = layer;
  if (shape === 'rectangle') {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
  }
  if (shape === 'ellipse') {
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
  }
  if (shape === 'line') {
    return `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
  }
  if (shape === 'arrow') {
    return `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
  }
  return '';
}
