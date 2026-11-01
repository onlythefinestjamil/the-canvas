// Timeline operations: clip placement, trimming, splitting, ripple delete, snapping.

import type { Clip, Track, VideoProject } from './types';
import { clipEnd } from './clip';
import { uid } from './types';

const SNAP_THRESHOLD = 0.15; // seconds

/** All "snap points" for magnetic snapping (clip boundaries, playhead). */
export function snapPoints(project: VideoProject, excludeId?: string, playhead = 0): number[] {
  const pts: number[] = [0, playhead];
  for (const c of project.clips) {
    if (c.id === excludeId) continue;
    pts.push(c.start);
    pts.push(clipEnd(c));
  }
  return pts;
}

export function snap(time: number, points: number[], threshold = SNAP_THRESHOLD): number {
  let best = time;
  let bestDelta = threshold;
  for (const p of points) {
    const d = Math.abs(time - p);
    if (d < bestDelta) {
      bestDelta = d;
      best = p;
    }
  }
  return best;
}

export function projectDuration(project: VideoProject): number {
  let end = 0;
  for (const c of project.clips) end = Math.max(end, clipEnd(c));
  return end;
}

export function addTrack(project: VideoProject, kind: Track['kind'], name?: string): VideoProject {
  const counts: Record<string, number> = {};
  for (const t of project.tracks) counts[t.kind] = (counts[t.kind] || 0) + 1;
  const n = (counts[kind] || 0) + 1;
  const track: Track = {
    id: uid('trk'),
    kind,
    name: name || `${kind[0].toUpperCase()}${n}`,
    height: kind === 'audio' ? 64 : 56,
    locked: false,
    muted: false,
    solo: false,
    hidden: false,
    volume: 1,
  };
  return { ...project, tracks: [...project.tracks, track] };
}

export function removeTrack(project: VideoProject, trackId: string): VideoProject {
  return {
    ...project,
    tracks: project.tracks.filter((t) => t.id !== trackId),
    clips: project.clips.filter((c) => c.trackId !== trackId),
  };
}

export function addClip(project: VideoProject, clip: Clip): VideoProject {
  const clips = [...project.clips, clip];
  return { ...project, clips, duration: Math.max(project.duration, clipEnd(clip)) };
}

export function removeClip(project: VideoProject, clipId: string): VideoProject {
  const clips = project.clips.filter((c) => c.id !== clipId);
  return { ...project, clips, duration: clipsLength(clips) };
}

function clipsLength(clips: Clip[]): number {
  let end = 0;
  for (const c of clips) end = Math.max(end, clipEnd(c));
  return end;
}

export function updateClip(project: VideoProject, clipId: string, patch: Partial<Clip>): VideoProject {
  const clips = project.clips.map((c) => (c.id === clipId ? { ...c, ...patch, effects: patch.effects ?? c.effects } : c));
  return { ...project, clips, duration: clipsLength(clips) };
}

export function moveClip(project: VideoProject, clipId: string, start: number, trackId?: string): VideoProject {
  const snaps = snapPoints(project, clipId);
  const snapped = snap(start, snaps);
  return updateClip(project, clipId, { start: Math.max(0, snapped), trackId: trackId ?? project.clips.find((c) => c.id === clipId)?.trackId });
}

/** Trim a clip's left edge (changes start + inPoint, keeps right edge fixed). */
export function trimLeft(project: VideoProject, clipId: string, newStart: number): VideoProject {
  const clip = project.clips.find((c) => c.id === clipId);
  if (!clip) return project;
  const snapped = snap(newStart, snapPoints(project, clipId));
  const delta = clip.start - Math.max(0, snapped);
  const newDuration = clip.duration + delta;
  if (newDuration < 0.1) return project;
  const newIn = Math.max(0, clip.inPoint - delta * Math.abs(clip.speed));
  return updateClip(project, clipId, { start: Math.max(0, snapped), duration: newDuration, inPoint: newIn });
}

/** Trim a clip's right edge (changes duration + outPoint, keeps left fixed). */
export function trimRight(project: VideoProject, clipId: string, newEnd: number): VideoProject {
  const clip = project.clips.find((c) => c.id === clipId);
  if (!clip) return project;
  const snapped = snap(newEnd, snapPoints(project, clipId));
  const newDuration = Math.max(0.1, snapped - clip.start);
  const newOut = clip.inPoint + newDuration * Math.abs(clip.speed);
  return updateClip(project, clipId, { duration: newDuration, outPoint: newOut });
}

/** Split (blade) a clip at an absolute time. */
export function splitClip(project: VideoProject, clipId: string, atTime: number): VideoProject {
  const clip = project.clips.find((c) => c.id === clipId);
  if (!clip) return project;
  if (atTime <= clip.start + 0.05 || atTime >= clipEnd(clip) - 0.05) return project;
  const rel = atTime - clip.start;
  const leftDuration = rel;
  const rightDuration = clip.duration - rel;
  const rightIn = clip.inPoint + rel * Math.abs(clip.speed);
  const right: Clip = {
    ...clip,
    id: uid('clip'),
    start: atTime,
    duration: rightDuration,
    inPoint: rightIn,
    effects: { ...clip.effects, color: { ...clip.effects.color }, filters: clip.effects.filters.map((f) => ({ ...f })), speedRamp: [...clip.effects.speedRamp] },
  };
  const clips = project.clips.map((c) => (c.id === clipId ? { ...c, duration: leftDuration, outPoint: rightIn } : c));
  return { ...project, clips: [...clips, right], duration: clipsLength(clips) };
}

/** Ripple delete: remove a clip and shift later clips on the same track back by its duration. */
export function rippleDelete(project: VideoProject, clipId: string): VideoProject {
  const clip = project.clips.find((c) => c.id === clipId);
  if (!clip) return project;
  const gap = clip.duration;
  const clips = project.clips
    .filter((c) => c.id !== clipId)
    .map((c) => (c.trackId === clip.trackId && c.start > clip.start ? { ...c, start: Math.max(0, c.start - gap) } : c));
  return { ...project, clips, duration: clipsLength(clips) };
}

/** Find the clip (if any) at a given time on a given track. */
export function clipAt(project: VideoProject, trackId: string, time: number): Clip | undefined {
  return project.clips.find((c) => c.trackId === trackId && time >= c.start && time < clipEnd(c));
}

/** All clips overlapping a time, top track first. */
export function clipsAtTime(project: VideoProject, time: number): Clip[] {
  return project.clips
    .filter((c) => time >= c.start && time < clipEnd(c))
    .sort((a, b) => trackIndex(project, b.trackId) - trackIndex(project, a.trackId));
}

function trackIndex(project: VideoProject, trackId: string): number {
  return project.tracks.findIndex((t) => t.id === trackId);
}
