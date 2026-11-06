// The full Photoshop-like editor — orchestrates layers, tools, canvas, panels, history.
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brush, Pipette, Square, Sliders, History as HistoryIcon, Layers as LayersIcon,
  ZoomIn, ZoomOut, Maximize, Grid3x3, Download,
} from 'lucide-react';
import type { Layer, BlendMode, LayerType, ImageLayer, AdjustmentLayerData, ShapeKind } from '../lib/layers';
import {
  newImageLayer, newBackgroundLayer, newTextLayer, newShapeLayer,
  newAdjustmentLayer, composite, uid,
} from '../lib/layers';
import type { ToolId } from '../lib/shortcuts';
import { TOOL_SHORTCUTS, brushSizeKey } from '../lib/shortcuts';
import type { Selection } from '../lib/selection';
import { rectSelection, lassoSelection, magicWand, invertSelection, selectAll } from '../lib/selection';
import type { FilterType } from '../lib/filters';
import { applyFilterToCanvas } from '../lib/filters';
import { renderAdjustmentToCanvas } from '../lib/adjustments';
import {
  brushStroke, pencilStroke, eraserDab, floodFill, eyedropper, getLayerCtx,
} from '../lib/drawing';
import { flipHorizontal, flipVertical, rotateLayer, applyCrop, duplicateLayer, type CropRegion } from '../lib/transform';
import { cloneStamp, healBrush, type CloneSource } from '../lib/clone';
import { History, type HistorySnapshot } from '../lib/editor-history';
import EditorCanvas from './EditorCanvas';
import Toolbar from './Toolbar';
import LayerPanel from './LayerPanel';
import AdjustmentPanel from './AdjustmentPanel';
import FilterPanel from './FilterPanel';
import HistoryPanel from './HistoryPanel';
import ExportDialog from './ExportDialog';
import MenuBar from './MenuBar';
import SelectionToolbar from './SelectionToolbar';

interface Props {
  initialImage?: string | null;
  initialWidth?: number;
  initialHeight?: number;
  onClose: () => void;
}

type RightTab = 'layers' | 'adjustments' | 'filters' | 'history';

const DEFAULT_W = 1024;
const DEFAULT_H = 1024;

