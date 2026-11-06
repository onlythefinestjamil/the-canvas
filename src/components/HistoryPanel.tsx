// Right panel: undo/redo history list with jump-to.
import { RotateCcw, RotateCw } from 'lucide-react';
import type { HistorySnapshot } from '../lib/editor-history';

interface Props {
  history: HistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onJump: (index: number) => void;
  activeIndex: number;
}

export default function HistoryPanel({ history, canUndo, canRedo, onUndo, onRedo, onJump, activeIndex }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 0.9rem', borderBottom: '1px solid var(--border)' }}>
        <RotateCcw size={14} color="var(--accent)" />
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-dim)' }}>History</span>
        <span style={{ flex: 1 }} />
        <button className="icon-btn" style={{ padding: '0.2rem', opacity: canUndo ? 1 : 0.3 }} disabled={!canUndo} onClick={onUndo} title="Undo (Ctrl+Z)">
          <RotateCcw size={12} />
        </button>
        <button className="icon-btn" style={{ padding: '0.2rem', opacity: canRedo ? 1 : 0.3 }} disabled={!canRedo} onClick={onRedo} title="Redo (Ctrl+Shift+Z)">
          <RotateCw size={12} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.3rem' }}>
        {history.map((h, i) => (
          <div
            key={h.id}
            onClick={() => onJump(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.35rem 0.5rem', borderRadius: 6, marginBottom: 2,
              background: i === activeIndex ? 'var(--surface-3)' : 'transparent',
              cursor: 'pointer', border: i === activeIndex ? '1px solid var(--border-bright)' : '1px solid transparent',
              opacity: i > activeIndex ? 0.4 : 1,
            }}
          >
            <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', minWidth: 18 }}>{i + 1}</span>
            <span style={{ fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.label}</span>
          </div>
        ))}
        {history.length === 0 && (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', padding: '0.6rem' }}>No history yet</p>
        )}
      </div>
    </div>
  );
}
