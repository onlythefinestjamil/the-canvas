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

// Keys baked at build time (.env VITE_*) — used as DEFAULTS so generation
// works out of the box. Anything the user saves in Settings overrides these.
const BUNDLED_KEYS: Record<string, string> = (
  [
    ['openai', import.meta.env.VITE_OPENAI_API_KEY],
    ['stability', import.meta.env.VITE_STABILITY_API_KEY],
    ['blackforest', import.meta.env.VITE_FAL_API_KEY],
    ['google', import.meta.env.VITE_GOOGLE_API_KEY],
    ['runway', import.meta.env.VITE_RUNWAY_API_KEY],
    ['minimax', import.meta.env.VITE_MINIMAX_API_KEY],
    ['cloudflare', import.meta.env.VITE_CLOUDFLARE_API_KEY],
  ] as [string, string | undefined][]
).reduce<Record<string, string>>((acc, [id, val]) => {
  if (val && val.trim()) acc[id] = val.trim();
  return acc;
}, {});

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { apiKeys: { ...BUNDLED_KEYS }, theme: 'dark' };
    const stored = JSON.parse(raw) as Settings;
    // seed any missing keys from the bundled defaults
    const merged: Record<string, string> = { ...BUNDLED_KEYS, ...(stored.apiKeys || {}) };
    return { ...stored, apiKeys: merged };
  } catch {
    return { apiKeys: { ...BUNDLED_KEYS }, theme: 'dark' };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
