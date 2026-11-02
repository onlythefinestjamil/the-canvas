import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Instagram, Star, Crown, Flame, Leaf, Cherry,
  Users, User, Check, ArrowRight, Quote, MapPin,
} from 'lucide-react';

type View = { view: 'otf' };

interface Props {
  onBack: () => void;
}

const COLLECTIONS = [
  { id: 'heat', name: 'Heat Index', icon: <Flame size={18} />, count: 14, desc: 'Summer-weight tees, mesh shorts, and the drops that move fastest.', tone: '#ff6b3d' },
  { id: 'harvest', name: 'Harvest Gold', icon: <Leaf size={18} />, count: 9, desc: 'Autumn tracksuits and heavyweight fleece in ochre + bone.', tone: '#c9a227' },
  { id: 'corner', name: 'Corner Kings', icon: <Crown size={18} />, count: 11, desc: 'Street-corner silhouettes. Tailored joggers, structured jackets.', tone: '#8b6f3f' },
  { id: 'sakura', name: 'Sakura Blossoms', icon: <Cherry size={18} />, count: 8, desc: 'Spring capsule. Petal embroidery, blush knits, sakura camo.', tone: '#f472b6' },
  { id: 'juke', name: 'Juke Merch', icon: <ShoppingBag size={18} />, count: 12, desc: 'Official Juke The Movement collabs. Worn in every video.', tone: '#ff6b3d' },
  { id: 'women', name: "Women's Tracksuits", icon: <User size={18} />, count: 13, desc: '12+ colorways. Tailored fit, premium French terry.', tone: '#e879c4' },
  { id: 'men', name: "Men's Tracksuits", icon: <Users size={18} />, count: 10, desc: 'Relaxed and tapered cuts. Heavyweight cotton blends.', tone: '#3b82f6' },
];

const HIGHLIGHTS = [
  { name: 'Sakura Bomber Jacket', coll: 'Sakura Blossoms', price: '$148', tag: 'New' },
  { name: 'Harvest Gold Tracksuit', coll: 'Harvest Gold', price: '$210', tag: 'Bestseller' },
  { name: 'Juke Signature Tee', coll: 'Juke Merch', price: '$52', tag: 'Juke wore it' },
  { name: 'Heat Mesh Shorts', coll: 'Heat Index', price: '$64', tag: 'Restock' },
];

const REVIEWS = [
  { name: 'Marcus T.', city: 'West Palm Beach', text: 'The Harvest Gold tracksuit is the heaviest, best-stitched piece I own. Worth every cent.', stars: 5 },
  { name: 'Aaliyah R.', city: 'Atlanta', text: 'Sakura Bomber turns heads every time. OTF nails the fit AND the fabric.', stars: 5 },
  { name: 'Devin K.', city: 'Miami', text: "Juke put me on. Now my whole rotation is Only The Finest. Men's tracksuits are unreal.", stars: 5 },
];

const TIERS = [
  {
    id: 'inner', name: 'Inner Circle', price: 'Free', priceSub: '/mo',
    perks: ['Early-access alerts', 'Members-only drops preview', 'Free shipping over $100'],
    accent: '#c9a227',
    featured: false,
  },
  {
    id: 'otf', name: 'OTF Member', price: '$9.99', priceSub: '/mo',
    perks: ['Free shipping on all orders', '10% off every drop', 'Monthly members-only piece', 'Priority restock access'],
    accent: '#ff6b3d',
    featured: true,
  },
  {
    id: 'founding', name: 'Founding Tier', price: '$24.99', priceSub: '/mo',
    perks: ['Everything in OTF Member', '20% off all drops', 'Quarterly limited-edition piece', 'Founders-only events in WPB', 'Direct line to the design team'],
    accent: '#8b6f3f',
    featured: false,
  },
];

const IG_POSTS = [
  '#c9a227', '#8b6f3f', '#f472b6', '#ff6b3d', '#3b82f6', '#1a1a1a',
];

