/**
 * BrandMark — the tiered Canvas logo system (brand locked Nov 1, 2026).
 *
 * REGULAR tier (free users): the Wave "C" — purple #9146FF -> cyan #38B6FF.
 * ELITE tier (paid subscribers, pro/promax): the Ribbon — silver+teal
 * interwoven knot with the "A" wordmark.
 *
 * The "Powered by Momentum Labs" lockup is constant on both tiers.
 */

import type { Plan } from '../types';
import waveIcon from '../../assets/brand/canvas-icon-wave.png';
import ribbonHero from '../../assets/brand/canvas-hero-ribbon.png';

export function isElite(plan: Plan): boolean {
  return plan === 'pro' || plan === 'promax';
}

export default function BrandMark({
  plan,
  size = 32,
  showWordmark = true,
}: {
  plan: Plan;
  size?: number;
  showWordmark?: boolean;
}) {
  const elite = isElite(plan);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
      <img
        src={elite ? ribbonHero : waveIcon}
        alt={elite ? 'The Canvas — ELITE' : 'The Canvas'}
        style={{ width: size, height: size, borderRadius: 8, objectFit: 'cover' }}
      />
      {showWordmark && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h1
              className="brand-gradient"
              style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}
            >
              The Canvas
            </h1>
            {elite && (
              <span
                style={{
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#0b0f0e',
                  background: 'linear-gradient(90deg, #b8c4c2, #8fe8d4)',
                  borderRadius: 4,
                  padding: '2px 6px',
                }}
              >
                Elite
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: '0.6rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            Powered by Momentum Labs
          </p>
        </div>
      )}
    </div>
  );
}
