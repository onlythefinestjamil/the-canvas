// The main editing canvas: composites layers, handles zoom/pan, pointer events,
// draws selection overlay, transform handles, grid.
import { useRef, useEffect, useCallback, useState } from 'react';
import type { Layer, BlendMode } from '../lib/layers';
import { composite, renderLayer } from '../lib/layers';
import type { Selection } from '../lib/selection';
import type { ToolId } from '../lib/shortcuts';

interface Props {
  layers: Layer[];
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  snapToGrid: boolean;
  tool: ToolId;
  selection: Selection | null;
  activeLayerId: string | null;
  onPointerDown: (x: number, y: number, e: React.PointerEvent) => void;
  onPointerMove: (x: number, y: number, e: React.PointerEvent) => void;
  onPointerUp: (x: number, y: number, e: React.PointerEvent) => void;
  onWheel: (deltaY: number, e: React.WheelEvent) => void;
  onPan: (dx: number, dy: number) => void;
}

export default function EditorCanvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);

  // composite layers onto the display canvas
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    if (props.layers.length === 0) {
      // empty canvas placeholder
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, c.width, c.height);
      return;
    }
    const comp = composite(props.layers, props.canvasWidth, props.canvasHeight);
    ctx.drawImage(comp, 0, 0);

    // draw selection overlay
    if (props.selection) {
      ctx.save();
      ctx.strokeStyle = 'rgba(124,92,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      if (props.selection.mode === 'rect') {
        ctx.strokeRect(props.selection.x, props.selection.y, props.selection.width, props.selection.height);
      } else if (props.selection.mask) {
        // draw marching ants around mask bounding box
        ctx.strokeRect(props.selection.x, props.selection.y, props.selection.width, props.selection.height);
      }
      ctx.restore();
    }
  }, [props.layers, props.canvasWidth, props.canvasHeight, props.selection]);

  // grid overlay
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !props.showGrid) return;
    const ctx = c.getContext('2d')!;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x <= props.canvasWidth; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, props.canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= props.canvasHeight; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(props.canvasWidth, y);
      ctx.stroke();
    }
    ctx.restore();
  });

  const toCanvasCoords = useCallback((e: React.PointerEvent | React.MouseEvent): { x: number; y: number } => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    const sx = props.canvasWidth / rect.width;
    const sy = props.canvasHeight / rect.height;
    const x = (e.clientX - rect.left) * sx;
    const y = (e.clientY - rect.top) * sy;
    return { x, y };
  }, [props.canvasWidth, props.canvasHeight]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (spaceDown || e.button === 1) {
      setIsPanning(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }
    const { x, y } = toCanvasCoords(e);
    props.onPointerDown(x, y, e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      props.onPan(e.movementX, e.movementY);
      return;
    }
    const { x, y } = toCanvasCoords(e);
    props.onPointerMove(x, y, e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    const { x, y } = toCanvasCoords(e);
    props.onPointerUp(x, y, e);
  };

  const handleWheel = (e: React.WheelEvent) => {
    props.onWheel(e.deltaY, e);
  };

  // space-to-pan
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isInput(e.target)) {
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const cursor = spaceDown || isPanning ? 'grab' : toolCursor(props.tool);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1, overflow: 'hidden', position: 'relative',
        background: 'repeating-conic-gradient(#161616 0% 25%, #1a1a1a 0% 50%) 50% / 24px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        width={props.canvasWidth}
        height={props.canvasHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        style={{
          width: `${props.canvasWidth * props.zoom}px`,
          height: `${props.canvasHeight * props.zoom}px`,
          transform: `translate(${props.panX}px, ${props.panY}px)`,
          imageRendering: props.zoom > 2 ? 'pixelated' : 'auto',
          cursor,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          touchAction: 'none',
        }}
      />
    </div>
  );
}

function isInput(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

function toolCursor(tool: ToolId): string {
  switch (tool) {
    case 'brush':
    case 'pencil':
    case 'eraser':
    case 'clone':
    case 'heal':
      return 'crosshair';
    case 'fill':
      return 'cell';
    case 'eyedropper':
      return 'copy';
    case 'move':
      return 'move';
    case 'text':
      return 'text';
    case 'crop':
      return 'crosshair';
    default:
      return 'crosshair';
  }
}