export default function OTFHomePage({ onBack }: Props) {
  const [tier, setTier] = useState('otf');

  return (
    <div className="otf">
      {/* NAV */}
      <nav className="otf-nav">
        <div className="otf-nav-brand">
          <span className="otf-mark">OTF</span>
          <span className="otf-nav-sub">Only The Finest</span>
        </div>
        <div className="otf-nav-links">
          <a>Shop</a>
          <a>Collections</a>
          <a>Membership</a>
          <a>Juke</a>
          <a>Our Story</a>
        </div>
        <div className="otf-nav-actions">
          <button className="otf-ghost" onClick={onBack}>← Back to The Canvas</button>
          <button className="otf-cta"><ShoppingBag size={15} /> Cart · 0</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="otf-hero">
        <div className="otf-hero-bg" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="otf-hero-content"
        >
          <span className="otf-eyebrow"><MapPin size={13} /> West Palm Beach, FL · Est. 2023</span>
          <h1 className="otf-hero-title">
            Only The Finest.<br />
            <span className="otf-gold">Luxury streetwear, lifestyle & sound.</span>
          </h1>
          <p className="otf-hero-sub">
            77 pieces. 7 collections. One identity: the culture between the corner and the
            studio. Worn by Juke in every video. Built in West Palm Beach.
          </p>
          <div className="otf-hero-btns">
            <button className="otf-cta-lg">Shop the drop <ArrowRight size={16} /></button>
            <button className="otf-ghost-lg">Explore collections</button>
          </div>
          <div className="otf-hero-stats">
            <div><strong>77</strong><span>products</span></div>
            <div><strong>7</strong><span>collections</span></div>
            <div><strong>4.9★</strong><span>1,200+ reviews</span></div>
            <div><strong>WPB</strong><span>built local</span></div>
          </div>
        </motion.div>
      </section>

      {/* COLLECTIONS */}
      <section className="otf-section">
        <div className="otf-section-head">
          <h2>Featured Collections</h2>
          <p>Seven capsules, one standard. Heavyweight fabrics, considered cuts, West Palm Beach color.</p>
        </div>
        <div className="otf-coll-grid">
          {COLLECTIONS.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="otf-coll-card"
              style={{ '--tone': c.tone } as React.CSSProperties}
            >
              <div className="otf-coll-icon">{c.icon}</div>
              <div className="otf-coll-meta">
                <h3>{c.name}</h3>
                <span>{c.count} pieces</span>
              </div>
              <p className="otf-coll-desc">{c.desc}</p>
              <span className="otf-coll-cta">Shop {c.name} <ArrowRight size={13} /></span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* PRODUCT HIGHLIGHTS */}
      <section className="otf-section otf-dark2">
        <div className="otf-section-head">
          <h2>Right Now</h2>
          <p>Bestsellers, restocks, and the pieces Juke wore this week.</p>
        </div>
        <div className="otf-prod-grid">
          {HIGHLIGHTS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="otf-prod-card"
            >
              <div className="otf-prod-img" style={{ background: `linear-gradient(145deg, ${['#2a2310','#1f1a0d','#3a1f1a','#241a12'][i % 4]}, #0d0b08)` }}>
                <span className="otf-prod-tag">{p.tag}</span>
              </div>
              <div className="otf-prod-info">
                <span className="otf-prod-coll">{p.coll}</span>
                <h4>{p.name}</h4>
                <span className="otf-prod-price">{p.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section className="otf-section otf-founder">
        <div className="otf-founder-grid">
          <div className="otf-founder-img">
            <div className="otf-founder-badge">WPB · Since day one</div>
          </div>
          <div className="otf-founder-text">
            <span className="otf-eyebrow"><Crown size={13} /> The Founder Story</span>
            <h2>Built on the corner. Tested in the studio.</h2>
            <p>
              Only The Finest started on a West Palm Beach corner — a single run of heavyweight
              tees made for the block, not the algorithm. Then Juke wore one in a video. Then
              another. Then every video. The standard never moved: the heaviest cotton, the
              cleanest stitch, the culture between streetwear and music. We didn't chase
              trends — we built a uniform for the people who make the culture move.
            </p>
            <p className="otf-founder-note">— The OTF team, West Palm Beach</p>
            <button className="otf-ghost-lg">Read the full story <ArrowRight size={15} /></button>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section className="otf-section otf-dark2">
        <div className="otf-section-head">
          <h2>The OTF Membership</h2>
          <p>Three tiers. One identity. Free shipping, early access, and the pieces the block can't get.</p>
        </div>
        <div className="otf-tier-grid">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={`otf-tier-card${tier === t.id ? ' active' : ''}${t.featured ? ' featured' : ''}`}
              style={{ '--tier-accent': t.accent } as React.CSSProperties}
              onClick={() => setTier(t.id)}
            >
              {t.featured && <span className="otf-tier-flag">Most popular</span>}
              <h3>{t.name}</h3>
              <div className="otf-tier-price">
                <strong>{t.price}</strong><span>{t.priceSub}</span>
              </div>
              <ul className="otf-tier-perks">
                {t.perks.map((p) => (
                  <li key={p}><Check size={14} /> {p}</li>
                ))}
              </ul>
              <button className={t.featured ? 'otf-cta-lg' : 'otf-ghost-lg'}>
                {t.id === 'inner' ? 'Join free' : t.id === 'otf' ? 'Become an OTF Member' : 'Join Founding Tier'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="otf-section">
        <div className="otf-section-head">
          <h2>The Block Talks</h2>
          <p>4.9 average across 1,200+ verified reviews.</p>
        </div>
        <div className="otf-review-grid">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="otf-review-card"
            >
              <Quote size={20} className="otf-quote" />
              <div className="otf-stars">
                {Array.from({ length: r.stars }).map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
              </div>
              <p>{r.text}</p>
              <div className="otf-review-author">
                <strong>{r.name}</strong>
                <span><MapPin size={11} /> {r.city}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="otf-section otf-dark2">
        <div className="otf-section-head">
          <h2><Instagram size={18} /> @onlythefinest</h2>
          <p>The feed. The fits. The studio. Juke in OTF, every post.</p>
        </div>
        <div className="otf-ig-grid">
          {IG_POSTS.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="otf-ig-tile"
              style={{ background: `linear-gradient(145deg, ${c}, #0d0b08)` }}
            >
              <Instagram size={22} />
            </motion.div>
          ))}
        </div>
        <button className="otf-ghost-lg" style={{ marginTop: '1.5rem' }}>
          Follow @onlythefinest <ArrowRight size={15} />
        </button>
      </section>

      {/* FOOTER */}
      <footer className="otf-foot">
        <div className="otf-foot-grid">
          <div>
            <span className="otf-mark">OTF</span>
            <p>Only The Finest. Luxury streetwear, lifestyle & sound. West Palm Beach, FL.</p>
          </div>
          <div>
            <h5>Shop</h5>
            <a>Collections</a><a>New Arrivals</a><a>Bestsellers</a><a>Juke Merch</a>
          </div>
          <div>
            <h5>Company</h5>
            <a>Our Story</a><a>Membership</a><a>Juke The Movement</a><a>Contact</a>
          </div>
          <div>
            <h5>Support</h5>
            <a>Shipping</a><a>Returns</a><a>Size Guide</a><a>FAQ</a>
          </div>
        </div>
        <div className="otf-foot-bottom">
          <span>© {new Date().getFullYear()} Only The Finest · shoponlythefinest.com</span>
          <span>Built in West Palm Beach · The Canvas</span>
        </div>
      </footer>
    </div>
  );
}
