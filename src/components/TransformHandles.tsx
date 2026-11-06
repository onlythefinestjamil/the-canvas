// Transform handles overlay — resize/rotate handles around the active layer's bounding box.
import { useState, useCallback } from 'react';

interface Props {
  bounds: { x: number; y: number; width: number; height: number } | null;
  zoom: number;
  panX: number;
  panY: number;
  onResize: (corner: string, dx: number, dy: number) => void;
  onRotate: (deltaDeg: number) => void;
}

type Handle = 'tl' | 'tr' | 'bl' | 'br' | 'rot';

export default function TransformHandles({ bounds, zoom, panX, panY, onResize, onRotate }: Props) {
  const [dragging, setDragging] = useState<Handle | null>(null);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  const onDown = useCallback((h: Handle, e: React.PointerEvent) => {
    e.stopPropagation();
    setDragging(h);
    setStart({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !start) return;
    const dx = (e.clientX - start.x) / zoom;
    const dy = (e.clientY - start.y) / zoom;
    if (dragging === 'rot') {
      // compute angle relative to center
      if (!bounds) return;
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;
      const a1 = Math.atan2(start.y / zoom - cy, start.x / zoom - cx);
      const a2 = Math.atan2(e.clientY / zoom - cy, e.clientX / zoom - cx);
      onRotate(((a2 - a1) * 180) / Math.PI);
    } else {
      onResize(dragging, dx, dy);
    }
    setStart({ x: e.clientX, y: e.clientY });
  }, [dragging, start, zoom, bounds, onResize, onRotate]);

  const onUp = useCallback(() => { setDragging(null); setStart(null); }, []);

  if (!bounds) return null;
  const style = (h: Handle, left: number, top: number): React.CSSProperties => ({
    position: 'absolute',
    left: left * zoom + panX,
    top: top * zoom + panY,
    width: 10,
    height: 10,
    marginLeft: -5,
    marginTop: -5,
    background: 'var(--accent)',
    border: '1.5px solid #fff',
    borderRadius: h === 'rot' ? '50%' : 2,
    cursor: h === 'rot' ? 'grab' : 'nwse-resize',
    touchAction: 'none',
  });

  return (
    <div
      onPointerMove={onMove}
      onPointerUp={onUp}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <div style={{ ...style('tl', bounds.x, bounds.y), pointerEvents: 'auto' }} onPointerDown={(e) => onDown('tl', e)} />
      <div style={{ ...style('tr', bounds.x + bounds.width, bounds.y), pointerEvents: 'auto' }} onPointerDown={(e) => onDown('tr', e)} />
      <div style={{ ...style('bl', bounds.x, bounds.y + bounds.height), pointerEvents: 'auto' }} onPointerDown={(e) => onDown('bl', e)} />
      <div style={{ ...style('br', bounds.x + bounds.width, bounds.y + bounds.height), pointerEvents: 'auto' }} onPointerDown={(e) => onDown('br', e)} />
      <div style={{ ...style('rot', bounds.x + bounds.width / 2, bounds.y - 24), pointerEvents: 'auto' }} onPointerDown={(e) => onDown('rot', e)} />
    </div>
  );
}