export default function PhotoEditor({ initialImage, initialWidth, initialHeight, onClose }: Props) {
  const [canvasWidth, setCanvasWidth] = useState(initialWidth ?? DEFAULT_W);
  const [canvasHeight, setCanvasHeight] = useState(initialHeight ?? DEFAULT_H);
  const [layers, setLayers] = useState<Layer[]>(() => {
    const bg = newBackgroundLayer(initialWidth ?? DEFAULT_W, initialHeight ?? DEFAULT_H, '#ffffff');
    return [bg];
  });
  const [activeId, setActiveId] = useState<string | null>(() => null);
  const [tool, setTool] = useState<ToolId>('move');
  const [brush, setBrush] = useState({ size: 24, hardness: 80, opacity: 100, color: '#7c5cff' });
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [cloneSource, setCloneSource] = useState<CloneSource | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('layers');
  const [statusColor, setStatusColor] = useState('#ffffff');

  const historyRef = useRef(new History());
  const [historyVersion, setHistoryVersion] = useState(0);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);

  // drawing state refs (don't trigger re-render)
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const lassoPoints = useRef<{ x: number; y: number }[]>([]);
  const cropRegion = useRef<CropRegion | null>(null);
  const movingLayer = useRef<Layer | null>(null);
  const moveOffset = useRef<{ dx: number; dy: number } | null>(null);

  // ---- load initial image into a layer ----
  useEffect(() => {
    if (!initialImage) {
      setActiveId(layers[0]?.id ?? null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setCanvasWidth(w);
      setCanvasHeight(h);
      const layer = newImageLayer(w, h, 'Image');
      const ctx = layer.canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      // replace background with the loaded image
      setLayers([{ ...layer, type: 'background', name: 'Background' }]);
      setActiveId(layer.id);
      historyRef.current.push('Open image', [{ ...layer, type: 'background' }], w, h, layer.id);
      setHistoryVersion((v) => v + 1);
      setActiveHistoryIndex(0);
    };
    img.onerror = () => {
      setActiveId(layers[0]?.id ?? null);
    };
    img.src = initialImage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImage]);

  const activeLayer = useMemo(() => layers.find((l) => l.id === activeId) ?? null, [layers, activeId]);
  const activeAdjustment = activeLayer && activeLayer.type === 'adjustment' ? (activeLayer as AdjustmentLayerData) : null;

  // ---- history helpers ----
  const pushHistory = useCallback((label: string) => {
    historyRef.current.push(label, layers, canvasWidth, canvasHeight, activeId);
    setHistoryVersion((v) => v + 1);
    setActiveHistoryIndex(historyRef.current.length - 1);
  }, [layers, canvasWidth, canvasHeight, activeId]);

  const restoreSnapshot = useCallback((snap: HistorySnapshot | null) => {
    if (!snap) return;
    setLayers(snap.layers);
    setCanvasWidth(snap.canvasWidth);
    setCanvasHeight(snap.canvasHeight);
    setActiveId(snap.activeId);
    // re-apply adjustment layers so previews match
    setHistoryVersion((v) => v + 1);
  }, []);

  const handleUndo = useCallback(() => {
    const snap = historyRef.current.undoStep();
    if (snap) {
      restoreSnapshot(snap);
      setActiveHistoryIndex(historyRef.current.length - 1);
    }
  }, [restoreSnapshot]);

  const handleRedo = useCallback(() => {
    const snap = historyRef.current.redoStep();
    if (snap) {
      restoreSnapshot(snap);
      setActiveHistoryIndex(historyRef.current.length - 1);
    }
  }, [restoreSnapshot]);

  const handleJump = useCallback((index: number) => {
    const snap = historyRef.current.jumpTo(index);
    if (snap) {
      restoreSnapshot(snap);
      setActiveHistoryIndex(index);
    }
  }, [restoreSnapshot]);

  // ---- layer operations ----
  const updateLayer = useCallback((id: string, patch: Partial<Layer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)));
  }, []);

  const addLayer = useCallback((type: LayerType) => {
    let layer: Layer;
    if (type === 'image') {
      layer = newImageLayer(canvasWidth, canvasHeight, `Layer ${layers.length + 1}`);
    } else if (type === 'text') {
      layer = newTextLayer(canvasWidth, canvasHeight);
    } else if (type === 'shape') {
      layer = newShapeLayer(canvasWidth, canvasHeight, 'rectangle');
    } else if (type === 'adjustment') {
      layer = newAdjustmentLayer(canvasWidth, canvasHeight, 'brightness-contrast');
    } else {
      layer = newImageLayer(canvasWidth, canvasHeight, 'Layer');
    }
    setLayers((prev) => [...prev, layer]);
    setActiveId(layer.id);
    pushHistory(`Add ${type} layer`);
    if (type === 'adjustment') setRightTab('adjustments');
  }, [canvasWidth, canvasHeight, layers.length, pushHistory]);

  const deleteLayer = useCallback((id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (activeId === id) setActiveId(null);
    pushHistory('Delete layer');
  }, [activeId, pushHistory]);

  const duplicateActive = useCallback(() => {
    if (!activeLayer) return;
    const copy = duplicateLayer(activeLayer);
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === activeLayer.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setActiveId(copy.id);
    pushHistory('Duplicate layer');
  }, [activeLayer, pushHistory]);

  const reorderLayer = useCallback((from: number, to: number) => {
    setLayers((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    pushHistory('Reorder layer');
  }, [pushHistory]);

  const mergeDown = useCallback(() => {
    if (!activeLayer) return;
    const idx = layers.findIndex((l) => l.id === activeLayer.id);
    if (idx <= 0) return;
    const below = layers[idx - 1];
    if (!(below.type === 'image' || below.type === 'background') || !(activeLayer.type === 'image')) return;
    const belowImg = below as ImageLayer;
    const ctx = belowImg.canvas.getContext('2d')!;
    const activeImg = activeLayer as ImageLayer;
    ctx.drawImage(activeImg.canvas, activeImg.x - belowImg.x, activeImg.y - belowImg.y);
    setLayers((prev) => prev.filter((l) => l.id !== activeLayer.id));
    setActiveId(below.id);
    pushHistory('Merge down');
  }, [activeLayer, layers, pushHistory]);

  const flattenAll = useCallback(() => {
    const comp = composite(layers, canvasWidth, canvasHeight);
    const flat = newImageLayer(canvasWidth, canvasHeight, 'Background');
    flat.type = 'background';
    flat.canvas.getContext('2d')!.drawImage(comp, 0, 0);
    setLayers([flat]);
    setActiveId(flat.id);
    pushHistory('Flatten');
  }, [layers, canvasWidth, canvasHeight, pushHistory]);

  // ---- adjustment param editing ----
  const setAdjustmentParam = useCallback((id: string, key: string, value: number) => {
    setLayers((prev) => prev.map((l) => {
      if (l.id !== id || l.type !== 'adjustment') return l;
      const adj = l as AdjustmentLayerData;
      return { ...adj, params: { ...adj.params, [key]: value } };
    }));
  }, []);

  // ---- apply a filter destructively to active image layer ----
  const applyFilterToActive = useCallback((filter: FilterType, amount: number) => {
    if (!activeLayer || (activeLayer.type !== 'image' && activeLayer.type !== 'background')) return;
    const img = activeLayer as ImageLayer;
    applyFilterToCanvas(img.canvas, filter, { amount });
    pushHistory(`Filter: ${filter}`);
  }, [activeLayer, pushHistory]);

  // ---- re-apply adjustment layers to their backing composites for preview ----
  // For simplicity, adjustment layers are applied as a live overlay tint during
  // compositing. Real per-pixel adjustment is applied on export/flatten.
  // (kept lightweight for responsiveness)

  // ---- pointer handlers (tool logic) ----
  const getCompositeCanvas = useCallback((): HTMLCanvasElement => {
    return composite(layers, canvasWidth, canvasHeight);
  }, [layers, canvasWidth, canvasHeight]);

  const handlePointerDown = useCallback((x: number, y: number, _e: React.PointerEvent) => {
    drawing.current = true;
    lastPoint.current = { x, y };
    dragStart.current = { x, y };

    const active = activeLayer;

    // eyedropper works on the composite regardless of active layer
    if (tool === 'eyedropper') {
      const comp = getCompositeCanvas();
      const c = eyedropper(comp, x, y);
      setBrush((b) => ({ ...b, color: c }));
      setStatusColor(c);
      drawing.current = false;
      return;
    }

    // magic wand
    if (tool === 'wand') {
      const comp = getCompositeCanvas();
      const sel = magicWand(comp, x, y, 32);
      if (sel) setSelection(sel);
      drawing.current = false;
      return;
    }

    // clone: alt+click sets source, otherwise stamp
    if (tool === 'clone' || tool === 'heal') {
      if (_e.altKey) {
        setCloneSource({ x, y });
        drawing.current = false;
        return;
      }
      if (!cloneSource || !active || active.type !== 'image') return;
      if (tool === 'clone') {
        cloneStamp(active as ImageLayer, { x, y }, { x, y }, cloneSource, brush.size, brush.opacity);
      } else {
        healBrush(active as ImageLayer, { x, y }, { x, y }, cloneSource, brush.size);
      }
      return;
    }

    // fill bucket
    if (tool === 'fill') {
      if (!active || active.type !== 'image') return;
      floodFill(active as ImageLayer, x, y, brush.color, 24);
      pushHistory('Fill');
      drawing.current = false;
      return;
    }

    // shape tools — create a new shape layer on drag start
    if (tool === 'rectangle' || tool === 'ellipse' || tool === 'line' || tool === 'arrow') {
      const kind = tool as ShapeKind;
      const layer = newShapeLayer(canvasWidth, canvasHeight, kind);
      layer.x = x; layer.y = y; layer.width = 1; layer.height = 1;
      layer.fill = brush.color;
      setLayers((prev) => [...prev, layer]);
      setActiveId(layer.id);
      movingLayer.current = layer;
      return;
    }

    // text tool — create a text layer at the click point
    if (tool === 'text') {
      const layer = newTextLayer(canvasWidth, canvasHeight);
      layer.text = 'New Text';
      layer.color = brush.color;
      layer.x = x; layer.y = y;
      setLayers((prev) => [...prev, layer]);
      setActiveId(layer.id);
      pushHistory('Add text');
      drawing.current = false;
      return;
    }

    // crop
    if (tool === 'crop') {
      cropRegion.current = { x, y, width: 0, height: 0 };
      return;
    }

    // rect select
    if (tool === 'rect-select') {
      return;
    }

    // lasso
    if (tool === 'lasso') {
      lassoPoints.current = [{ x, y }];
      return;
    }

    // move tool — start dragging the active layer
    if (tool === 'move' && active) {
      movingLayer.current = active;
      moveOffset.current = { dx: x - active.x, dy: y - active.y };
      return;
    }

    // brush / pencil / eraser
    if ((tool === 'brush' || tool === 'pencil' || tool === 'eraser') && active && (active.type === 'image' || active.type === 'background')) {
      const img = active as ImageLayer;
      const ctx = getLayerCtx(img);
      if (tool === 'brush') {
        brushStroke(ctx, { x, y }, { x, y }, { size: brush.size, hardness: brush.hardness, opacity: brush.opacity, color: brush.color });
      } else if (tool === 'pencil') {
        pencilStroke(ctx, { x, y }, { x, y }, { size: brush.size, hardness: brush.hardness, opacity: brush.opacity, color: brush.color });
      } else {
        eraserDab(ctx, { x, y }, { x, y }, { size: brush.size, hardness: brush.hardness, opacity: brush.opacity, color: brush.color });
      }
    }
  }, [activeLayer, brush, cloneSource, getCompositeCanvas, pushHistory, tool, canvasWidth, canvasHeight]);

  const handlePointerMove = useCallback((x: number, y: number, _e: React.PointerEvent) => {
    if (!drawing.current) {
      // update status color under cursor
      return;
    }
    const active = activeLayer;

    // crop drag
    if (tool === 'crop' && cropRegion.current && dragStart.current) {
      cropRegion.current = {
        x: Math.min(dragStart.current.x, x),
        y: Math.min(dragStart.current.y, y),
        width: Math.abs(x - dragStart.current.x),
        height: Math.abs(y - dragStart.current.y),
      };
      setSelection(rectSelection(cropRegion.current.x, cropRegion.current.y, cropRegion.current.width, cropRegion.current.height));
      return;
    }

    // rect select drag
    if (tool === 'rect-select' && dragStart.current) {
      setSelection(rectSelection(
        Math.min(dragStart.current.x, x),
        Math.min(dragStart.current.y, y),
        Math.abs(x - dragStart.current.x),
        Math.abs(y - dragStart.current.y),
      ));
      return;
    }

    // lasso
    if (tool === 'lasso' && drawing.current) {
      lassoPoints.current.push({ x, y });
      return;
    }

    // shape drag — update the shape layer geometry
    if ((tool === 'rectangle' || tool === 'ellipse' || tool === 'line' || tool === 'arrow') && movingLayer.current && dragStart.current) {
      const layer = movingLayer.current;
      const sx = dragStart.current.x;
      const sy = dragStart.current.y;
      updateLayer(layer.id, {
        x: Math.min(sx, x),
        y: Math.min(sy, y),
        width: Math.max(1, Math.abs(x - sx)),
        height: Math.max(1, Math.abs(y - sy)),
      } as Partial<Layer>);
      return;
    }

    // move drag
    if (tool === 'move' && movingLayer.current && moveOffset.current) {
      updateLayer(movingLayer.current.id, {
        x: x - moveOffset.current.dx,
        y: y - moveOffset.current.dy,
      } as Partial<Layer>);
      return;
    }

    // brush / pencil / eraser stroke
    if (lastPoint.current && active && (active.type === 'image' || active.type === 'background')) {
      const img = active as ImageLayer;
      const ctx = getLayerCtx(img);
      if (tool === 'brush') {
        brushStroke(ctx, lastPoint.current, { x, y }, { size: brush.size, hardness: brush.hardness, opacity: brush.opacity, color: brush.color });
      } else if (tool === 'pencil') {
        pencilStroke(ctx, lastPoint.current, { x, y }, { size: brush.size, hardness: brush.hardness, opacity: brush.opacity, color: brush.color });
      } else if (tool === 'eraser') {
        eraserDab(ctx, lastPoint.current, { x, y }, { size: brush.size, hardness: brush.hardness, opacity: brush.opacity, color: brush.color });
      } else if ((tool === 'clone' || tool === 'heal') && cloneSource) {
        if (tool === 'clone') cloneStamp(img, lastPoint.current, { x, y }, cloneSource, brush.size, brush.opacity);
        else healBrush(img, lastPoint.current, { x, y }, cloneSource, brush.size);
      }
      lastPoint.current = { x, y };
    }
  }, [activeLayer, brush, cloneSource, tool, updateLayer]);

  const handlePointerUp = useCallback((_x: number, _y: number, _e: React.PointerEvent) => {
    if (tool === 'crop' && cropRegion.current && cropRegion.current.width > 4 && cropRegion.current.height > 4) {
      const { layers: newLayers, width, height } = applyCrop(layers, canvasWidth, canvasHeight, cropRegion.current);
      setLayers(newLayers);
      setCanvasWidth(width);
      setCanvasHeight(height);
      cropRegion.current = null;
      setSelection(null);
      pushHistory('Crop');
    } else if (tool === 'crop') {
      cropRegion.current = null;
      setSelection(null);
    }

    if (tool === 'lasso' && lassoPoints.current.length > 2) {
      const sel = lassoSelection(lassoPoints.current, canvasWidth, canvasHeight);
      setSelection(sel);
      lassoPoints.current = [];
      pushHistory('Lasso select');
    }

    if (tool === 'rect-select') {
      pushHistory('Rect select');
    }

    if ((tool === 'rectangle' || tool === 'ellipse' || tool === 'line' || tool === 'arrow') && movingLayer.current) {
      pushHistory('Add shape');
      movingLayer.current = null;
    }

    if (tool === 'move' && movingLayer.current) {
      pushHistory('Move');
      movingLayer.current = null;
      moveOffset.current = null;
    }

    if (tool === 'brush' || tool === 'pencil' || tool === 'eraser' || tool === 'clone' || tool === 'heal') {
      pushHistory(`${tool} stroke`);
    }

    drawing.current = false;
    lastPoint.current = null;
    dragStart.current = null;
  }, [tool, layers, canvasWidth, canvasHeight, pushHistory]);

  // ---- wheel zoom ----
  const handleWheel = useCallback((deltaY: number, e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault?.();
      setZoom((z) => {
        const next = z * (1 - deltaY * 0.001);
        return Math.max(0.05, Math.min(8, next));
      });
    }
  }, []);

  const handlePan = useCallback((dx: number, dy: number) => {
    setPanX((x) => x + dx);
    setPanY((y) => y + dy);
  }, []);

  // ---- transform: flip/rotate active ----
  const doFlipH = useCallback(() => {
    if (!activeLayer) return;
    flipHorizontal(activeLayer);
    pushHistory('Flip horizontal');
  }, [activeLayer, pushHistory]);

  const doFlipV = useCallback(() => {
    if (!activeLayer) return;
    flipVertical(activeLayer);
    pushHistory('Flip vertical');
  }, [activeLayer, pushHistory]);

  const doRotate = useCallback((deg: number) => {
    if (!activeLayer) return;
    rotateLayer(activeLayer, deg);
    pushHistory(`Rotate ${deg}°`);
  }, [activeLayer, pushHistory]);

  // ---- selection ops ----
  const handleSelectAll = useCallback(() => {
    setSelection(selectAll(canvasWidth, canvasHeight));
  }, [canvasWidth, canvasHeight]);

  const handleDeselect = useCallback(() => setSelection(null), []);

  const handleInvert = useCallback(() => {
    if (selection) setSelection(invertSelection(selection, canvasWidth, canvasHeight));
  }, [selection, canvasWidth, canvasHeight]);

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return;

      // tool shortcuts (single key, no modifier)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (TOOL_SHORTCUTS[key]) {
          setTool(TOOL_SHORTCUTS[key]);
          e.preventDefault();
          return;
        }
        const bs = brushSizeKey(key);
        if (bs === 'increase') { setBrush((b) => ({ ...b, size: Math.min(500, b.size + 4) })); e.preventDefault(); return; }
        if (bs === 'decrease') { setBrush((b) => ({ ...b, size: Math.max(1, b.size - 4) })); e.preventDefault(); return; }
        if (key === 'delete' || key === 'backspace') {
          if (activeLayer) { deleteLayer(activeLayer.id); e.preventDefault(); }
          return;
        }
      }

      // ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'z' && !e.shiftKey) { handleUndo(); e.preventDefault(); return; }
        if ((key === 'z' && e.shiftKey) || key === 'y') { handleRedo(); e.preventDefault(); return; }
        if (key === 's' && !e.shiftKey) { setExportOpen(true); e.preventDefault(); return; }
        if (key === 's' && e.shiftKey) { setExportOpen(true); e.preventDefault(); return; }
        if (key === 'd') { handleDeselect(); e.preventDefault(); return; }
        if (key === 'a') { handleSelectAll(); e.preventDefault(); return; }
        if (e.shiftKey && key === 'i') { handleInvert(); e.preventDefault(); return; }
        if (key === 'j') { duplicateActive(); e.preventDefault(); return; }
        if (key === 't') { /* transform — focus handles later */ e.preventDefault(); return; }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeLayer, deleteLayer, handleUndo, handleRedo, handleDeselect, handleSelectAll, handleInvert, duplicateActive]);

  const historyList = historyRef.current.list();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}
    >
      {/* Menu bar */}
      <MenuBar
        onNew={() => { setLayers([newBackgroundLayer(DEFAULT_W, DEFAULT_H, '#ffffff')]); setCanvasWidth(DEFAULT_W); setCanvasHeight(DEFAULT_H); setActiveId(null); pushHistory('New canvas'); }}
        onOpen={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = () => { const f = input.files?.[0]; if (f) { const url = URL.createObjectURL(f); const img = new Image(); img.onload = () => { const w = img.naturalWidth; const h = img.naturalHeight; setCanvasWidth(w); setCanvasHeight(h); const layer = newImageLayer(w, h, 'Image'); layer.canvas.getContext('2d')!.drawImage(img, 0, 0); setLayers([{ ...layer, type: 'background', name: 'Background' }]); setActiveId(layer.id); pushHistory('Open'); }; img.src = url; } }; input.click(); }}
        onExport={() => setExportOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onFlipH={doFlipH}
        onFlipV={doFlipV}
        onCanvasSize={() => { /* simple resize — keep content */ const w = prompt('Canvas width', String(canvasWidth)); const h = prompt('Canvas height', String(canvasHeight)); if (w && h) { setCanvasWidth(Number(w)); setCanvasHeight(Number(h)); pushHistory('Canvas size'); } }}
        onAddLayer={addLayer}
        onDuplicate={duplicateActive}
        onMergeDown={mergeDown}
        onFlatten={flattenAll}
        onZoomIn={() => setZoom((z) => Math.min(8, z * 1.25))}
        onZoomOut={() => setZoom((z) => Math.max(0.05, z / 1.25))}
        onZoomReset={() => { setZoom(1); setPanX(0); setPanY(0); }}
        onToggleGrid={() => setShowGrid((g) => !g)}
        onClose={onClose}
      />

      {/* Body: toolbar | canvas | right panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Toolbar active={tool} onSelect={setTool} />

        {/* Canvas area + tool options bar */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Tool options bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.4rem 0.8rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', minHeight: 42, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'capitalize', fontWeight: 600, color: 'var(--text)' }}>{tool}</span>
            {(tool === 'brush' || tool === 'pencil' || tool === 'eraser' || tool === 'clone' || tool === 'heal') && (
              <>
                <ToolOpt label="Size">
                  <input type="range" min={1} max={200} value={brush.size} onChange={(e) => setBrush((b) => ({ ...b, size: Number(e.target.value) }))} style={{ width: 90 }} />
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', minWidth: 28 }}>{brush.size}px</span>
                </ToolOpt>
                {tool !== 'pencil' && tool !== 'eraser' && (
                  <ToolOpt label="Hardness">
                    <input type="range" min={0} max={100} value={brush.hardness} onChange={(e) => setBrush((b) => ({ ...b, hardness: Number(e.target.value) }))} style={{ width: 70 }} />
                  </ToolOpt>
                )}
                <ToolOpt label="Opacity">
                  <input type="range" min={1} max={100} value={brush.opacity} onChange={(e) => setBrush((b) => ({ ...b, opacity: Number(e.target.value) }))} style={{ width: 70 }} />
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', minWidth: 28 }}>{brush.opacity}%</span>
                </ToolOpt>
              </>
            )}
            {(tool === 'brush' || tool === 'pencil' || tool === 'fill' || tool === 'rectangle' || tool === 'ellipse' || tool === 'line' || tool === 'arrow' || tool === 'text') && (
              <ToolOpt label="Color">
                <input type="color" value={brush.color} onChange={(e) => setBrush((b) => ({ ...b, color: e.target.value }))} style={{ width: 32, height: 24, border: 'none', background: 'transparent', cursor: 'pointer' }} />
              </ToolOpt>
            )}
            {(tool === 'clone' || tool === 'heal') && (
              <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{cloneSource ? 'Alt+click to set source · paint to apply' : 'Alt+click to set source'}</span>
            )}
            <span style={{ flex: 1 }} />
            <button className="icon-btn" style={{ padding: '0.3rem' }} onClick={() => setExportOpen(true)} title="Export (Ctrl+S)"><Download size={13} /></button>
          </div>

          <EditorCanvas
            layers={layers}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            zoom={zoom}
            panX={panX}
            panY={panY}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            tool={tool}
            selection={selection}
            activeLayerId={activeId}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            onPan={handlePan}
          />
          <SelectionToolbar selection={selection} onSelectAll={handleSelectAll} onDeselect={handleDeselect} onInvert={handleInvert} />

          {/* Status bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.3rem 0.8rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>
            <span>{Math.round(zoom * 100)}%</span>
            <span>{canvasWidth} × {canvasHeight}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: statusColor, border: '1px solid var(--border)' }} />
              {statusColor}
            </span>
            <span style={{ flex: 1 }} />
            <span>{layers.length} layers</span>
            <button className="icon-btn" style={{ padding: '0.2rem' }} onClick={() => setZoom((z) => Math.min(8, z * 1.25))} title="Zoom in"><ZoomIn size={12} /></button>
            <button className="icon-btn" style={{ padding: '0.2rem' }} onClick={() => setZoom((z) => Math.max(0.05, z / 1.25))} title="Zoom out"><ZoomOut size={12} /></button>
            <button className="icon-btn" style={{ padding: '0.2rem' }} onClick={() => { setZoom(1); setPanX(0); setPanY(0); }} title="Fit"><Maximize size={12} /></button>
            <button className="icon-btn" style={{ padding: '0.2rem', background: showGrid ? 'var(--surface-3)' : 'transparent' }} onClick={() => setShowGrid((g) => !g)} title="Grid"><Grid3x3 size={12} /></button>
          </div>
        </div>

        {/* Right panel: tabbed */}
        <div style={{ width: 280, minWidth: 240, borderLeft: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            <TabBtn active={rightTab === 'layers'} onClick={() => setRightTab('layers')} icon={<LayersIcon size={13} />} label="Layers" />
            <TabBtn active={rightTab === 'adjustments'} onClick={() => setRightTab('adjustments')} icon={<Sliders size={13} />} label="Adj" />
            <TabBtn active={rightTab === 'filters'} onClick={() => setRightTab('filters')} icon={<Brush size={13} />} label="Filters" />
            <TabBtn active={rightTab === 'history'} onClick={() => setRightTab('history')} icon={<HistoryIcon size={13} />} label="History" />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {rightTab === 'layers' && (
              <LayerPanel
                layers={layers}
                activeId={activeId}
                onSelect={setActiveId}
                onToggleVisible={(id) => updateLayer(id, { visible: !layers.find((l) => l.id === id)?.visible } as Partial<Layer>)}
                onToggleLock={(id) => updateLayer(id, { locked: !layers.find((l) => l.id === id)?.locked } as Partial<Layer>)}
                onOpacity={(id, op) => updateLayer(id, { opacity: op } as Partial<Layer>)}
                onBlend={(id, mode) => updateLayer(id, { blendMode: mode } as Partial<Layer>)}
                onDelete={deleteLayer}
                onDuplicate={duplicateActive}
                onReorder={reorderLayer}
                onAdd={addLayer}
                onRename={(id, name) => updateLayer(id, { name } as Partial<Layer>)}
              />
            )}
            {rightTab === 'adjustments' && (
              <AdjustmentPanel
                active={activeAdjustment}
                onCreate={(type) => { const layer = newAdjustmentLayer(canvasWidth, canvasHeight, type); setLayers((prev) => [...prev, layer]); setActiveId(layer.id); pushHistory(`Add ${type}`); }}
                onParam={setAdjustmentParam}
              />
            )}
            {rightTab === 'filters' && (
              <FilterPanel onApply={applyFilterToActive} />
            )}
            {rightTab === 'history' && (
              <HistoryPanel
                history={historyList}
                canUndo={historyRef.current.canUndo()}
                canRedo={historyRef.current.canRedo()}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onJump={handleJump}
                activeIndex={activeHistoryIndex}
              />
            )}
          </div>
        </div>
      </div>

      {exportOpen && (
        <ExportDialog
          layers={layers}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onClose={() => setExportOpen(false)}
        />
      )}
    </motion.div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '0.5rem 0.2rem', border: 'none', cursor: 'pointer',
        background: active ? 'var(--surface-3)' : 'transparent',
        color: active ? 'var(--text)' : 'var(--text-dim)',
        fontSize: '0.64rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
        borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'all var(--transition)',
      }}
    >
      {icon} {label}
    </button>
  );
}

function ToolOpt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {children}
    </div>
  );
}
