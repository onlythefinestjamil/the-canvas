import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Swords, Wand2, Shield, Heart, Sparkles, Crown, Skull, Axe,
  Target, Crosshair, Hammer, Users, ChevronRight,
} from 'lucide-react';

interface Props {
  onBack: () => void;
}

const CLASSES = [
  { name: 'Templar', role: 'Healer', icon: <Shield size={16} />, spec: 'Holy Bulwark' },
  { name: 'Soulbinder', role: 'Healer', icon: <Heart size={16} />, spec: 'Spirit Tether' },
  { name: 'Wildwarden', role: 'Healer', icon: <Sparkles size={16} />, spec: 'Verdant Pact' },
  { name: 'Oracle', role: 'Healer', icon: <Crown size={16} />, spec: 'Foresight' },
  { name: 'Alchemist', role: 'Healer', icon: <Wand2 size={16} />, spec: 'Transmutation' },
  { name: 'Spellblade', role: 'DPS', icon: <Swords size={16} />, spec: 'Phantom Edge' },
  { name: 'Pyromancer', role: 'DPS', icon: <Wand2 size={16} />, spec: 'Ashen Rite' },
  { name: 'Stormcaller', role: 'DPS', icon: <Sparkles size={16} />, spec: 'Tempest Chain' },
  { name: 'Necromancer', role: 'DPS', icon: <Skull size={16} />, spec: 'Unmade Choir' },
  { name: 'Ranger', role: 'DPS', icon: <Target size={16} />, spec: 'Silent Quiver' },
  { name: 'Berserker', role: 'Tank', icon: <Axe size={16} />, spec: 'Bloodsworn' },
  { name: 'Warden', role: 'Tank', icon: <Hammer size={16} />, spec: 'Oathbound' },
];

const SPELLS = [
  { name: 'Lux Sancta', cls: 'Templar', school: 'Holy', desc: 'Consecrates the ground, healing allies who stand within.' },
  { name: 'Anima Ligatur', cls: 'Soulbinder', school: 'Spirit', desc: "Tethers a dying ally's soul back to their body for 8 seconds." },
  { name: 'Sylva Voco', cls: 'Wildwarden', school: 'Nature', desc: 'Summons thorned vines that root and bleed enemies.' },
  { name: 'Fatum Revelare', cls: 'Oracle', school: 'Divination', desc: "Reveals the next 6 seconds of an enemy's actions." },
  { name: 'Mutatio Aurea', cls: 'Alchemist', school: 'Transmutation', desc: 'Transmutes incoming damage into a temporary shield.' },
  { name: 'Ignis Crematio', cls: 'Pyromancer', school: 'Fire', desc: 'A pillar of ash-flame that burns through armor.' },
  { name: 'Fulmen Catena', cls: 'Stormcaller', school: 'Storm', desc: 'Chains lightning between up to 5 foes.' },
  { name: 'Chorus Refringens', cls: 'Necromancer', school: 'Death', desc: 'Raises the unmade to fight at your side.' },
];

const PVP = [
  { mode: 'Duel Circle', size: '1v1', desc: 'Pure single combat. No interference. One survivor.' },
  { mode: 'Shadow Pair', size: '2v2', desc: 'Coordinated duos. Trust is a weapon.' },
  { mode: 'Fractured Triangle', size: '3v3', desc: 'Three souls per side. Fracture the enemy formation.' },
  { mode: 'Warband Clash', size: '5v5', desc: 'Full warbands. Objective control decides it.' },
  { mode: 'Battleground', size: '10v10', desc: 'Large-scale warfare. Capture, hold, fracture.' },
];

const RARITY = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Relic'];
const WEAPONS = [
  'Sword', 'Axe', 'Hammer', 'Spear', 'Bow', 'Crossbow', 'Dagger', 'Staff',
  'Wand', 'Greatsword', 'Greataxe', 'Warhammer', 'Halberd', 'Scythe', 'Whip', 'Gauntlet',
];
const ARMOR = Array.from({ length: 14 }, (_, i) => `Armor Set ${i + 1}`);

