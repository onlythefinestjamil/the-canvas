// Real-time preview with play/pause, scrubbing, loop, quality settings.
import { useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Repeat, Maximize, Gauge } from 'lucide-react';
import type { VideoProject } from '../../lib/video/types';
import { renderFrame } from '../../lib/video/export';
import { totalDuration } from '../../lib/video/export';

interface Props {
  project: VideoProject;
  playing: boolean;
  time: number;
  quality: 'quarter' | 'half' | 'full' | 'proxy';
  loop: boolean;
  onTimeChange: (t: number) => void;
  onTogglePlay: () => void;
  onToggleLoop: () => void;
  onQuality: (q: 'quarter' | 'half' | 'full' | 'proxy') => void;
}

const Q_FACTOR = { quarter: 0.25, half: 0.5, full: 1, proxy: 0.5 } as const;

export default function Preview({ project, playing, time, quality, loop, onTimeChange, onTogglePlay, onToggleLoop, onQuality }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mediaCache = useRef<Map<string, { video?: HTMLVideoElement; img?: HTMLImageElement }>>(new Map());
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const playingRef = useRef(playing);
  const timeRef = useRef(time);
  const loopRef = useRef(loop);

  playingRef.current = playing;
  timeRef.current = time;
  loopRef.current = loop;

  // Render the current frame whenever time/project changes.
  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wrap = wrapRef.current;
    const cssW = wrap?.clientWidth || 640;
    const cssH = wrap?.clientHeight || 360;
    const aspect = project.width / project.height;
    let w = cssW;
    let h = cssW / aspect;
    if (h > cssH) {
      h = cssH;
      w = cssH * aspect;
    }
    const q = Q_FACTOR[quality];
    canvas.width = Math.max(2, Math.round(w * q));
    canvas.height = Math.max(2, Math.round(h * q));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    await renderFrame(ctx, project, timeRef.current, canvas.width, canvas.height, mediaCache.current as never);
  }, [project, quality]);

  useEffect(() => {
    void draw();
  }, [draw, time, project]);

  // Playback loop via rAF.
  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      let next = timeRef.current + dt;
      const dur = totalDuration(project);
      if (next >= dur) {
        if (loopRef.current) next = 0;
        else {
          onTimeChange(dur);
          return;
        }
      }
      onTimeChange(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, project, onTimeChange]);

  const fullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }, []);

  const dur = totalDuration(project);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#050505', overflow: 'hidden' }}>
      <div ref={wrapRef} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 0, padding: '0.6rem' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', background: '#000' }} />
        {project.clips.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-faint)' }}>
            <Play size={32} opacity={0.4} />
            <span style={{ fontSize: '0.78rem' }}>Drag media onto the timeline to begin</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.8rem', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button className="icon-btn" onClick={onTogglePlay} title={playing ? 'Pause (Space)' : 'Play (Space)'} style={{ width: 34, justifyContent: 'center' }}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button className="icon-btn" onClick={onToggleLoop} title="Loop" style={{ width: 30, justifyContent: 'center', color: loop ? 'var(--accent)' : undefined }}>
          <Repeat size={13} />
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(0.5, dur)}
          step={1 / project.fps}
          value={Math.min(time, dur)}
          onChange={(e) => onTimeChange(parseFloat(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', minWidth: 90, textAlign: 'right' }}>
          {fmt(time)} / {fmt(dur)}
        </span>
        <div className="seg" style={{ marginRight: 0 }}>
          {(['quarter', 'half', 'full', 'proxy'] as const).map((q) => (
            <button key={q} className={quality === q ? 'active' : ''} onClick={() => onQuality(q)} title={`Quality: ${q}`}>
              {q === 'quarter' ? '¼' : q === 'half' ? '½' : q === 'full' ? '1×' : 'P'}
            </button>
          ))}
        </div>
        <button className="icon-btn" onClick={fullscreen} title="Fullscreen"><Maximize size={12} /></button>
      </div>
    </div>
  );
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

void Gauge;
