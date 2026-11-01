// Transitions library panel — drag/apply transitions between clips.
import { TRANSITIONS, makeTransition } from '../../lib/video/transitions';
import type { Clip, TransitionType } from '../../lib/video/types';

interface Props {
  selectedClip: Clip | null;
  onApply: (clipId: string, where: 'in' | 'out', type: TransitionType) => void;
}

const GROUP_COLORS = { dissolve: '#7c5cff', fade: '#5b8cff', wipe: '#34d399', motion: '#fbbf24', stylized: '#ec4899' } as const;

export default function TransitionsPanel({ selectedClip, onApply }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-2)', overflow: 'hidden' }}>
      <div style={{ padding: '0.5rem 0.7rem', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>Transitions</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {!selectedClip ? (
          <p style={{ fontSize: '0.62rem', color: 'var(--text-faint)', padding: '0.4rem' }}>Select a clip to apply a transition.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
            {TRANSITIONS.map((tr) => (
              <div key={tr.type} style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--surface)' }}>
                <div style={{ height: 28, background: `linear-gradient(135deg, ${GROUP_COLORS[tr.group]}33, ${GROUP_COLORS[tr.group]}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.5rem', color: GROUP_COLORS[tr.group], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tr.group}</span>
                </div>
                <div style={{ padding: '0.3rem', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>{tr.label}</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <button className="btn ghost" style={{ flex: 1, padding: '0.2rem', fontSize: '0.55rem', justifyContent: 'center' }} onClick={() => onApply(selectedClip.id, 'in', tr.type)}>In</button>
                    <button className="btn ghost" style={{ flex: 1, padding: '0.2rem', fontSize: '0.55rem', justifyContent: 'center' }} onClick={() => onApply(selectedClip.id, 'out', tr.type)}>Out</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

void makeTransition;
