import type { AuthUser } from '../types';
import { planInfo } from './billing';

const USAGE_KEY = 'canvas.usage.v1';

interface Usage {
  monthKey: string; // YYYY-MM
  count: number;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function loadUsage(): Usage {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { monthKey: monthKey(new Date()), count: 0 };
    const u = JSON.parse(raw) as Usage;
    if (u.monthKey !== monthKey(new Date())) {
      // Billing cycle reset.
      const reset: Usage = { monthKey: monthKey(new Date()), count: 0 };
      saveUsage(reset);
      return reset;
    }
    return u;
  } catch {
    return { monthKey: monthKey(new Date()), count: 0 };
  }
}

function saveUsage(u: Usage): void {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(u));
  } catch {
    /* ignore */
  }
}

/** How many generations the user has left this month (Infinity for unlimited). */
export function creditsRemaining(user: AuthUser | null): number {
  if (!user) return 0;
  const info = planInfo(user.plan);
  if (info.monthlyCredits === 0) return Infinity;
  const used = loadUsage().count;
  return Math.max(0, info.monthlyCredits - used);
}

export function usedThisMonth(): number {
  return loadUsage().count;
}

export function incrementUsage(): void {
  const u = loadUsage();
  saveUsage({ ...u, count: u.count + 1 });
}

export function canGenerate(user: AuthUser | null): boolean {
  if (!user) return false;
  return creditsRemaining(user) > 0;
}

/** Resets the current cycle's usage (used after a plan upgrade in the demo). */
export function resetUsage(): void {
  saveUsage({ monthKey: monthKey(new Date()), count: 0 });
}
