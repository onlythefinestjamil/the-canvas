import type { GenItem, Settings } from '../types';

const GALLERY_KEY = 'canvas.gallery.v1';
const SETTINGS_KEY = 'canvas.settings.v1';

export function loadGallery(): GenItem[] {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGallery(items: GenItem[]): void {
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(items.slice(0, 500)));
  } catch {
    /* quota — ignore */
  }
}

// Pre-populated API keys from .env (injected by Vite at build time)
const ENV_KEYS: Record<string, string> = {
  openai: (import.meta.env.VITE_OPENAI_API_KEY as string) || '',
  runway: (import.meta.env.VITE_RUNWAY_API_KEY as string) || '',
  stability: (import.meta.env.VITE_STABILITY_API_KEY as string) || '',
  blackforest: (import.meta.env.VITE_FAL_KEY as string) || '',
  minimax: (import.meta.env.VITE_MINIMAX_API_KEY as string) || '',
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const saved = raw ? JSON.parse(raw) as Settings : { apiKeys: {}, theme: 'dark' as const };
    // Merge: env keys as defaults, user-saved keys override
    const merged: Settings = {
      apiKeys: { ...ENV_KEYS, ...saved.apiKeys },
      theme: saved.theme || 'dark',
    };
    return merged;
  } catch {
    return { apiKeys: { ...ENV_KEYS }, theme: 'dark' };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
