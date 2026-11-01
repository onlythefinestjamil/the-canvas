// Left vertical tool palette — Photoshop-style tools.
import type { ToolId } from '../lib/shortcuts';
import {
  Move, Brush, Pencil, Eraser, PaintBucket, Pipette,
  Square, Circle, Minus, ArrowUpRight, Type, Crop,
  Lasso, Wand, Stamp, Heart,
} from 'lucide-react';

interface ToolDef {
  id: ToolId;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
}

const TOOLS: ToolDef[] = [
  { id: 'move', label: 'Move', shortcut: 'V', icon: <Move size={16} /> },
  { id: 'brush', label: 'Brush', shortcut: 'B', icon: <Brush size={16} /> },
  { id: 'pencil', label: 'Pencil', shortcut: 'P', icon: <Pencil size={16} /> },
  { id: 'eraser', label: 'Eraser', shortcut: 'E', icon: <Eraser size={16} /> },
  { id: 'fill', label: 'Fill', shortcut: 'G', icon: <PaintBucket size={16} /> },
  { id: 'eyedropper', label: 'Eyedropper', shortcut: 'I', icon: <Pipette size={16} /> },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: <Square size={16} /> },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: <Circle size={16} /> },
  { id: 'line', label: 'Line', icon: <Minus size={16} /> },
  { id: 'arrow', label: 'Arrow', icon: <ArrowUpRight size={16} /> },
  { id: 'text', label: 'Text', shortcut: 'T', icon: <Type size={16} /> },
  { id: 'crop', label: 'Crop', shortcut: 'C', icon: <Crop size={16} /> },
  { id: 'rect-select', label: 'Rect Select', icon: <Square size={16} /> },
  { id: 'lasso', label: 'Lasso', shortcut: 'L', icon: <Lasso size={16} /> },
  { id: 'wand', label: 'Magic Wand', shortcut: 'W', icon: <Wand size={16} /> },
  { id: 'clone', label: 'Clone Stamp', shortcut: 'S', icon: <Stamp size={16} /> },
  { id: 'heal', label: 'Healing', icon: <Heart size={16} /> },
];

interface Props {
  active: ToolId;
  onSelect: (t: ToolId) => void;
}

export default function Toolbar({ active, onSelect }: Props) {
  return (
    <div
      style={{
        width: 48,
        minWidth: 48,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0.4rem 0',
        gap: 2,
        overflowY: 'auto',
      }}
    >
      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={`${t.label}${t.shortcut ? ` (${t.shortcut})` : ''}`}
          onClick={() => onSelect(t.id)}
          style={{
            width: 36,
            height: 36,
            border: 'none',
            borderRadius: 8,
            background: active === t.id ? 'var(--accent)' : 'transparent',
            color: active === t.id ? '#fff' : 'var(--text-dim)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={(e) => {
            if (active !== t.id) e.currentTarget.style.background = 'var(--surface-3)';
          }}
          onMouseLeave={(e) => {
            if (active !== t.id) e.currentTarget.style.background = 'transparent';
          }}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
