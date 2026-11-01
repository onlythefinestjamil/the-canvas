import type { HistoryEntry } from '../types';

const KEY = 'canvas.history.v1';
const MAX = 500;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export function addHistory(entry: HistoryEntry): HistoryEntry[] {
  const items = loadHistory();
  const next = [entry, ...items].slice(0, MAX);
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  saveHistory([]);
}

export function searchHistory(query: string): HistoryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return loadHistory();
  return loadHistory().filter((h) => h.prompt.toLowerCase().includes(q) || h.modelName.toLowerCase().includes(q));
}
