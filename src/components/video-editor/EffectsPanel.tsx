// Effects library panel — apply filter presets and LUTs to the selected clip.
import { FILTER_PRESETS, LUTS } from '../../lib/video/effects';
import type { Clip } from '../../lib/video/types';

interface Props {
  selectedClip: Clip | null;
  onApplyFilter: (clipId: string, filterId: string, name: string) => void;
  onApplyLut: (clipId: string, lutId: string) => void;
  onRemoveFilter: (clipId: string, filterId: string) => void;
}

export default function EffectsPanel({ selectedClip, onApplyFilter, onApplyLut, onRemoveFilter }: Props) {
  if (!selectedClip) {
    return (
      <div style={{ padding: '0.7rem', fontSize: '0.62rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        Select a clip to apply effects.
      </div>
    );
  }
  const active = new Set(selectedClip.effects.filters.map((f) => f.id));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-2)', overflow: 'hidden' }}>
      <div style={{ padding: '0.5rem 0.7rem', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>Effects Library</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        <h4 style={h4}>Filter Presets</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: '0.8rem' }}>
          {FILTER_PRESETS.map((f) => {
            const on = active.has(f.id);
            return (
              <button
                key={f.id}
                className="btn ghost"
                style={{ padding: '0.3rem', fontSize: '0.6rem', justifyContent: 'center', background: on ? 'rgba(124,92,255,0.2)' : undefined, borderColor: on ? 'var(--accent)' : undefined }}
                onClick={() => (on ? onRemoveFilter(selectedClip.id, f.id) : onApplyFilter(selectedClip.id, f.id, f.name))}
              >
                {f.name}
              </button>
            );
          })}
        </div>
        <h4 style={h4}>Color LUTs</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {LUTS.map((l) => (
            <button key={l.id} className="btn ghost" style={{ padding: '0.3rem', fontSize: '0.6rem', justifyContent: 'center' }} onClick={() => onApplyLut(selectedClip.id, l.id)}>{l.name}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const h4: React.CSSProperties = {
  fontSize: '0.6rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-dim)',
  fontWeight: 600,
  margin: '0 0 0.4rem',
};