const ANCESTRIES = [
  "Aethari", "Dunmir", "Solven", "Karathi", "Vel'Shaari", "Mor'dathi", "Tenzari", "Holmgar",
];

export default function EclipsePage({ onBack }: Props) {
  const [tab, setTab] = useState<'overview' | 'classes' | 'pvp' | 'dungeons'>('overview');

  return (
    <div className="eclipse">
      <nav className="eclipse-nav">
        <div className="eclipse-nav-brand">
          <Swords size={20} style={{ color: 'var(--eclipse-accent)' }} />
          <div>
            <strong>Eclipse</strong>
            <span>Realms of the Fractured</span>
          </div>
        </div>
        <div className="eclipse-nav-tabs">
          <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button>
          <button className={tab === 'classes' ? 'active' : ''} onClick={() => setTab('classes')}>Classes</button>
          <button className={tab === 'pvp' ? 'active' : ''} onClick={() => setTab('pvp')}>PvP</button>
          <button className={tab === 'dungeons' ? 'active' : ''} onClick={() => setTab('dungeons')}>Dungeons & Raids</button>
        </div>
        <button className="eclipse-back" onClick={onBack}>← The Canvas</button>
      </nav>

      {/* KEY ART CONCEPT */}
      <section className="eclipse-hero">
        <div className="eclipse-hero-bg" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="eclipse-hero-content"
        >
          <span className="eclipse-eyebrow">Momentum Labs · Fantasy-Action RPG · Unreal Engine 5</span>
          <h1 className="eclipse-title">
            Eclipse<br />
            <span className="eclipse-title-sub">Realms of the Fractured</span>
          </h1>
          <p className="eclipse-sub">
            12 playable classes. 36+ specializations. 300+ original spells with Latin-inspired
            names. A dark-fantasy world where the Fractured — those broken by fate — forge
            their own legend. Full melanin spectrum across 8 ancestries.
          </p>
          <div className="eclipse-hero-stats">
            <div><strong>12</strong><span>classes</span></div>
            <div><strong>36+</strong><span>specializations</span></div>
            <div><strong>300+</strong><span>spells</span></div>
            <div><strong>8</strong><span>ancestries</span></div>
            <div><strong>14</strong><span>armor sets</span></div>
            <div><strong>16</strong><span>weapon types</span></div>
            <div><strong>7</strong><span>rarity tiers</span></div>
            <div><strong>50+</strong><span>hairstyles</span></div>
          </div>
          <div className="eclipse-status-row">
            <span className="eclipse-status done"><span className="status-dot done" /> Design Bible V4 — complete (10 pages)</span>
            <span className="eclipse-status dev"><span className="status-dot running" /> Vertical slice — in development</span>
            <span className="eclipse-status aura">Aura AI by Ramen — $10/mo Blueprint generation</span>
          </div>
        </motion.div>
      </section>

      {tab === 'overview' && (
        <>
          {/* SPELL EXAMPLES */}
          <section className="eclipse-section">
            <div className="eclipse-section-head">
              <h2><Wand2 size={18} /> Spellbook — Selected Incantations</h2>
              <p>300+ original spells across every school. Names rooted in Latin, effects built for cinematics.</p>
            </div>
            <div className="eclipse-spell-grid">
              {SPELLS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="eclipse-spell-card"
                >
                  <div className="eclipse-spell-head">
                    <h4>{s.name}</h4>
                    <span className="eclipse-spell-school">{s.school}</span>
                  </div>
                  <span className="eclipse-spell-cls">{s.cls}</span>
                  <p>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* WORLD DETAILS */}
          <section className="eclipse-section eclipse-dark2">
            <div className="eclipse-section-head">
              <h2><Users size={18} /> World & Systems</h2>
              <p>Open world confirmed. Full melanin spectrum across 8 ancestries.</p>
            </div>
            <div className="eclipse-cols">
              <div className="eclipse-col">
                <h4>Ancestries (8)</h4>
                <div className="eclipse-chips">
                  {ANCESTRIES.map((a) => <span key={a}>{a}</span>)}
                </div>
              </div>
              <div className="eclipse-col">
                <h4>7-Tier Rarity</h4>
                <div className="eclipse-chips eclipse-rarity">
                  {RARITY.map((r, i) => (
                    <span key={r} className={`rarity-${i}`}>{r}</span>
                  ))}
                </div>
              </div>
              <div className="eclipse-col">
                <h4>16 Weapon Types</h4>
                <div className="eclipse-chips">
                  {WEAPONS.map((w) => <span key={w}>{w}</span>)}
                </div>
              </div>
              <div className="eclipse-col">
                <h4>14 Armor Sets</h4>
                <p className="eclipse-note">Each set carries cultural lore tied to an ancestry and a realm.</p>
                <div className="eclipse-chips">
                  {ARMOR.map((a) => <span key={a}>{a}</span>)}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {tab === 'classes' && (
        <section className="eclipse-section">
          <div className="eclipse-section-head">
            <h2>The 12 Classes — 5 Healers</h2>
            <p>Templar, Soulbinder, Wildwarden, Oracle, and Alchemist anchor every party. 36+ specializations branch from the twelve.</p>
          </div>
          <div className="eclipse-class-grid">
            {CLASSES.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className={`eclipse-class-card ${c.role.toLowerCase()}`}
              >
                <div className="eclipse-class-icon">{c.icon}</div>
                <div>
                  <h4>{c.name}</h4>
                  <span className="eclipse-class-role">{c.role}</span>
                </div>
                <span className="eclipse-class-spec">→ {c.spec}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {tab === 'pvp' && (
        <section className="eclipse-section">
          <div className="eclipse-section-head">
            <h2><Crosshair size={18} /> PvP — Fractured Combat</h2>
            <p>Five competitive modes, from pure duels to full-scale battleground warfare.</p>
          </div>
          <div className="eclipse-pvp-grid">
            {PVP.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="eclipse-pvp-card"
              >
                <div className="eclipse-pvp-size">{m.size}</div>
                <h4>{m.mode}</h4>
                <p>{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {tab === 'dungeons' && (
        <section className="eclipse-section">
          <div className="eclipse-section-head">
            <h2>Endgame — Dungeons & Raids</h2>
            <p>The Fractured don't rest. Neither does the content pipeline.</p>
          </div>
          <div className="eclipse-endgame-grid">
            <div className="eclipse-endgame-card dungeon">
              <span className="eclipse-endgame-tag">Dungeon · 5 players</span>
              <h3>The Weeping Foundry</h3>
              <p>A derelict forge where broken souls are remade — or discarded. 3 bosses, escalating mechanics.</p>
              <ul>
                <li>Boss 1 — The Foreman</li>
                <li>Boss 2 — Molten Choir</li>
                <li>Boss 3 — The Last Smith</li>
              </ul>
            </div>
            <div className="eclipse-endgame-card raid">
              <span className="eclipse-endgame-tag">Raid · 10 players · 4 wings</span>
              <h3>The Cathedral of Unmade Hours</h3>
              <p>A vertical raid through a cathedral that exists outside time. Four wings, each a different broken hour.</p>
              <ul>
                <li>Wing I — The First Hour</li>
                <li>Wing II — The Hollow Choir</li>
                <li>Wing III — The Unmade Saint</li>
                <li>Wing IV — Eclipse (final encounter)</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      <footer className="eclipse-foot">
        <span>Eclipse: Realms of the Fractured · Momentum Labs · Unreal Engine 5</span>
        <span>Design Bible V4 complete · Vertical slice in development</span>
      </footer>
    </div>
  );
}
