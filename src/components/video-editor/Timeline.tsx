// Multi-track timeline with playhead, snapping, trim handles, ruler.
import { useRef, useMemo, useCallback, useEffect } from 'react';
import { Lock, LockOpen, VolumeX, Volume2, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import type { VideoProject, Clip, Track, TrackKind } from '../../lib/video/types';
import { clipEnd, formatTimecode } from '../../lib/video/clip';
import { clipAt, clipsAtTime } from '../../lib/video/timeline';

interface Props {
  project: VideoProject;
  playhead: number;
  pxPerSec: number;
  tool: ToolId;
  selectedClipId: string | null;
  onSeek: (time: number) => void;
  onSelectClip: (id: string | null) => void;
  onUpdateClip: (id: string, patch: Partial<Clip>) => void;
  onMoveClip: (id: string, start: number) => void;
  onTrimLeft: (id: string, start: number) => void;
  onTrimRight: (id: string, end: number) => void;
  onSplit: (id: string, at: number) => void;
  onRippleDelete: (id: string) => void;
  onToggleTrack: (trackId: string, prop: 'locked' | 'muted' | 'solo' | 'hidden') => void;
  onAddTrack: (kind: TrackKind) => void;
  onRemoveTrack: (trackId: string) => void;
}

import type { ToolId } from './VideoEditor';

const RULER_H = 28;
const LABEL_W = 110;

export default function Timeline(props: Props) {
  const {
    project, playhead, pxPerSec, tool, selectedClipId,
    onSeek, onSelectClip, onUpdateClip, onMoveClip, onTrimLeft, onTrimRight,
    onSplit, onRippleDelete, onToggleTrack, onAddTrack, onRemoveTrack,
  } = props;

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ kind: 'move' | 'left' | 'right'; clipId: string; startX: number; startTime: number } | null>(null);

  const totalWidth = Math.max(800, project.duration * pxPerSec + 200);
  const trackList = project.tracks;

  const timeToX = useCallback((t: number) => t * pxPerSec, [pxPerSec]);
  const xToTime = useCallback((x: number) => Math.max(0, x / pxPerSec), [pxPerSec]);

  const handleRulerClick = (e: React.MouseEvent) => {
    const rect = scrollRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft ?? 0);
    onSeek(xToTime(x));
  };

  const startClipDrag = (e: React.MouseEvent, clip: Clip, kind: 'move' | 'left' | 'right') => {
    e.stopPropagation();
    if (tool === 'blade') {
      const rect = scrollRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft ?? 0);
      onSplit(clip.id, xToTime(x));
      return;
    }
    onSelectClip(clip.id);
    dragRef.current = { kind, clipId: clip.id, startX: e.clientX, startTime: clip.start };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dt = dx / pxPerSec;
      if (d.kind === 'move') onMoveClip(d.clipId, Math.max(0, d.startTime + dt));
      else if (d.kind === 'left') onTrimLeft(d.clipId, Math.max(0, d.startTime + dt));
      else onTrimRight(d.clipId, d.startTime + (project.clips.find((c) => c.id === d.clipId)?.duration ?? 0) + dt);
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [pxPerSec, onMoveClip, onTrimLeft, onTrimRight, project.clips]);

  const ticks = useMemo(() => {
    const step = pxPerSec < 30 ? 5 : pxPerSec < 60 ? 2 : pxPerSec < 120 ? 1 : 0.5;
    const arr: number[] = [];
    for (let t = 0; t <= project.duration + step; t += step) arr.push(t);
    return arr;
  }, [pxPerSec, project.duration]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.7rem', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>Timeline</span>
        <span style={{ fontSize: '0.66rem', color: 'var(--text-faint)' }}>·</span>
        <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{formatTimecode(playhead, project.fps)}</span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn" onClick={() => onAddTrack('video')} title="Add video track"><Plus size={12} /> V</button>
        <button className="icon-btn" onClick={() => onAddTrack('audio')} title="Add audio track"><Plus size={12} /> A</button>
        <button className="icon-btn" onClick={() => onAddTrack('text')} title="Add text track"><Plus size={12} /> T</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Track labels */}
        <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface-2)', overflowY: 'hidden' }}>
          <div style={{ height: RULER_H, borderBottom: '1px solid var(--border)' }} />
          {trackList.map((t) => (
            <TrackLabel
              key={t.id}
              track={t}
              onToggle={(p) => onToggleTrack(t.id, p)}
              onRemove={() => onRemoveTrack(t.id)}
            />
          ))}
        </div>

        {/* Timeline scroll area */}
        <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }} onClick={() => onSelectClip(null)}>
          <div style={{ position: 'relative', width: totalWidth, minHeight: '100%' }}>
            {/* Ruler */}
            <div
              style={{ height: RULER_H, position: 'sticky', top: 0, zIndex: 5, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
              onClick={handleRulerClick}
            >
              {ticks.map((t) => (
                <div key={t} style={{ position: 'absolute', left: timeToX(t), top: 0, height: RULER_H }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 8, background: 'var(--border-bright)' }} />
                  <span style={{ position: 'absolute', top: 10, left: 3, fontSize: '0.54rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                    {formatTimecode(t, project.fps).slice(3)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tracks */}
            {trackList.map((t) => (
              <TrackLane
                key={t.id}
                track={t}
                project={project}
                pxPerSec={pxPerSec}
                timeToX={timeToX}
                selectedClipId={selectedClipId}
                tool={tool}
                onClipDown={startClipDrag}
                onClipDelete={onRippleDelete}
              />
            ))}

            {/* Playhead */}
            <div
              style={{
                position: 'absolute',
                left: timeToX(playhead),
                top: 0,
                bottom: 0,
                width: 2,
                background: 'var(--accent)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: -6, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid var(--accent)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackLabel({ track, onToggle, onRemove }: { track: Track; onToggle: (p: 'locked' | 'muted' | 'solo' | 'hidden') => void; onRemove: () => void }) {
  const iconColor = track.kind === 'video' ? '#7c5cff' : track.kind === 'audio' ? '#5b8cff' : track.kind === 'text' ? '#fbbf24' : '#34d399';
  return (
    <div style={{ height: track.height, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 0.5rem', gap: '0.3rem' }}>
      <span style={{ width: 4, height: 16, borderRadius: 2, background: iconColor, flexShrink: 0 }} />
      <span style={{ fontSize: '0.66rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</span>
      <button title={track.locked ? 'Unlock' : 'Lock'} onClick={() => onToggle('locked')} style={btnStyle(track.locked)}>
        {track.locked ? <Lock size={11} /> : <LockOpen size={11} />}
      </button>
      {track.kind === 'audio' ? (
        <button title={track.muted ? 'Unmute' : 'Mute'} onClick={() => onToggle('muted')} style={btnStyle(track.muted)}>{track.muted ? <VolumeX size={11} /> : <Volume2 size={11} />}</button>
      ) : (
        <button title={track.hidden ? 'Show' : 'Hide'} onClick={() => onToggle('hidden')} style={btnStyle(track.hidden)}>{track.hidden ? <EyeOff size={11} /> : <Eye size={11} />}</button>
      )}
      <button title="Solo" onClick={() => onToggle('solo')} style={btnStyle(track.solo)}>S</button>
      <button title="Remove track" onClick={onRemove} style={btnStyle(false)}><Trash2 size={10} /></button>
    </div>
  );
}

const btnStyle = (active: boolean): React.CSSProperties => ({
  border: '1px solid transparent',
  borderRadius: 4,
  background: active ? 'rgba(124,92,255,0.2)' : 'transparent',
  color: active ? 'var(--accent)' : 'var(--text-dim)',
  cursor: 'pointer',
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.6rem',
  padding: 0,
});

function TrackLane({
  track, project, pxPerSec, timeToX, selectedClipId, tool, onClipDown, onClipDelete,
}: {
  track: Track;
  project: VideoProject;
  pxPerSec: number;
  timeToX: (t: number) => number;
  selectedClipId: string | null;
  tool: ToolId;
  onClipDown: (e: React.MouseEvent, clip: Clip, kind: 'move' | 'left' | 'right') => void;
  onClipDelete: (id: string) => void;
}) {
  const clips = project.clips.filter((c) => c.trackId === track.id);
  const activeAt = clipsAtTime(project, 0).length; // placeholder for waveform-aware rendering
  void activeAt;
  return (
    <div style={{ height: track.height, position: 'relative', borderBottom: '1px solid var(--border)', background: track.kind === 'audio' ? 'rgba(91,140,255,0.03)' : 'transparent' }}>
      {clips.map((clip) => (
        <ClipBlock
          key={clip.id}
          clip={clip}
          track={track}
          pxPerSec={pxPerSec}
          timeToX={timeToX}
          selected={clip.id === selectedClipId}
          tool={tool}
          onDown={(e, kind) => onClipDown(e, clip, kind)}
          onDelete={() => onClipDelete(clip.id)}
        />
      ))}
    </div>
  );
}

function ClipBlock({
  clip, track, pxPerSec, timeToX, selected, tool, onDown, onDelete,
}: {
  clip: Clip;
  track: Track;
  pxPerSec: number;
  timeToX: (t: number) => number;
  selected: boolean;
  tool: ToolId;
  onDown: (e: React.MouseEvent, kind: 'move' | 'left' | 'right') => void;
  onDelete: () => void;
}) {
  const x = timeToX(clip.start);
  const w = Math.max(8, clip.duration * pxPerSec);
  const isAudio = track.kind === 'audio' || (clip.source.type !== 'color' && clip.source.mediaType === 'audio');
  const color = isAudio ? '#5b8cff' : track.kind === 'text' ? '#fbbf24' : '#7c5cff';
  const label = clip.label ?? (clip.source.type === 'color' ? 'Color' : clip.source.type === 'file' ? clip.source.fileName : 'Clip');

  return (
    <div
      onMouseDown={(e) => onDown(e, 'move')}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: x,
        top: 4,
        width: w,
        height: track.height - 8,
        background: `linear-gradient(135deg, ${color}33, ${color}22)`,
        border: `1px solid ${selected ? 'var(--accent)' : color + '66'}`,
        borderRadius: 4,
        overflow: 'hidden',
        cursor: tool === 'blade' ? 'crosshair' : 'grab',
        opacity: track.locked ? 0.5 : 1,
      }}
    >
      {/* Thumbnail strip */}
      {clip.thumbnail && track.kind === 'video' && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${clip.thumbnail})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', opacity: 0.6 }} />
      )}
      {/* Audio waveform-ish pattern */}
      {isAudio && (
        <svg width={w} height={track.height - 8} style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
          {Array.from({ length: Math.floor(w / 3) }).map((_, i) => {
            const h = 4 + Math.abs(Math.sin(i * 0.4 + clip.start)) * (track.height - 16);
            return <rect key={i} x={i * 3} y={(track.height - 8 - h) / 2} width={1.5} height={h} fill={color} />;
          })}
        </svg>
      )}
      {/* Label */}
      <div style={{ position: 'relative', zIndex: 2, padding: '2px 6px', fontSize: '0.6rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
        {label}
      </div>
      {/* Trim handles */}
      <div
        onMouseDown={(e) => { e.stopPropagation(); onDown(e, 'left'); }}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, cursor: 'ew-resize', background: color + '88' }}
      />
      <div
        onMouseDown={(e) => { e.stopPropagation(); onDown(e, 'right'); }}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'ew-resize', background: color + '88' }}
      />
      {selected && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ position: 'absolute', top: 2, right: 8, width: 16, height: 16, border: '1px solid var(--border-bright)', borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, padding: 0, fontSize: 9 }}
          title="Ripple delete"
        >
          ×
        </button>
      )}
    </div>
  );
}

// Avoid unused import warnings — export a no-op for clipsAtTime usage.
void clipAt;
