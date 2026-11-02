import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Key, X, Eye, EyeOff } from 'lucide-react';
import { MODELS } from '../lib/models';
import { PLANS } from '../lib/billing';
import { isElite } from './BrandMark';
import waveIcon from '../../assets/brand/canvas-icon-wave.png';
import ribbonHero from '../../assets/brand/canvas-hero-ribbon.png';
import type { Settings, Plan } from '../types';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  plan: Plan;
  onSelectPlan: (p: Plan) => void;
}

const PROVIDER_KEYS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'stability', label: 'Stability AI' },
  { id: 'midjourney', label: 'Midjourney' },
  { id: 'blackforest', label: 'Black Forest Labs (Flux)' },
  { id: 'google', label: 'Google (Imagen)' },
  { id: 'runway', label: 'Runway' },
  { id: 'pika', label: 'Pika' },
  { id: 'bytedance', label: 'ByteDance (Seedance)' },
  { id: 'kuaishou', label: 'Kuaishou (Kling)' },
  { id: 'minimax', label: 'MiniMax' },
];

export default function SettingsPanel({ settings, onSave, plan, onSelectPlan }: Props) {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<Record<string, string>>(settings.apiKeys);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    onSave({ ...settings, apiKeys: keys });
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="icon-btn">
        <SettingsIcon size={14} />
        Settings
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              transition={{ duration: 0.18 }}
              className="card"
              style={{ width: 'min(560px, 92vw)', maxHeight: '88vh', overflowY: 'auto', padding: '1.4rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Key size={16} color="var(--accent)" /> Settings
                </h2>
                <button onClick={() => setOpen(false)} className="icon-btn" style={{ padding: '0.3rem' }}>
                  <X size={15} />
                </button>
              </div>

              <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '0.9rem' }}>
                Keys are stored locally and sent only to the provider you call.
              </p>

              {PROVIDER_KEYS.map((p) => (
                <div key={p.id} style={{ marginBottom: '0.6rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>{p.label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input
                      type={visible[p.id] ? 'text' : 'password'}
                      value={keys[p.id] || ''}
                      placeholder="API key"
                      onChange={(e) => setKeys((k) => ({ ...k, [p.id]: e.target.value }))}
                      style={{ flex: 1, padding: '0.5rem 0.7rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'var(--mono)' }}
                    />
                    <button onClick={() => setVisible((v) => ({ ...v, [p.id]: !v[p.id] }))} className="icon-btn" style={{ padding: '0.5rem' }}>
                      {visible[p.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ height: 1, background: 'var(--border)', margin: '1rem 0' }} />

              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={isElite(plan) ? ribbonHero : waveIcon}
                  alt={isElite(plan) ? 'ELITE tier mark' : 'REGULAR tier mark'}
                  style={{ width: 20, height: 20, borderRadius: 5 }}
                />
                Plan {isElite(plan) && (
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0b0f0e', background: 'linear-gradient(90deg, #b8c4c2, #8fe8d4)', borderRadius: 4, padding: '2px 6px' }}>
                    Elite member
                  </span>
                )}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlan(p.id)}
                    className="card"
                    style={{ flex: 1, minWidth: 130, padding: '0.8rem', textAlign: 'left', cursor: 'pointer', borderColor: plan === p.id ? 'var(--accent)' : undefined }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 2 }}>{p.priceLabel}<span style={{ fontSize: '0.62rem', fontWeight: 500, color: 'var(--text-dim)' }}>/mo</span></div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{p.blurb}</div>
                    {plan === p.id && <div style={{ fontSize: '0.62rem', color: 'var(--accent)', marginTop: '0.3rem', fontWeight: 600 }}>Current plan</div>}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.2rem', gap: '0.6rem' }}>
                <button onClick={() => setOpen(false)} className="btn ghost">Cancel</button>
                <button onClick={handleSave} className="btn">Save</button>
              </div>

              <div style={{ marginTop: '0.8rem', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                {MODELS.length} models · keys & plan stored locally for this demo build.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
