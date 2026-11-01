import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { IMAGE_MODELS, VIDEO_MODELS } from '../lib/models';
import type { ModelDef } from '../types';

interface Props {
  value: ModelDef;
  onChange: (m: ModelDef) => void;
}

export default function ModelSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'image' | 'video'>('image');

  const list = tab === 'image' ? IMAGE_MODELS : VIDEO_MODELS;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          width: '100%',
          padding: '0.7rem 1rem',
          background: 'rgba(10,10,18,0.6)',
          border: `1px solid ${value.accent}55`,
          borderRadius: 8,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: value.accent,
            boxShadow: `0 0 10px ${value.accent}`,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{value.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{value.provider}</div>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {value.category}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▼
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 100,
              padding: '0.5rem',
              maxHeight: 380,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {(['image', 'video'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: '0.35rem',
                    borderRadius: 6,
                    border: 'none',
                    background: tab === t ? 'rgba(145,70,255,0.25)' : 'transparent',
                    color: tab === t ? 'var(--text)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                  }}
                >
                  {t} models
                </button>
              ))}
            </div>
            {list.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChange(m);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  width: '100%',
                  padding: '0.6rem 0.7rem',
                  background: value.id === m.id ? 'rgba(145,70,255,0.12)' : 'transparent',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 2,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.accent, boxShadow: `0 0 8px ${m.accent}`, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>{m.description}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
