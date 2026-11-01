import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Key, X, Eye, EyeOff } from 'lucide-react';
import { MODELS } from '../lib/models';
import type { Settings } from '../types';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
}

const PROVIDER_KEYS = [
  { id: 'openai', label: 'OpenAI', placeholder: 'sk-…' },
  { id: 'stability', label: 'Stability AI', placeholder: 'sk-…' },
  { id: 'midjourney', label: 'Midjourney', placeholder: 'mj-…' },
  { id: 'blackforest', label: 'Black Forest Labs', placeholder: 'sk-…' },
  { id: 'google', label: 'Google (Imagen)', placeholder: 'AIza…' },
  { id: 'runway', label: 'Runway', placeholder: 'rw-…' },
  { id: 'pika', label: 'Pika', placeholder: 'pk-…' },
  { id: 'bytedance', label: 'ByteDance (Seedance)', placeholder: 'bd-…' },
  { id: 'kuaishou', label: 'Kuaishou (Kling)', placeholder: 'ks-…' },
  { id: 'minimax', label: 'MiniMax', placeholder: 'mm-…' },
];

export default function SettingsPanel({ settings, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<Record<string, string>>(settings.apiKeys);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    onSave({ ...settings, apiKeys: keys });
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass"
        style={{
          padding: '0.5rem 0.8rem',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          border: '1px solid var(--border)',
          fontSize: '0.78rem',
        }}
      >
        <SettingsIcon size={14} color="var(--cyan)" />
        Settings
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,5,9,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              style={{ width: 540, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto', padding: '1.5rem', position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="bracket tl" />
              <span className="bracket tr" />
              <span className="bracket bl" />
              <span className="bracket br" />

              <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <Key size={18} color="var(--purple)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>API Keys</h2>
              </div>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                Keys are stored locally in your browser/Electron and never sent to any server except the provider you call.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {PROVIDER_KEYS.map((p) => (
                  <div key={p.id}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>{p.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type={visible[p.id] ? 'text' : 'password'}
                        value={keys[p.id] || ''}
                        placeholder={p.placeholder}
                        onChange={(e) => setKeys((k) => ({ ...k, [p.id]: e.target.value }))}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.7rem',
                          background: 'rgba(5,5,9,0.7)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontFamily: 'var(--mono)',
                        }}
                      />
                      <button onClick={() => setVisible((v) => ({ ...v, [p.id]: !v[p.id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
                        {visible[p.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.2rem', gap: '0.6rem' }}>
                <button onClick={() => setOpen(false)} className="glow-btn" style={{ ['--accent' as string]: 'var(--text-dim)' }}>
                  Cancel
                </button>
                <button onClick={handleSave} className="glow-btn">
                  Save Keys
                </button>
              </div>

              <div style={{ marginTop: '1rem', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                {MODELS.length} models supported across image & video providers.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
