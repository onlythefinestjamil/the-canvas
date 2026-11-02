import { motion } from 'framer-motion';
import {
  Wand2, ShoppingBag, Music2, Sparkles, Crown, Boxes, Cpu,
  Swords, ChevronRight,
} from 'lucide-react';

export type ProductId =
  | 'canvas'
  | 'otf'
  | 'juke'
  | 'athos'
  | 'herms'
  | 'storeframe'
  | 'engine'
  | 'eclipse'
  | 'login-juke'
  | 'login-otw407'
  | 'login-stacey'
  | 'login-needles'
  | 'login-vloneki';

export interface Product {
  id: ProductId;
  name: string;
  tagline: string;
  category: string;
  icon: React.ReactNode;
  accent: string;
  status?: string;
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'canvas',
    name: 'The Canvas',
    tagline: 'AI Creative Studio — image, video, gallery, billing.',
    category: 'Flagship',
    icon: <Wand2 size={20} />,
    accent: '#7c5cff',
  },
  {
    id: 'otf',
    name: 'OTF Store',
    tagline: 'Only The Finest — luxury streetwear from West Palm Beach.',
    category: 'Commerce',
    icon: <ShoppingBag size={20} />,
    accent: '#c9a227',
    badge: '77 products',
  },
  {
    id: 'eclipse',
    name: 'Eclipse: Realms of the Fractured',
    tagline: 'Fantasy-action RPG on Unreal Engine 5. 12 classes, 300+ spells.',
    category: 'Momentum Labs',
    icon: <Swords size={20} />,
    accent: '#8b5cf6',
    status: 'Vertical slice in development',
    badge: 'Design Bible V4',
  },
  {
    id: 'juke',
    name: 'Juke',
    tagline: 'The Movement — music, culture, OTF ambassador.',
    category: 'Artist',
    icon: <Music2 size={20} />,
    accent: '#ff6b3d',
  },
  {
    id: 'athos',
    name: 'Athos Peaks',
    tagline: 'Outdoor performance apparel.',
    category: 'Commerce',
    icon: <Boxes size={20} />,
    accent: '#34d399',
  },
  {
    id: 'herms',
    name: "Herm's Heavy",
    tagline: 'Heavyweight training gear.',
    category: 'Commerce',
    icon: <Crown size={20} />,
    accent: '#f59e0b',
  },
  {
    id: 'storeframe',
    name: 'Storeframe',
    tagline: 'Headless commerce scaffolding.',
    category: 'Infra',
    icon: <Cpu size={20} />,
    accent: '#60a5fa',
  },
  {
    id: 'engine',
    name: 'The Engine Room',
    tagline: 'Internal build + ops console.',
    category: 'Infra',
    icon: <Cpu size={20} />,
    accent: '#22d3ee',
  },
];

const ARTISTS: Product[] = [
  { id: 'login-juke', name: 'Juke The Movement', tagline: 'West Palm Beach sunset · music studio', category: 'Artist Login', icon: <Music2 size={18} />, accent: '#ff6b3d' },
  { id: 'login-otw407', name: 'OTW407', tagline: 'Producer studio · BeatStars · purple', category: 'Artist Login', icon: <Cpu size={18} />, accent: '#a855f7' },
  { id: 'login-stacey', name: 'Stacey Amoy', tagline: 'Melodic R&B · soft gradients · romantic', category: 'Artist Login', icon: <Sparkles size={18} />, accent: '#f472b6' },
  { id: 'login-needles', name: 'DJ Needles', tagline: 'DJ booth · neon · turntables · 6 themes', category: 'Artist Login', icon: <Music2 size={18} />, accent: '#22d3ee' },
  { id: 'login-vloneki', name: 'Vloneki', tagline: 'Underground alt hip-hop · dark street', category: 'Artist Login', icon: <Crown size={18} />, accent: '#ef4444' },
];

interface Props {
  onOpen: (id: ProductId) => void;
}

export default function Products({ onOpen }: Props) {
  return (
    <div className="launcher">
      <header className="launcher-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, color: '#fff',
            }}
          >M</motion.div>
          <div>
            <h1 className="brand-gradient" style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              Momentum Labs
            </h1>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
              The Canvas · Product Gallery
            </p>
          </div>
        </div>
        <button className="btn ghost" onClick={() => onOpen('canvas')}>
          Open Studio <ChevronRight size={14} />
        </button>
      </header>

      <section className="launcher-section">
        <h2 className="launcher-section-title">Apps</h2>
        <div className="launcher-grid">
          {PRODUCTS.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="launcher-card"
              onClick={() => onOpen(p.id)}
              style={{ '--card-accent': p.accent } as React.CSSProperties}
            >
              <div className="launcher-card-icon">{p.icon}</div>
              <div className="launcher-card-body">
                <div className="launcher-card-top">
                  <span className="launcher-card-cat">{p.category}</span>
                  {p.badge && <span className="launcher-card-badge">{p.badge}</span>}
                </div>
                <h3 className="launcher-card-name">{p.name}</h3>
                <p className="launcher-card-tag">{p.tagline}</p>
                {p.status && <span className="launcher-card-status"><span className="status-dot running" /> {p.status}</span>}
              </div>
              <ChevronRight size={16} className="launcher-card-arrow" />
            </motion.button>
          ))}
        </div>
      </section>

      <section className="launcher-section">
        <h2 className="launcher-section-title">Artist Login Portals</h2>
        <div className="launcher-grid launcher-grid-sm">
          {ARTISTS.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.25) }}
              className="launcher-card launcher-card-sm"
              onClick={() => onOpen(p.id)}
              style={{ '--card-accent': p.accent } as React.CSSProperties}
            >
              <div className="launcher-card-icon">{p.icon}</div>
              <div className="launcher-card-body">
                <span className="launcher-card-cat">{p.category}</span>
                <h3 className="launcher-card-name">{p.name}</h3>
                <p className="launcher-card-tag">{p.tagline}</p>
              </div>
              <ChevronRight size={14} className="launcher-card-arrow" />
            </motion.button>
          ))}
        </div>
      </section>

      <footer className="launcher-foot">
        <span className="status-dot done" /> Momentum Labs · The Canvas · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
