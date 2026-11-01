// Undo/redo history stack for the editor (distinct from prompt history).
import type { Layer } from './layers';
import { composite } from './layers';

export interface HistorySnapshot {
  id: string;
  label: string;
  timestamp: number;
  layers: Layer[];
  canvasWidth: number;
  canvasHeight: number;
  activeId: string | null;
}

function snapshotLayers(layers: Layer[]): Layer[] {
  return layers.map((l) => {
    if (l.type === 'image' || l.type === 'background') {
      const img = l as any;
      const copy = document.createElement('canvas');
      copy.width = img.canvas.width;
      copy.height = img.canvas.height;
      copy.getContext('2d')!.drawImage(img.canvas, 0, 0);
      return { ...img, canvas: copy };
    }
    return { ...l };
  });
}

export class History {
  private undo: HistorySnapshot[] = [];
  private redo: HistorySnapshot[] = [];
  private max = 50;

  push(label: string, layers: Layer[], cw: number, ch: number, activeId: string | null): void {
    this.undo.push({
      id: Math.random().toString(36).slice(2, 9),
      label,
      timestamp: Date.now(),
      layers: snapshotLayers(layers),
      canvasWidth: cw,
      canvasHeight: ch,
      activeId,
    });
    if (this.undo.length > this.max) this.undo.shift();
    this.redo = [];
  }

  canUndo(): boolean {
    return this.undo.length > 1;
  }
  canRedo(): boolean {
    return this.redo.length > 0;
  }

  undoStep(): HistorySnapshot | null {
    if (this.undo.length <= 1) return null;
    const current = this.undo.pop()!;
    this.redo.push(current);
    return this.undo[this.undo.length - 1] ?? null;
  }

  redoStep(): HistorySnapshot | null {
    const next = this.redo.pop();
    if (!next) return null;
    this.undo.push(next);
    return next;
  }

  jumpTo(index: number): HistorySnapshot | null {
    if (index < 0 || index >= this.undo.length) return null;
    while (this.undo.length > index + 1) {
      this.redo.push(this.undo.pop()!);
    }
    return this.undo[this.undo.length - 1] ?? null;
  }

  list(): HistorySnapshot[] {
    return [...this.undo];
  }

  get length(): number {
    return this.undo.length;
  }
}

// Render a thumbnail of the current state for the history panel.
export function snapshotThumb(layers: Layer[], cw: number, ch: number, size = 48): string {
  try {
    const c = composite(layers, cw, ch);
    const thumb = document.createElement('canvas');
    const ratio = cw / ch;
    thumb.width = size;
    thumb.height = Math.round(size / ratio);
    thumb.getContext('2d')!.drawImage(c, 0, 0, thumb.width, thumb.height);
    return thumb.toDataURL('image/png');
  } catch {
    return '';
  }
}
