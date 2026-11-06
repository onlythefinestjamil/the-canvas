// Export options: PNG, JPG, WebP, SVG, quality, copy to clipboard, individual layers.
import type { Layer } from './layers';
import { composite } from './layers';
import { shapeSvg } from './shapes';
import type { ShapeLayer } from './layers';

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'svg';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number; // 0-100 for jpg/webp
  scale?: number; // resolution multiplier
}

export function exportComposite(
  layers: Layer[],
  width: number,
  height: number,
  opts: ExportOptions,
): { blob: Blob; dataUrl: string; ext: string } {
  const scale = opts.scale ?? 1;
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const c = composite(layers, width, height, scale);
  const ext = opts.format === 'jpg' ? 'jpg' : opts.format;
  if (ext === 'png') {
    const dataUrl = c.toDataURL('image/png');
    return { blob: dataUrlToBlob(dataUrl), dataUrl, ext: 'png' };
  }
  if (ext === 'jpg') {
    const dataUrl = c.toDataURL('image/jpeg', (opts.quality ?? 90) / 100);
    return { blob: dataUrlToBlob(dataUrl), dataUrl, ext: 'jpg' };
  }
  if (ext === 'webp') {
    const dataUrl = c.toDataURL('image/webp', (opts.quality ?? 90) / 100);
    return { blob: dataUrlToBlob(dataUrl), dataUrl, ext: 'webp' };
  }
  // svg
  const svg = exportSvg(layers, w, h);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return { blob, dataUrl: `data:image/svg+xml;base64,${btoa(svg)}`, ext: 'svg' };
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export function exportSvg(layers: Layer[], width: number, height: number): string {
  let body = '';
  for (const l of layers) {
    if (!l.visible) continue;
    if (l.type === 'shape') {
      body += shapeSvg(l as ShapeLayer);
    } else if (l.type === 'image' || l.type === 'background') {
      const img = l as any;
      const dataUrl = img.canvas.toDataURL('image/png');
      body += `<image x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" href="${dataUrl}" opacity="${l.opacity / 100}"/>`;
    } else if (l.type === 'text') {
      body += `<text x="${l.x}" y="${l.y + (l as any).fontSize}" fill="${(l as any).color}" font-size="${(l as any).fontSize}" font-weight="${(l as any).fontWeight}">${escapeXml((l as any).text)}</text>`;
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));
}

export async function copyToClipboard(blob: Blob): Promise<void> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard API not available.');
  }
  await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
}

export function downloadBlob(blob: Blob, filename: string): void {
  if (window.canvasAPI?.saveBuffer) {
    blob.arrayBuffer().then((buf) => {
      window.canvasAPI!.saveBuffer({ defaultName: filename, buffer: buf, extension: filename.split('.').pop() || 'png' });
    });
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function exportLayer(layer: Layer, width: number, height: number, opts: ExportOptions): { blob: Blob; dataUrl: string; ext: string } {
  return exportComposite([layer], width, height, opts);
}
