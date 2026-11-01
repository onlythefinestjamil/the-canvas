import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, X, Search, RotateCw } from 'lucide-react';
import { searchHistory } from '../lib/history';
import type { HistoryEntry, GenSettings, ModelDef } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
}

export default function PromptHistory({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const results = open ? searchHistory(query) : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            className="card"
            style={{ width: 'min(640px, 92vw)', maxHeight: '88vh', overflowY: 'auto', padding: '1.2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HistoryIcon size={16} color="var(--accent)" /> Prompt history
              </h2>
              <button onClick={onClose} className="icon-btn" style={{ padding: '0.3rem' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prompts…"
                style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}
              />
            </div>

            {results.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>No history yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {results.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => { onSelect(h); onClose(); }}
                    className="card"
                    style={{ padding: '0.7rem 0.8rem', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
                  >
                    {h.resultUrl && <img src={h.resultUrl} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.prompt}</div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)', marginTop: 2 }}>{h.modelName} · {new Date(h.createdAt).toLocaleDateString()}</div>
                    </div>
                    <RotateCw size={13} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 2 }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { HistoryEntry, GenSettings, ModelDef };
