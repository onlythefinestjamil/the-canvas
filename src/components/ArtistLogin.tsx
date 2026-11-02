import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, LogIn, Music2, Cpu, Sparkles, Disc3, Crown, Waves, Mic2, Headphones,
} from 'lucide-react';

export type ArtistId = 'juke' | 'otw407' | 'stacey' | 'needles' | 'vloneki';

interface ArtistConfig {
  id: ArtistId;
  name: string;
  subtitle: string;
  tagline: string;
  icon: React.ReactNode;
  /** CSS background applied to the full-bleed panel. */
  background: string;
  /** Overlay gradient for legibility. */
  overlay: string;
  /** Accent color used across form controls + glow. */
  accent: string;
  /** Secondary accent. */
  accent2: string;
  /** Extra visual elements rendered behind the form (artist-specific). */
  decor?: React.ReactNode;
}

const NEEDLE_THEMES = ['Purple', 'Red', 'Minimal Black', 'Luxury Gold', 'Studio Mode', 'Cosmic'];

export const ARTISTS: Record<ArtistId, ArtistConfig> = {
  juke: {
    id: 'juke',
    name: 'Juke The Movement',
    subtitle: 'West Palm Beach · Music · Culture',
    tagline: 'Worn in every video. Built on the corner.',
    icon: <Music2 size={20} />,
    background:
      'linear-gradient(to bottom, #1a0f2e 0%, #3b1d4b 18%, #ff6b3d 55%, #ffb05a 72%, #2d6f8f 100%)',
    overlay: 'linear-gradient(120deg, rgba(13,8,20,0.45) 0%, rgba(13,8,20,0.15) 45%, rgba(13,8,20,0.7) 100%)',
    accent: '#ff8a5c',
    accent2: '#ffd28a',
    decor: (
      <>
        {/* water reflections */}
        <div className="al-water" />
        <div className="al-water al-water-2" />
        {/* studio vibe: pulsing waveform */}
        <div className="al-wave">
          {Array.from({ length: 32 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${(i % 8) * 0.12}s` }} />
          ))}
        </div>
      </>
    ),
  },
  otw407: {
    id: 'otw407',
    name: 'OTW407',
    subtitle: 'Producer Studio · BeatStars',
    tagline: 'Beats from the 407. Sold worldwide.',
    icon: <Cpu size={20} />,
    background:
      'radial-gradient(circle at 30% 20%, #2a1145 0%, #14082a 45%, #08040f 100%)',
    overlay: 'linear-gradient(135deg, rgba(20,8,42,0.3) 0%, rgba(8,4,15,0.7) 100%)',
    accent: '#a855f7',
    accent2: '#d946ef',
    decor: (
      <>
        {/* beat grid */}
        <div className="al-beatgrid">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} style={{ opacity: 0.08 + (i % 4) * 0.05 }} />
          ))}
        </div>
        <div className="al-beatstars">BeatStars</div>
      </>
    ),
  },
  stacey: {
    id: 'stacey',
    name: 'Stacey Amoy',
    subtitle: 'Melodic R&B · Romantic · Arty',
    tagline: 'Soft songs for late nights.',
    icon: <Sparkles size={20} />,
    background:
      'linear-gradient(135deg, #2a1a2e 0%, #4a2540 25%, #c4578a 60%, #6b3a6e 100%)',
    overlay: 'linear-gradient(135deg, rgba(40,20,40,0.2) 0%, rgba(40,20,40,0.5) 100%)',
    accent: '#f472b6',
    accent2: '#fbb6ce',
    decor: (
      <>
        <div className="al-petals">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} style={{ '--px': `${(i * 37) % 100}%`, '--d': `${i * 0.6}s` } as React.CSSProperties} />
          ))}
        </div>
      </>
    ),
  },
  needles: {
    id: 'needles',
    name: 'DJ Needles',
    subtitle: 'Needles Radio · 6 Visual Themes',
    tagline: 'Two turntables. One frequency.',
    icon: <Disc3 size={20} />,
    background:
      'radial-gradient(circle at 50% 30%, #0a1124 0%, #050811 60%, #02040a 100%)',
    overlay: 'linear-gradient(135deg, rgba(5,8,17,0.2) 0%, rgba(2,4,10,0.7) 100%)',
    accent: '#22d3ee',
    accent2: '#a855f7',
    decor: (
      <>
        <div className="al-deck al-deck-l">
          <div className="al-platter" />
          <div className="al-platter-core" />
        </div>
        <div className="al-deck al-deck-r">
          <div className="al-platter" />
          <div className="al-platter-core" />
        </div>
        <div className="al-neon">NEEDLES · RADIO</div>
      </>
    ),
  },
  vloneki: {
    id: 'vloneki',
    name: 'Vloneki',
    subtitle: 'Underground · Alt Hip-Hop',
    tagline: 'From the underground, up.',
    icon: <Crown size={20} />,
    background:
      'linear-gradient(160deg, #0d0d0f 0%, #181013 40%, #2a0a0a 70%, #0d0d0f 100%)',
    overlay: 'linear-gradient(135deg, rgba(13,13,15,0.3) 0%, rgba(13,13,15,0.65) 100%)',
    accent: '#ef4444',
    accent2: '#7f1d1d',
    decor: (
      <>
        <div className="al-concrete" />
        <div className="al-vlone">V*</div>
      </>
    ),
  },
};

interface Props {
  artist: ArtistId;
  onBack: () => void;
}

export default function ArtistLogin({ artist, onBack }: Props) {
  const cfg = ARTISTS[artist];
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [needleTheme, setNeedleTheme] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // demo auth only
    console.log('artist login', cfg.id, mode);
  };

  return (
    <div
      className="al-root"
      style={{ '--accent': cfg.accent, '--accent-2': cfg.accent2 } as React.CSSProperties}
    >
      {/* Background */}
      <div className="al-bg" style={{ background: cfg.background }} />
      <div className="al-overlay" style={{ background: cfg.overlay }} />
      {cfg.decor}

      {/* Top bar */}
      <div className="al-topbar">
        <button className="al-back" onClick={onBack}>← The Canvas</button>
        <div className="al-topbrand">
          {cfg.icon}
          <span>{cfg.name}</span>
        </div>
      </div>

      {/* Needle theme switcher */}
      {artist === 'needles' && (
        <div className="al-themes">
          {NEEDLE_THEMES.map((t, i) => (
            <button
              key={t}
              className={needleTheme === i ? 'active' : ''}
              onClick={() => setNeedleTheme(i)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="al-card"
      >
        <div className="al-card-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${cfg.accent}33, transparent 70%)` }} />
        <div className="al-card-head">
          <div className="al-card-icon">{cfg.icon}</div>
          <div>
            <h2>{cfg.name}</h2>
            <span>{cfg.subtitle}</span>
          </div>
        </div>
        <p className="al-tagline">{cfg.tagline}</p>

        <div className="al-seg">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign up</button>
        </div>

        <form onSubmit={submit} className="al-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <button type="submit" className="al-submit">
            <LogIn size={15} /> {mode === 'login' ? 'Enter the studio' : 'Create account'}
          </button>
        </form>

        <div className="al-divider"><span>or continue with</span></div>
        <div className="al-oauth">
          <button><Music2 size={15} /> BeatStars</button>
          <button><Headphones size={15} /> Spotify</button>
          <button><Mic2 size={15} /> Google</button>
        </div>

        <button className="al-close" onClick={onBack}><X size={16} /></button>
      </motion.div>

      <footer className="al-foot">
        {cfg.name} · {cfg.subtitle} · A Momentum Labs artist portal inside The Canvas
      </footer>
    </div>
  );
}
