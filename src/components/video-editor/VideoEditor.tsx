// Main video editor orchestrator — state, undo/redo, shortcuts, layout composition.
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Film, Save, Download, Undo2, Redo2, Plus, ZoomIn, ZoomOut, X, FolderOpen, FileVideo,
} from 'lucide-react';
import type { ClipSource, Clip, TrackKind, VideoProject } from '../../lib/video/types';
import { createProject, serialize, deserialize, listProjects, saveProject, exportProjectFile, importProjectFile, startAutosave, stopAutosave } from '../../lib/video/project';
import { makeClip, readMediaMeta } from '../../lib/video/clip';
import { addClip, moveClip, trimLeft, trimRight, splitClip, rippleDelete, addTrack, removeTrack, projectDuration } from '../../lib/video/timeline';
import { clipEnd } from '../../lib/video/clip';
import { attachShortcuts } from '../../lib/video/shortcuts';
import VideoEditorLayout from './VideoEditorLayout';
import Toolbar from './Toolbar';
import MediaBrowser from './MediaBrowser';
import Preview from './Preview';
import Inspector from './Inspector';
import TransitionsPanel from './TransitionsPanel';
import EffectsPanel from './EffectsPanel';
import Timeline from './Timeline';
import ExportDialog from './ExportDialog';
import { FILTER_PRESETS, LUTS } from '../../lib/video/effects';
import type { GenItem } from '../../types';
import type { TransitionType } from '../../lib/video/types';
import { makeTransition } from '../../lib/video/transitions';

export type ToolId = 'select' | 'blade' | 'position' | 'zoom' | 'hand' | 'text' | 'crop';

interface Props {
  galleryItems: GenItem[];
  initialProject?: VideoProject;
  onClose: () => void;
}

const HISTORY_LIMIT = 60;

