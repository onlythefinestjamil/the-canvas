import type { GenItem } from '../types';

/** Save a generated asset to disk via Electron's save dialog, or browser fallback. */
export async function downloadItem(item: GenItem): Promise<{ canceled: boolean; filePath?: string }> {
  if (!item.resultUrl) throw new Error('Nothing to download yet.');
  const ext = item.category === 'video' ? 'mp4' : 'png';
  const name = `canvas-${item.id}.${ext}`;

  if (window.canvasAPI?.saveBuffer) {
    try {
      const res = await fetch(item.resultUrl);
      const buf = await res.arrayBuffer();
      const result = await window.canvasAPI.saveBuffer({ defaultName: name, buffer: buf, extension: ext });
      return { canceled: result.canceled, filePath: result.filePath };
    } catch (e) {
      // Fall through to browser download.
      console.warn('Electron save failed, falling back to browser download:', e);
    }
  }

  // Browser fallback — open a download anchor.
  const a = document.createElement('a');
  a.href = item.resultUrl;
  a.download = name;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return { canceled: false };
}

/** Copy a generated image to the clipboard (best-effort). */
export async function copyImageToClipboard(item: GenItem): Promise<void> {
  if (item.category !== 'image' || !item.resultUrl) throw new Error('Only images can be copied.');
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard API not available in this environment.');
  }
  const res = await fetch(item.resultUrl);
  const blob = await res.blob();
  await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
}
