import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LogIn } from 'lucide-react';
import { signUp, logIn } from '../lib/auth';
import { PLANS } from '../lib/billing';
import type { AuthUser, Plan } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAuth: (u: AuthUser) => void;
}

export default function Auth({ open, onClose, onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<Plan>('free');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const u = mode === 'signup' ? signUp(email, password) : logIn(email, password);
      onAuth(u);
      onClose();
    } catch (err) {
      setError(String((err as Error).message || err));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            className="card"
            style={{ width: 'min(420px, 92vw)', padding: '1.6rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--accent)" /> {mode === 'signup' ? 'Create account' : 'Welcome back'}
              </h2>
              <button onClick={onClose} className="icon-btn" style={{ padding: '0.3rem' }}>
                <X size={15} />
              </button>
            </div>

            <div className="seg" style={{ marginBottom: '1rem' }}>
              <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign up</button>
              <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                style={{ padding: '0.6rem 0.8rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.86rem' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{ padding: '0.6rem 0.8rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.86rem' }}
              />

              {mode === 'signup' && (
                <div>
                  <label style={{ fontSize: '0.66rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Choose a plan</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {PLANS.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPlan(p.id)}
                        className="card"
                        style={{ flex: 1, padding: '0.5rem', textAlign: 'center', cursor: 'pointer', borderColor: plan === p.id ? 'var(--accent)' : undefined }}
                      >
                        <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{p.priceLabel}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p style={{ fontSize: '0.72rem', color: '#f87171' }}>{error}</p>}

              <button type="submit" className="btn" style={{ justifyContent: 'center', marginTop: '0.2rem' }}>
                <LogIn size={14} /> {mode === 'signup' ? 'Create account' : 'Log in'}
              </button>
            </form>

            <p style={{ marginTop: '0.8rem', fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Demo auth — credentials & plan are stored locally.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
