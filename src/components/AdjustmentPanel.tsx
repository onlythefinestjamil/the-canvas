// Right panel: adjustment layer creation + parameter sliders.
import { useState } from 'react';
import { Sliders, Plus } from 'lucide-react';
import type { AdjustmentType, AdjustmentLayerData } from '../lib/layers';

interface Props {
  active: AdjustmentLayerData | null;
  onCreate: (type: AdjustmentType) => void;
  onParam: (id: string, key: string, value: number) => void;
}

const ADJUSTMENTS: { type: AdjustmentType; label: string }[] = [
  { type: 'brightness-contrast', label: 'Brightness/Contrast' },
  { type: 'hue-saturation', label: 'Hue/Saturation' },
  { type: 'color-balance', label: 'Color Balance' },
  { type: 'levels', label: 'Levels' },
  { type: 'curves', label: 'Curves' },
  { type: 'vibrance', label: 'Vibrance' },
  { type: 'temperature', label: 'Temperature/Tint' },
  { type: 'invert', label: 'Invert' },
  { type: 'sepia', label: 'Sepia' },
  { type: 'grayscale', label: 'Grayscale' },
];

const PARAM_DEFS: Record<AdjustmentType, { key: string; label: string; min: number; max: number }[]> = {
  'brightness-contrast': [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
  ],
  'hue-saturation': [
    { key: 'hue', label: 'Hue', min: -180, max: 180 },
    { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
    { key: 'lightness', label: 'Lightness', min: -100, max: 100 },
  ],
  'color-balance': [
    { key: 'red', label: 'Red', min: -100, max: 100 },
    { key: 'green', label: 'Green', min: -100, max: 100 },
    { key: 'blue', label: 'Blue', min: -100, max: 100 },
  ],
  levels: [
    { key: 'inBlack', label: 'Black', min: 0, max: 254 },
    { key: 'inWhite', label: 'White', min: 1, max: 255 },
    { key: 'gamma', label: 'Gamma', min: 0.1, max: 3 },
  ],
  curves: [
    { key: 'black', label: 'Black', min: 0, max: 254 },
    { key: 'white', label: 'White', min: 1, max: 255 },
    { key: 'mid', label: 'Mid', min: 0, max: 255 },
  ],
  vibrance: [{ key: 'amount', label: 'Amount', min: -100, max: 100 }],
  temperature: [
    { key: 'temperature', label: 'Temperature', min: -100, max: 100 },
    { key: 'tint', label: 'Tint', min: -100, max: 100 },
  ],
  invert: [],
  sepia: [{ key: 'amount', label: 'Amount', min: 0, max: 100 }],
  grayscale: [{ key: 'amount', label: 'Amount', min: 0, max: 100 }],
};

export default function AdjustmentPanel({ active, onCreate, onParam }: Props) {
  const [showList, setShowList] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 0.9rem', borderBottom: '1px solid var(--border)' }}>
        <Sliders size={14} color="var(--accent)" />
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-dim)' }}>Adjustments</span>
        <span style={{ flex: 1 }} />
        <button className="icon-btn" style={{ padding: '0.25rem' }} title="Add adjustment" onClick={() => setShowList((s) => !s)}>
          <Plus size={13} />
        </button>
      </div>

      {showList && (
        <div style={{ padding: '0.4rem', borderBottom: '1px solid var(--border)', maxHeight: 200, overflowY: 'auto' }}>
          {ADJUSTMENTS.map((a) => (
            <button
              key={a.type}
              onClick={() => { onCreate(a.type); setShowList(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.4rem 0.6rem', border: 'none', background: 'transparent',
                color: 'var(--text)', cursor: 'pointer', fontSize: '0.72rem', borderRadius: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.8rem' }}>
        {active ? (
          <>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.6rem', textTransform: 'capitalize' }}>{active.adjustment.replace(/-/g, ' ')}</p>
            {PARAM_DEFS[active.adjustment].map((p) => (
              <div key={p.key} style={{ marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                  <span>{p.label}</span>
                  <span>{(active.params[p.key] ?? 0).toFixed(p.key === 'gamma' ? 2 : 0)}</span>
                </div>
                <input
                  type="range" min={p.min} max={p.max} step={p.key === 'gamma' ? 0.05 : 1}
                  value={active.params[p.key] ?? 0}
                  onChange={(e) => onParam(active.id, p.key, Number(e.target.value))}
                />
              </div>
            ))}
            {PARAM_DEFS[active.adjustment].length === 0 && (
              <p style={{ fontSize: '0.66rem', color: 'var(--text-faint)' }}>No parameters — applies instantly.</p>
            )}
          </>
        ) : (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Select an adjustment layer, or add a new one.</p>
        )}
      </div>
    </div>
  );
}
