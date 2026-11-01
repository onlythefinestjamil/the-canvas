// Top menu bar with File/Edit/Image/Layer/Filter/View/Help dropdowns.
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  onNew: () => void;
  onOpen: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onCanvasSize: () => void;
  onAddLayer: (type: 'image' | 'text' | 'shape' | 'adjustment') => void;
  onDuplicate: () => void;
  onMergeDown: () => void;
  onFlatten: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleGrid: () => void;
  onClose: () => void;
}

const MENUS: { name: string; items: string[] }[] = [
  { name: 'File', items: ['new', 'open', 'export'] },
  { name: 'Edit', items: ['undo', 'redo'] },
  { name: 'Image', items: ['flipH', 'flipV', 'canvasSize'] },
  { name: 'Layer', items: ['addImage', 'addText', 'addShape', 'addAdj', 'duplicate', 'mergeDown', 'flatten'] },
  { name: 'Filter', items: ['openFilters'] },
  { name: 'View', items: ['zoomIn', 'zoomOut', 'zoomReset', 'toggleGrid'] },
  { name: 'Help', items: ['shortcuts'] },
];

const LABELS: Record<string, string> = {
  new: 'New', open: 'Open…', export: 'Export…',
  undo: 'Undo', redo: 'Redo',
  flipH: 'Flip Horizontal', flipV: 'Flip Vertical', canvasSize: 'Canvas Size…',
  addImage: 'Add Image Layer', addText: 'Add Text Layer', addShape: 'Add Shape Layer',
  addAdj: 'Add Adjustment Layer', duplicate: 'Duplicate Layer', mergeDown: 'Merge Down', flatten: 'Flatten All',
  openFilters: 'Filters Panel',
  zoomIn: 'Zoom In', zoomOut: 'Zoom Out', zoomReset: 'Reset Zoom', toggleGrid: 'Toggle Grid',
  shortcuts: 'Keyboard Shortcuts',
};

export default function MenuBar(props: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const run = (action: string) => {
    setOpen(null);
    const a = action;
    switch (a) {
      case 'new': props.onNew(); break;
      case 'open': props.onOpen(); break;
      case 'export': props.onExport(); break;
      case 'undo': props.onUndo(); break;
      case 'redo': props.onRedo(); break;
      case 'flipH': props.onFlipH(); break;
      case 'flipV': props.onFlipV(); break;
      case 'canvasSize': props.onCanvasSize(); break;
      case 'addImage': props.onAddLayer('image'); break;
      case 'addText': props.onAddLayer('text'); break;
      case 'addShape': props.onAddLayer('shape'); break;
      case 'addAdj': props.onAddLayer('adjustment'); break;
      case 'duplicate': props.onDuplicate(); break;
      case 'mergeDown': props.onMergeDown(); break;
      case 'flatten': props.onFlatten(); break;
      case 'openFilters': break; // handled by tab switch in parent
      case 'zoomIn': props.onZoomIn(); break;
      case 'zoomOut': props.onZoomOut(); break;
      case 'zoomReset': props.onZoomReset(); break;
      case 'toggleGrid': props.onToggleGrid(); break;
      case 'shortcuts': alert('Shortcuts: B=Brush, E=Eraser, V=Move, T=Text, R=Rect, L=Lasso, W=Wand, C=Crop, S=Clone, H=Heal, [ ]=Brush size, Ctrl+Z=Undo, Ctrl+Shift+Z=Redo, Ctrl+S=Save, Ctrl+Shift+S=Export, Ctrl+N=New, Ctrl+O=Open, Ctrl+T=Transform, Ctrl+J=Duplicate, Ctrl+A=Select all, Ctrl+D=Deselect, Ctrl+I=Invert'); break;
    }
  };

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.1rem',
        padding: '0.2rem 0.5rem', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', height: 38, minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.6rem' }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>C</div>
      </div>
      {MENUS.map((m) => (
        <div key={m.name} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(open === m.name ? null : m.name)}
            style={{
              padding: '0.3rem 0.6rem', border: 'none', background: open === m.name ? 'var(--surface-3)' : 'transparent',
              color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.74rem', borderRadius: 6,
            }}
            onMouseEnter={() => open && setOpen(m.name)}
          >
            {m.name}
          </button>
          {open === m.name && (
            <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: 170, background: 'var(--surface-2)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '0.3rem', zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              {m.items.map((item) => (
                <button
                  key={item}
                  onClick={() => run(item)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.4rem 0.6rem', border: 'none', background: 'transparent',
                    color: 'var(--text)', cursor: 'pointer', fontSize: '0.74rem', borderRadius: 6,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {LABELS[item]}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      <span style={{ flex: 1 }} />
      <button onClick={props.onClose} className="icon-btn" style={{ padding: '0.3rem' }} title="Close editor">
        <X size={14} />
      </button>
    </div>
  );
}
