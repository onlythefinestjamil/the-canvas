import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IMAGE_MODELS, VIDEO_MODELS } from '../lib/models';
import type { ModelDef } from '../types';

interface Props {
  value: ModelDef;
  onChange: (m: ModelDef) => void;
}

export default function ModelSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'image' | 'video'>(value.category);

  const list = tab === 'image' ? IMAGE_MODELS : VIDEO_MODELS;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="icon-btn"
        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: value.accent,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>{value.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{value.provider}</div>
        </div>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {value.category}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', transition: 'transform var(--transition)', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="card"
              style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100, padding: '0.5rem' }}
            >
              <div className="seg" style={{ marginBottom: '0.4rem' }}>
                {(['image', 'video'] as const).map((t) => (
                  <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
                    {t}
                  </button>
                ))}
              </div>
              {list.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onChange(m);
                    setTab(m.category);
                    setOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    width: '100%',
                    padding: '0.55rem 0.6rem',
                    background: value.id === m.id ? 'var(--surface-2)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.accent, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>{m.description}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
