// Right panel: layers list with visibility, opacity, blend modes, reorder, add/delete/duplicate.
import { useState } from 'react';
import {
  Eye, EyeOff, Plus, Trash2, Copy, Lock, Unlock,
  ChevronUp, ChevronDown, Image as ImageIcon, Type, Square,
  Sliders, Layers as LayersIcon,
} from 'lucide-react';
import type { Layer, BlendMode, LayerType } from '../lib/layers';
import { BLEND_MODES } from '../lib/layers';

interface Props {
  layers: Layer[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onToggleLock: (id: string) => void;
  onOpacity: (id: string, opacity: number) => void;
  onBlend: (id: string, mode: BlendMode) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onAdd: (type: LayerType) => void;
  onRename: (id: string, name: string) => void;
}

function layerIcon(type: LayerType) {
  switch (type) {
    case 'image':
    case 'background':
      return <ImageIcon size={11} />;
    case 'text':
      return <Type size={11} />;
    case 'shape':
      return <Square size={11} />;
    case 'adjustment':
      return <Sliders size={11} />;
    default:
      return <LayersIcon size={11} />;
  }
}

export default function LayerPanel(props: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // layers[0] is bottom; display top-down so reverse
  const ordered = [...props.layers].reverse();
  const active = props.layers.find((l) => l.id === props.activeId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 0.9rem', borderBottom: '1px solid var(--border)' }}>
        <LayersIcon size={14} color="var(--accent)" />
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-dim)' }}>Layers</span>
        <span style={{ flex: 1 }} />
        <button className="icon-btn" style={{ padding: '0.25rem' }} title="Duplicate" onClick={() => active && props.onDuplicate(active.id)}>
          <Copy size={13} />
        </button>
        <button className="icon-btn" style={{ padding: '0.25rem' }} title="Delete" onClick={() => active && props.onDelete(active.id)}>
          <Trash2 size={13} />
        </button>
      </div>

      {/* Layer list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.3rem' }}>
        {ordered.map((layer) => {
          const idx = props.layers.length - 1 - ordered.indexOf(layer);
          const isActive = layer.id === props.activeId;
          return (
            <div
              key={layer.id}
              draggable
              onDragStart={() => setDragIndex(ordered.indexOf(layer))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) {
                  const fromReal = props.layers.length - 1 - dragIndex;
                  const toReal = props.layers.length - 1 - ordered.indexOf(layer);
                  props.onReorder(fromReal, toReal);
                  setDragIndex(null);
                }
              }}
              onClick={() => props.onSelect(layer.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.4rem',
                borderRadius: 6,
                marginBottom: 2,
                background: isActive ? 'var(--surface-3)' : 'transparent',
                cursor: 'pointer',
                border: isActive ? '1px solid var(--border-bright)' : '1px solid transparent',
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); props.onToggleVisible(layer.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2 }}
              >
                {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <span style={{ color: 'var(--text-dim)' }}>{layerIcon(layer.type)}</span>
              <span
                style={{ fontSize: '0.72rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => props.onRename(layer.id, e.currentTarget.textContent || layer.name)}
              >
                {layer.name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); props.onToggleLock(layer.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: layer.locked ? 'var(--accent)' : 'var(--text-faint)', padding: 2 }}
              >
                {layer.locked ? <Lock size={11} /> : <Unlock size={11} />}
              </button>
            </div>
          );
        })}
        {props.layers.length === 0 && (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', padding: '0.6rem' }}>No layers</p>
        )}
      </div>

      {/* Blend + opacity controls for active layer */}
      {active && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', minWidth: 38 }}>Blend</span>
            <select
              value={active.blendMode}
              onChange={(e) => props.onBlend(active.id, e.target.value as BlendMode)}
              style={{
                flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--text)', fontSize: '0.7rem', padding: '0.3rem 0.4rem',
              }}
            >
              {BLEND_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', minWidth: 38 }}>Opacity</span>
            <input
              type="range" min={0} max={100} value={active.opacity}
              onChange={(e) => props.onOpacity(active.id, Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', minWidth: 28 }}>{active.opacity}%</span>
          </div>
        </div>
      )}

      {/* Add layer buttons */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 0.7rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        <AddBtn icon={<ImageIcon size={12} />} label="Image" onClick={() => props.onAdd('image')} />
        <AddBtn icon={<Type size={12} />} label="Text" onClick={() => props.onAdd('text')} />
        <AddBtn icon={<Square size={12} />} label="Shape" onClick={() => props.onAdd('shape')} />
        <AddBtn icon={<Sliders size={12} />} label="Adj" onClick={() => props.onAdd('adjustment')} />
      </div>
    </div>
  );
}

function AddBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.3rem 0.5rem', border: '1px solid var(--border)', borderRadius: 6,
        background: 'var(--surface-2)', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.64rem',
      }}
    >
      {icon} {label}
      <Plus size={10} />
    </button>
  );
}
