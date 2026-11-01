// Right panel: filters applied destructively to the active image layer.
import { useState } from 'react';
import { Aperture, Sparkles } from 'lucide-react';
import type { FilterType } from '../lib/filters';

interface Props {
  onApply: (filter: FilterType, amount: number) => void;
}

const FILTERS: { type: FilterType; label: string }[] = [
  { type: 'gaussian-blur', label: 'Gaussian Blur' },
  { type: 'motion-blur', label: 'Motion Blur' },
  { type: 'radial-blur', label: 'Radial Blur' },
  { type: 'sharpen', label: 'Sharpen' },
  { type: 'noise', label: 'Add Noise' },
  { type: 'pixelate', label: 'Pixelate' },
  { type: 'vignette', label: 'Vignette' },
  { type: 'glitch', label: 'Glitch' },
  { type: 'glow', label: 'Glow/Bloom' },
  { type: 'grayscale', label: 'Grayscale' },
  { type: 'sepia', label: 'Sepia' },
  { type: 'vintage', label: 'Vintage' },
];

export default function FilterPanel({ onApply }: Props) {
  const [amount, setAmount] = useState(50);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 0.9rem', borderBottom: '1px solid var(--border)' }}>
        <Aperture size={14} color="var(--accent)" />
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-dim)' }}>Filters</span>
      </div>

      <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
          <span>Amount</span>
          <span>{amount}</span>
        </div>
        <input type="range" min={1} max={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem' }}>
        {FILTERS.map((f) => (
          <button
            key={f.type}
            onClick={() => onApply(f.type, amount)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%',
              padding: '0.5rem 0.6rem', marginBottom: 3, border: '1px solid var(--border)',
              borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text)',
              cursor: 'pointer', fontSize: '0.72rem', textAlign: 'left',
              transition: 'border-color var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <Sparkles size={12} color="var(--accent)" />
            {f.label}
          </button>
        ))}
        <p style={{ fontSize: '0.6rem', color: 'var(--text-faint)', padding: '0.5rem 0.3rem', lineHeight: 1.5 }}>
          Filters apply destructively to the active image layer. Use Undo if needed.
        </p>
      </div>
    </div>
  );
}
