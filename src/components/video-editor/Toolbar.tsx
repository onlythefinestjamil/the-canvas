// Toolbar — selection, blade, position, zoom, hand, text, crop tools (V/B/P/Z/H/T/C).
import type { ToolId } from './VideoEditor';
import { MousePointer2, Scissors, Move, ZoomIn, Hand, Type, Crop } from 'lucide-react';

const TOOLS: { id: ToolId; label: string; key: string; icon: React.ReactNode }[] = [
  { id: 'select', label: 'Selection', key: 'V', icon: <MousePointer2 size={16} /> },
  { id: 'blade', label: 'Blade', key: 'B', icon: <Scissors size={16} /> },
  { id: 'position', label: 'Position', key: 'P', icon: <Move size={16} /> },
  { id: 'zoom', label: 'Zoom', key: 'Z', icon: <ZoomIn size={16} /> },
  { id: 'hand', label: 'Hand', key: 'H', icon: <Hand size={16} /> },
  { id: 'text', label: 'Text', key: 'T', icon: <Type size={16} /> },
  { id: 'crop', label: 'Crop', key: 'C', icon: <Crop size={16} /> },
];

interface Props {
  tool: ToolId;
  onTool: (t: ToolId) => void;
}

export default function Toolbar({ tool, onTool }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '0.5rem 0.4rem',
        borderRight: '1px solid var(--border)',
        background: 'var(--surface)',
        width: 48,
        flexShrink: 0,
        alignItems: 'center',
      }}
    >
      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={`${t.label} (${t.key})`}
          onClick={() => onTool(t.id)}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${tool === t.id ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 8,
            background: tool === t.id ? 'rgba(124,92,255,0.16)' : 'transparent',
            color: tool === t.id ? 'var(--accent)' : 'var(--text-dim)',
            cursor: 'pointer',
          }}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