export default function VideoEditor({ galleryItems, initialProject, onClose }: Props) {
  const [project, setProjectRaw] = useState<VideoProject>(() => initialProject ?? createProject());
  const [undoStack, setUndoStack] = useState<VideoProject[]>([]);
  const [redoStack, setRedoStack] = useState<VideoProject[]>([]);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [quality, setQuality] = useState<'quarter' | 'half' | 'full' | 'proxy'>('half');
  const [pxPerSec, setPxPerSec] = useState(60);
  const [tool, setTool] = useState<ToolId>('select');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const projectRef = useRef(project);
  projectRef.current = project;

  // Autosave.
  useEffect(() => {
    startAutosave(() => projectRef.current);
    return stopAutosave;
  }, []);

  const commit = useCallback((next: VideoProject) => {
    setUndoStack((u) => [...u.slice(-HISTORY_LIMIT), projectRef.current]);
    setRedoStack([]);
    setProjectRaw({ ...next, updatedAt: Date.now(), duration: projectDuration(next) });
  }, []);

  const updateProject = useCallback((next: VideoProject) => {
    setUndoStack((u) => [...u.slice(-HISTORY_LIMIT), projectRef.current]);
    setRedoStack([]);
    setProjectRaw({ ...next, updatedAt: Date.now() });
  }, []);

  const undo = useCallback(() => {
    setUndoStack((u) => {
      if (!u.length) return u;
      const prev = u[u.length - 1];
      setRedoStack((r) => [...r, projectRef.current]);
      setProjectRaw(prev);
      return u.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (!r.length) return r;
      const next = r[r.length - 1];
      setUndoStack((u) => [...u.slice(-HISTORY_LIMIT), projectRef.current]);
      setProjectRaw(next);
      return r.slice(0, -1);
    });
  }, []);

  // Import media onto the timeline.
  const handleImport = useCallback(async (source: ClipSource, label: string) => {
    let duration = 5;
    let thumb: string | undefined;
    let w = 1920, h = 1080;
    if (source.type === 'color') {
      duration = 5;
    } else {
      try {
        const meta = await readMediaMeta(source.url);
        if (meta.duration) duration = meta.duration;
        if (meta.width) w = meta.width;
        if (meta.height) h = meta.height;
        thumb = meta.thumbnail;
      } catch {
        /* use defaults */
      }
    }
    // Pick a target track by media type.
    const kind: TrackKind = source.type === 'color' ? 'video' : source.mediaType === 'audio' ? 'audio' : 'video';
    let track = projectRef.current.tracks.find((t) => t.kind === kind && !t.locked);
    if (!track) {
      const withTrack = addTrack(projectRef.current, kind);
      track = withTrack.tracks[withTrack.tracks.length - 1];
      updateProject(withTrack);
    }
    const end = projectRef.current.clips
      .filter((c) => c.trackId === track!.id)
      .reduce((max, c) => Math.max(max, clipEnd(c)), 0);
    const clip = makeClip(track!.id, source, end, duration, {
      sourceDuration: duration,
      outPoint: duration,
      naturalWidth: w,
      naturalHeight: h,
      thumbnail: thumb,
      label,
    });
    updateProject(addClip(projectRef.current, clip));
    setSelectedClipId(clip.id);
  }, [updateProject]);

  const handleUpdateClip = useCallback((id: string, patch: Partial<Clip>) => {
    setProjectRaw((p) => {
      const clips = p.clips.map((c) => (c.id === id ? { ...c, ...patch } : c));
      return { ...p, clips, updatedAt: Date.now() };
    });
  }, []);

  const handleMoveClip = useCallback((id: string, start: number) => {
    setProjectRaw((p) => moveClip(p, id, start));
  }, []);

  const handleTrimLeft = useCallback((id: string, start: number) => {
    setProjectRaw((p) => trimLeft(p, id, start));
  }, []);

  const handleTrimRight = useCallback((id: string, end: number) => {
    setProjectRaw((p) => trimRight(p, id, end));
  }, []);

  const handleSplit = useCallback((id: string, at: number) => {
    setProjectRaw((p) => splitClip(p, id, at));
  }, []);

  const handleRippleDelete = useCallback((id: string) => {
    if (selectedClipId === id) setSelectedClipId(null);
    setProjectRaw((p) => rippleDelete(p, id));
  }, [selectedClipId]);

  const handleAddTrack = useCallback((kind: TrackKind) => {
    updateProject(addTrack(projectRef.current, kind));
  }, [updateProject]);

  const handleRemoveTrack = useCallback((trackId: string) => {
    updateProject(removeTrack(projectRef.current, trackId));
  }, [updateProject]);

  const handleToggleTrack = useCallback((trackId: string, prop: 'locked' | 'muted' | 'solo' | 'hidden') => {
    setProjectRaw((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, [prop]: !t[prop] } : t)),
    }));
  }, []);

  // Save project.
  const handleSave = useCallback(() => {
    saveProject(projectRef.current);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }, []);

  // Keyboard shortcuts.
  const shortcuts = useMemo(
    () => ({
      space: () => setPlaying((p) => !p),
      reverse: () => setPlayhead((t) => Math.max(0, t - 1)),
      stop: () => setPlaying(false),
      forward: () => setPlayhead((t) => t + 1),
      setIn: () => {},
      setOut: () => {},
      blade: () => setTool('blade'),
      select: () => setTool('select'),
      undo,
      redo,
      save: handleSave,
      export: () => setShowExport(true),
      prevEdit: () => {
        const clips = projectRef.current.clips.slice().sort((a, b) => b.start - a.start);
        const prev = clips.find((c) => c.start < playhead - 0.01);
        if (prev) setPlayhead(prev.start);
      },
      nextEdit: () => {
        const clips = projectRef.current.clips.slice().sort((a, b) => a.start - b.start);
        const next = clips.find((c) => c.start > playhead + 0.01);
        if (next) setPlayhead(next.start);
      },
      frameStepBack: () => setPlayhead((t) => Math.max(0, t - 1 / projectRef.current.fps)),
      frameStepFwd: () => setPlayhead((t) => t + 1 / projectRef.current.fps),
      rippleDelete: () => {
        if (selectedClipId) handleRippleDelete(selectedClipId);
      },
      zoomIn: () => setPxPerSec((z) => Math.min(400, z * 1.3)),
      zoomOut: () => setPxPerSec((z) => Math.max(8, z / 1.3)),
      selectAll: () => {},
    }),
    [undo, redo, handleSave, playhead, selectedClipId, handleRippleDelete]
  );

  useEffect(() => {
    const el = document.body;
    return attachShortcuts(el, shortcuts);
  }, [shortcuts]);

  const selectedClip = useMemo(() => project.clips.find((c) => c.id === selectedClipId) ?? null, [project.clips, selectedClipId]);

  const handleNewProject = useCallback(() => {
    if (project.clips.length > 0 && !confirm('Start a new project? Unsaved changes will be lost.')) return;
    commit(createProject());
    setPlayhead(0);
    setPlaying(false);
    setSelectedClipId(null);
  }, [project.clips.length, commit]);

  const handleOpenProject = useCallback((p: VideoProject) => {
    commit(p);
    setPlayhead(0);
    setSelectedClipId(null);
    setShowProjects(false);
  }, [commit]);

  const handleImportProjectFile = useCallback(async (file: File) => {
    try {
      const p = await importProjectFile(file);
      commit(p);
      setShowProjects(false);
    } catch (e) {
      alert(`Failed to import: ${(e as Error).message}`);
    }
  }, [commit]);

  const applyTransition = useCallback((clipId: string, where: 'in' | 'out', type: TransitionType) => {
    handleUpdateClip(clipId, where === 'in' ? { transitionIn: makeTransition(type, 0.5) } : { transitionOut: makeTransition(type, 0.5) });
  }, [handleUpdateClip]);

  const applyFilter = useCallback((clipId: string, filterId: string, name: string) => {
    const c = projectRef.current.clips.find((x) => x.id === clipId);
    if (!c) return;
    if (c.effects.filters.some((f) => f.id === filterId)) return;
    handleUpdateClip(clipId, { effects: { ...c.effects, filters: [...c.effects.filters, { id: filterId, name, intensity: 0.6 }] } });
  }, [handleUpdateClip]);

  const applyLut = useCallback((clipId: string, lutId: string) => {
    const c = projectRef.current.clips.find((x) => x.id === clipId);
    if (!c) return;
    const lut = LUTS.find((l) => l.id === lutId);
    if (!lut) return;
    handleUpdateClip(clipId, { effects: { ...c.effects, color: { ...lut.adjustments } } });
  }, [handleUpdateClip]);

  const removeFilter = useCallback((clipId: string, filterId: string) => {
    const c = projectRef.current.clips.find((x) => x.id === clipId);
    if (!c) return;
    handleUpdateClip(clipId, { effects: { ...c.effects, filters: c.effects.filters.filter((f) => f.id !== filterId) } });
  }, [handleUpdateClip]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'var(--bg)' }}>
      <VideoEditorLayout
        menuBar={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.7rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Film size={12} color="#fff" />
              </div>
              <input
                value={project.name}
                onChange={(e) => setProjectRaw((p) => ({ ...p, name: e.target.value }))}
                style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', outline: 'none', width: 160 }}
              />
            </div>
            {['File', 'Edit', 'Clip', 'Sequence', 'Effects', 'View', 'Window', 'Help'].map((m) => (
              <span key={m} style={{ fontSize: '0.7rem', color: 'var(--text-dim)', padding: '0.2rem 0.4rem', borderRadius: 4, cursor: 'default' }}>{m}</span>
            ))}
            <div style={{ flex: 1 }} />
            <button className="icon-btn" onClick={undo} disabled={!canUndo} title="Undo (Cmd/Ctrl+Z)"><Undo2 size={13} /></button>
            <button className="icon-btn" onClick={redo} disabled={!canRedo} title="Redo (Cmd/Ctrl+Shift+Z)"><Redo2 size={13} /></button>
            <button className="icon-btn" onClick={() => setPxPerSec((z) => Math.min(400, z * 1.3))} title="Zoom in (+)"><ZoomIn size={13} /></button>
            <button className="icon-btn" onClick={() => setPxPerSec((z) => Math.max(8, z / 1.3))} title="Zoom out (-)"><ZoomOut size={13} /></button>
            <button className="icon-btn" onClick={handleSave} title="Save (Cmd/Ctrl+S)" style={{ color: savedFlash ? '#34d399' : undefined }}>
              <Save size={13} /> {savedFlash ? 'Saved' : 'Save'}
            </button>
            <button className="icon-btn" onClick={() => setShowProjects(true)} title="Projects"><FolderOpen size={13} /></button>
            <button className="btn ghost" onClick={() => exportProjectFile(project)} title="Export project file"><FileVideo size={13} /> Export JSON</button>
            <button className="btn" onClick={() => setShowExport(true)} title="Export video (Cmd/Ctrl+E)"><Download size={13} /> Export</button>
            <button className="icon-btn" onClick={onClose} title="Close editor"><X size={13} /></button>
          </div>
        }
        left={
          <MediaBrowser galleryItems={galleryItems} onImport={handleImport} />
        }
        toolbar={<Toolbar tool={tool} onTool={setTool} />}
        preview={
          <Preview
            project={project}
            playing={playing}
            time={playhead}
            quality={quality}
            loop={loop}
            onTimeChange={setPlayhead}
            onTogglePlay={() => setPlaying((p) => !p)}
            onToggleLoop={() => setLoop((l) => !l)}
            onQuality={setQuality}
          />
        }
        inspector={<Inspector project={project} clip={selectedClip} onUpdate={handleUpdateClip} />}
        libPanel={
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <EffectsPanel selectedClip={selectedClip} onApplyFilter={applyFilter} onApplyLut={applyLut} onRemoveFilter={removeFilter} />
            </div>
            <div style={{ height: '45%', borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
              <TransitionsPanel selectedClip={selectedClip} onApply={applyTransition} />
            </div>
          </div>
        }
        timeline={
          <Timeline
            project={project}
            playhead={playhead}
            pxPerSec={pxPerSec}
            tool={tool}
            selectedClipId={selectedClipId}
            onSeek={setPlayhead}
            onSelectClip={setSelectedClipId}
            onUpdateClip={handleUpdateClip}
            onMoveClip={handleMoveClip}
            onTrimLeft={handleTrimLeft}
            onTrimRight={handleTrimRight}
            onSplit={handleSplit}
            onRippleDelete={handleRippleDelete}
            onToggleTrack={handleToggleTrack}
            onAddTrack={handleAddTrack}
            onRemoveTrack={handleRemoveTrack}
          />
        }
      />

      {showExport && <ExportDialog project={project} onClose={() => setShowExport(false)} />}

      {showProjects && (
        <ProjectsDialog
          onClose={() => setShowProjects(false)}
          onOpen={handleOpenProject}
          onNew={handleNewProject}
          onImport={handleImportProjectFile}
        />
      )}

      {/* Bottom status strip */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.2rem 0.7rem', fontSize: '0.6rem', color: 'var(--text-faint)', background: 'var(--surface)', borderTop: '1px solid var(--border)', pointerEvents: 'none' }}>
        <span>{project.tracks.length} tracks · {project.clips.length} clips · {project.fps}fps · {project.width}×{project.height}</span>
        <span>{playing ? 'Playing' : 'Paused'} · tool: {tool} · zoom: {pxPerSec.toFixed(0)}px/s</span>
      </div>
    </div>
  );
}

function ProjectsDialog({ onClose, onOpen, onNew, onImport }: { onClose: () => void; onOpen: (p: VideoProject) => void; onNew: () => void; onImport: (f: File) => void }) {
  const [projects, setProjects] = useState<VideoProject[]>(() => listProjects());
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }} onClick={onClose}>
      <div className="card" style={{ width: 480, maxHeight: '70vh', overflow: 'auto', padding: '1rem', background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Projects</h2>
          <button className="icon-btn" onClick={onClose}><X size={14} /></button>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onNew}><Plus size={13} /> New Project</button>
          <button className="btn ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => fileRef.current?.click()}><FolderOpen size={13} /> Import .json</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
        </div>
        {projects.length === 0 ? (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>No saved projects yet. Create one and hit Save.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {projects.map((p) => (
              <div key={p.id} className="card" style={{ padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => onOpen(p)}>
                <Film size={14} color="var(--accent)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{p.clips.length} clips · {new Date(p.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export for convenience.
export { serialize, deserialize };
