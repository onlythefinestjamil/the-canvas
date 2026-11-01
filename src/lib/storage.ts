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

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { apiKeys: {}, theme: 'dark' };
    return JSON.parse(raw) as Settings;
  } catch {
    return { apiKeys: {}, theme: 'dark' };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
