import type { Plan } from '../types';

export interface PlanInfo {
  id: Plan;
  name: string;
  price: number;
  priceLabel: string;
  monthlyCredits: number; // 0 = unlimited
  blurb: string;
}

export const PLANS: PlanInfo[] = [
  { id: 'free', name: 'Free', price: 0, priceLabel: '$0', monthlyCredits: 3, blurb: 'Try the studio — 3 generations / month.' },
  { id: 'pro', name: 'Pro', price: 29, priceLabel: '$29', monthlyCredits: 50, blurb: '50 generations / month, all models.' },
  { id: 'promax', name: 'Pro Max', price: 99, priceLabel: '$99', monthlyCredits: 0, blurb: 'Unlimited generations, priority rendering.' },
];

export function planInfo(plan: Plan): PlanInfo {
  return PLANS.find((p) => p.id === plan) || PLANS[0];
}

/**
 * Begin a Stripe Checkout session. If STRIPE_PUBLISHABLE_KEY is configured
 * (e.g. via env at build) this would redirect to hosted checkout; without a
 * backend + key it falls back to a local demo upgrade that simulates success.
 */
export async function startCheckout(plan: Plan): Promise<{ ok: boolean; error?: string }> {
  // Real path would be: load Stripe.js with the publishable key, call the
  // backend /api/checkout to create a Session, then redirect to the Session
  // URL. For this demo build there is no backend, so we simulate the upgrade.
  try {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
