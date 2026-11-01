// Project save/load/autosave + multiple project management via localStorage.

import type { VideoProject } from './types';
import { uid } from './types';
import { projectDuration } from './timeline';

const PROJECTS_KEY = 'canvas.video.projects.v1';
const AUTOSAVE_KEY = 'canvas.video.autosave.v1';
const AUTOSAVE_MS = 4000;

export function createProject(name = 'Untitled Project'): VideoProject {
  const now = Date.now();
  return {
    id: uid('proj'),
    name,
    createdAt: now,
    updatedAt: now,
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 0,
    tracks: [
      { id: uid('trk'), kind: 'video', name: 'V1', height: 56, locked: false, muted: false, solo: false, hidden: false, volume: 1 },
      { id: uid('trk'), kind: 'audio', name: 'A1', height: 64, locked: false, muted: false, solo: false, hidden: false, volume: 1 },
    ],
    clips: [],
    background: '#000000',
  };
}

export function serialize(project: VideoProject): string {
  return JSON.stringify({ ...project, updatedAt: Date.now() });
}

export function deserialize(json: string): VideoProject | null {
  try {
    const p = JSON.parse(json) as VideoProject;
    if (!p || !Array.isArray(p.tracks) || !Array.isArray(p.clips)) return null;
    return p;
  } catch {
    return null;
  }
}

export function listProjects(): VideoProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VideoProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProject(project: VideoProject): VideoProject[] {
  const all = listProjects();
  const idx = all.findIndex((p) => p.id === project.id);
  const updated = { ...project, updatedAt: Date.now(), duration: projectDuration(project) };
  if (idx >= 0) all[idx] = updated;
  else all.unshift(updated);
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(all.slice(0, 50)));
  } catch {
    /* quota */
  }
  return all;
}

export function deleteProject(id: string): VideoProject[] {
  const all = listProjects().filter((p) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
  return all;
}

let autosaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutosave(getProject: () => VideoProject): void {
  stopAutosave();
  autosaveTimer = setInterval(() => {
    try {
      const p = getProject();
      localStorage.setItem(AUTOSAVE_KEY, serialize(p));
    } catch {
      /* ignore */
    }
  }, AUTOSAVE_MS);
}

export function stopAutosave(): void {
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
}

export function loadAutosave(): VideoProject | null {
  const raw = localStorage.getItem(AUTOSAVE_KEY);
  if (!raw) return null;
  return deserialize(raw);
}

/** Export a project as a JSON file (download). */
export function exportProjectFile(project: VideoProject): void {
  const blob = new Blob([serialize(project)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/[^a-z0-9_-]/gi, '_')}.canvasproj.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Import a project from a JSON file. */
export function importProjectFile(file: File): Promise<VideoProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const p = deserialize(reader.result as string);
      if (p) resolve({ ...p, id: uid('proj') });
      else reject(new Error('Invalid project file'));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
