// Inspector — clip properties, transforms, effects, text, transitions, keyframes.
import { useState } from 'react';
import { Sliders, Type, Sparkles, Wand2, KeySquare } from 'lucide-react';
import type { Clip, VideoProject } from '../../lib/video/types';
import { FILTER_PRESETS, LUTS } from '../../lib/video/effects';
import { TEXT_ANIMATIONS, FONT_FAMILIES } from '../../lib/video/text-overlay';
import { TRANSITIONS, makeTransition } from '../../lib/video/transitions';
import { formatTimecode } from '../../lib/video/clip';

type Tab = 'clip' | 'effects' | 'text' | 'transition' | 'keyframes';

interface Props {
  project: VideoProject;
  clip: Clip | null;
  onUpdate: (id: string, patch: Partial<Clip>) => void;
}

export default function Inspector({ project, clip, onUpdate }: Props) {
  const [tab, setTab] = useState<Tab>('clip');
  if (!clip) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
        <div style={{ padding: '0.8rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>Inspector</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '0.74rem', padding: '1rem', textAlign: 'center' }}>
          Select a clip to edit its properties, effects, and transitions.
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'clip', label: 'Clip', icon: <Sliders size={12} /> },
    { id: 'effects', label: 'Effects', icon: <Wand2 size={12} /> },
    { id: 'text', label: 'Text', icon: <Type size={12} /> },
    { id: 'transition', label: 'Trans', icon: <Sparkles size={12} /> },
    { id: 'keyframes', label: 'Keys', icon: <KeySquare size={12} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', overflow: 'hidden' }}>
      <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>Inspector</span>
        </div>
        <div className="seg">
          {tabs.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.7rem' }}>
        {tab === 'clip' && <ClipTab clip={clip} project={project} onUpdate={onUpdate} />}
        {tab === 'effects' && <EffectsTab clip={clip} onUpdate={onUpdate} />}
        {tab === 'text' && <TextTab clip={clip} onUpdate={onUpdate} />}
        {tab === 'transition' && <TransitionTab clip={clip} onUpdate={onUpdate} />}
        {tab === 'keyframes' && <KeyframesTab clip={clip} />}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.7rem' }}>
      <label style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>{label}</label>
      {children}
    </div>
  );
}

function Slider({ value, min, max, step, onChange }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input type="range" min={min} max={max} step={step ?? 0.01} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
      <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', minWidth: 36, textAlign: 'right' }}>{value.toFixed(2)}</span>
    </div>
  );
}

function ClipTab({ clip, project, onUpdate }: { clip: Clip; project: VideoProject; onUpdate: (id: string, patch: Partial<Clip>) => void }) {
  const track = project.tracks.find((t) => t.id === clip.trackId);
  return (
    <>
      <Row label="Name"><input value={clip.label ?? ''} onChange={(e) => onUpdate(clip.id, { label: e.target.value })} style={inputStyle} /></Row>
      <Row label="Track"><div style={{ fontSize: '0.72rem' }}>{track?.name ?? '—'} · {track?.kind}</div></Row>
      <Row label="Timecode"><div style={{ fontSize: '0.72rem', fontFamily: 'var(--mono)' }}>{formatTimecode(clip.start, project.fps)} → {formatTimecode(clip.start + clip.duration, project.fps)}</div></Row>
      <Row label={`Speed (${clip.speed.toFixed(2)}×)`}><Slider value={clip.speed} min={0.25} max={4} step={0.05} onChange={(v) => onUpdate(clip.id, { speed: v })} /></Row>
      <Row label="Reverse"><button className="btn ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onUpdate(clip.id, { reverse: !clip.reverse })}>{clip.reverse ? 'Reverse: ON' : 'Reverse: OFF'}</button></Row>
      {clip.source.type !== 'color' && clip.source.mediaType !== 'image' && (
        <Row label={`Volume (${(clip.volume * 100).toFixed(0)}%)`}><Slider value={clip.volume} min={0} max={1} onChange={(v) => onUpdate(clip.id, { volume: v })} /></Row>
      )}
      <Row label={`Fade In (${clip.fadeIn.toFixed(2)}s)`}><Slider value={clip.fadeIn} min={0} max={2} step={0.05} onChange={(v) => onUpdate(clip.id, { fadeIn: v })} /></Row>
      <Row label={`Fade Out (${clip.fadeOut.toFixed(2)}s)`}><Slider value={clip.fadeOut} min={0} max={2} step={0.05} onChange={(v) => onUpdate(clip.id, { fadeOut: v })} /></Row>
    </>
  );
}

function EffectsTab({ clip, onUpdate }: { clip: Clip; onUpdate: (id: string, patch: Partial<Clip>) => void }) {
  const c = clip.effects.color;
  const set = (patch: Partial<typeof c>) => onUpdate(clip.id, { effects: { ...clip.effects, color: { ...c, ...patch } } });
  return (
    <>
      <h4 style={h4}>Color Correction</h4>
      <Row label="Brightness"><Slider value={c.brightness} min={-1} max={1} onChange={(v) => set({ brightness: v })} /></Row>
      <Row label="Contrast"><Slider value={c.contrast} min={-1} max={1} onChange={(v) => set({ contrast: v })} /></Row>
      <Row label="Saturation"><Slider value={c.saturation} min={-1} max={1} onChange={(v) => set({ saturation: v })} /></Row>
      <Row label="Temperature"><Slider value={c.temperature} min={-1} max={1} onChange={(v) => set({ temperature: v })} /></Row>
      <Row label="Tint"><Slider value={c.tint} min={-1} max={1} onChange={(v) => set({ tint: v })} /></Row>
      <Row label="Hue"><Slider value={c.hue} min={-180} max={180} step={1} onChange={(v) => set({ hue: v })} /></Row>

      <h4 style={h4}>Filters</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: '0.7rem' }}>
        {FILTER_PRESETS.map((f) => {
          const active = clip.effects.filters.some((x) => x.id === f.id);
          return (
            <button key={f.id} className="btn ghost" style={{ padding: '0.4rem', fontSize: '0.6rem', justifyContent: 'center', background: active ? 'rgba(124,92,255,0.2)' : undefined, borderColor: active ? 'var(--accent)' : undefined }} onClick={() => {
              const filters = active ? clip.effects.filters.filter((x) => x.id !== f.id) : [...clip.effects.filters, { id: f.id, name: f.name, intensity: 0.6 }];
              onUpdate(clip.id, { effects: { ...clip.effects, filters } });
            }}>{f.name}</button>
          );
        })}
      </div>

      <h4 style={h4}>LUTs / Looks</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: '0.7rem' }}>
        {LUTS.map((l) => (
          <button key={l.id} className="btn ghost" style={{ padding: '0.4rem', fontSize: '0.6rem', justifyContent: 'center' }} onClick={() => onUpdate(clip.id, { effects: { ...clip.effects, color: { ...l.adjustments } } })}>{l.name}</button>
        ))}
      </div>

      <h4 style={h4}>Stylize</h4>
      <Row label={`Blur (${clip.effects.blur.toFixed(1)}px)`}><Slider value={clip.effects.blur} min={0} max={20} step={0.5} onChange={(v) => onUpdate(clip.id, { effects: { ...clip.effects, blur: v } })} /></Row>
      <Row label={`Vignette (${(clip.effects.vignette * 100).toFixed(0)}%)`}><Slider value={clip.effects.vignette} min={0} max={1} onChange={(v) => onUpdate(clip.id, { effects: { ...clip.effects, vignette: v } })} /></Row>
      <Row label={`Motion Blur (${(clip.effects.motionBlur * 100).toFixed(0)}%)`}><Slider value={clip.effects.motionBlur} min={0} max={1} onChange={(v) => onUpdate(clip.id, { effects: { ...clip.effects, motionBlur: v } })} /></Row>
      <Row label={`Stabilization (${(clip.effects.stabilization * 100).toFixed(0)}%)`}><Slider value={clip.effects.stabilization} min={0} max={1} onChange={(v) => onUpdate(clip.id, { effects: { ...clip.effects, stabilization: v } })} /></Row>
    </>
  );
}

function TextTab({ clip, onUpdate }: { clip: Clip; onUpdate: (id: string, patch: Partial<Clip>) => void }) {
  if (!clip.text) {
    return (
      <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onUpdate(clip.id, { text: { id: 'txt_' + Math.random().toString(36).slice(2, 8), text: 'Title Text', style: { fontFamily: 'Inter, sans-serif', fontSize: 64, fontWeight: 700, color: '#ffffff', align: 'center', background: null, stroke: '#000000', strokeWidth: 0, shadow: true }, x: 0.5, y: 0.5, animation: 'fade', animationDuration: 0.6 } })}>
        <Type size={12} /> Add Text Overlay
      </button>
    );
  }
  const t = clip.text;
  const set = (patch: Partial<typeof t>) => onUpdate(clip.id, { text: { ...t, ...patch } });
  const setStyle = (patch: Partial<typeof t.style>) => set({ style: { ...t.style, ...patch } });
  return (
    <>
      <Row label="Content"><textarea value={t.text} onChange={(e) => set({ text: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} /></Row>
      <Row label="Font Family">
        <select value={t.style.fontFamily} onChange={(e) => setStyle({ fontFamily: e.target.value })} style={inputStyle}>
          {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f.split(',')[0]}</option>)}
        </select>
      </Row>
      <Row label={`Size (${t.style.fontSize}px)`}><Slider value={t.style.fontSize} min={12} max={200} step={1} onChange={(v) => setStyle({ fontSize: v })} /></Row>
      <Row label="Weight">
        <select value={t.style.fontWeight} onChange={(e) => setStyle({ fontWeight: parseInt(e.target.value) })} style={inputStyle}>
          {[300, 400, 500, 600, 700, 800, 900].map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </Row>
      <Row label="Color"><input type="color" value={t.style.color} onChange={(e) => setStyle({ color: e.target.value })} style={{ ...inputStyle, height: 32, padding: 2 }} /></Row>
      <Row label="Align">
        <div className="seg">
          {(['left', 'center', 'right'] as const).map((a) => <button key={a} className={t.style.align === a ? 'active' : ''} onClick={() => setStyle({ align: a })}>{a[0].toUpperCase()}</button>)}
        </div>
      </Row>
      <Row label="Position (X / Y)">
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Slider value={t.x} min={0} max={1} onChange={(v) => set({ x: v })} />
          <Slider value={t.y} min={0} max={1} onChange={(v) => set({ y: v })} />
        </div>
      </Row>
      <Row label="Animation">
        <select value={t.animation} onChange={(e) => set({ animation: e.target.value as never })} style={inputStyle}>
          {TEXT_ANIMATIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
      </Row>
      <Row label={`Anim Duration (${t.animationDuration.toFixed(2)}s)`}><Slider value={t.animationDuration} min={0.1} max={3} step={0.05} onChange={(v) => set({ animationDuration: v })} /></Row>
    </>
  );
}

function TransitionTab({ clip, onUpdate }: { clip: Clip; onUpdate: (id: string, patch: Partial<Clip>) => void }) {
  return (
    <>
      <h4 style={h4}>Transition In</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: '0.7rem' }}>
        <button className="btn ghost" style={{ fontSize: '0.6rem', justifyContent: 'center' }} onClick={() => onUpdate(clip.id, { transitionIn: undefined })}>None</button>
        {TRANSITIONS.map((tr) => (
          <button key={tr.type} className="btn ghost" style={{ fontSize: '0.6rem', justifyContent: 'center', background: clip.transitionIn?.type === tr.type ? 'rgba(124,92,255,0.2)' : undefined, borderColor: clip.transitionIn?.type === tr.type ? 'var(--accent)' : undefined }} onClick={() => onUpdate(clip.id, { transitionIn: makeTransition(tr.type, clip.transitionIn?.duration ?? 0.5) })}>{tr.label}</button>
        ))}
      </div>
      {clip.transitionIn && (
        <Row label={`In Duration (${clip.transitionIn.duration.toFixed(2)}s)`}><Slider value={clip.transitionIn.duration} min={0.1} max={2} step={0.05} onChange={(v) => onUpdate(clip.id, { transitionIn: { ...clip.transitionIn!, duration: v } })} /></Row>
      )}
      <h4 style={h4}>Transition Out</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: '0.7rem' }}>
        <button className="btn ghost" style={{ fontSize: '0.6rem', justifyContent: 'center' }} onClick={() => onUpdate(clip.id, { transitionOut: undefined })}>None</button>
        {TRANSITIONS.map((tr) => (
          <button key={tr.type} className="btn ghost" style={{ fontSize: '0.6rem', justifyContent: 'center', background: clip.transitionOut?.type === tr.type ? 'rgba(124,92,255,0.2)' : undefined, borderColor: clip.transitionOut?.type === tr.type ? 'var(--accent)' : undefined }} onClick={() => onUpdate(clip.id, { transitionOut: makeTransition(tr.type, clip.transitionOut?.duration ?? 0.5) })}>{tr.label}</button>
        ))}
      </div>
      {clip.transitionOut && (
        <Row label={`Out Duration (${clip.transitionOut.duration.toFixed(2)}s)`}><Slider value={clip.transitionOut.duration} min={0.1} max={2} step={0.05} onChange={(v) => onUpdate(clip.id, { transitionOut: { ...clip.transitionOut!, duration: v } })} /></Row>
      )}
    </>
  );
}

function KeyframesTab({ clip }: { clip: Clip }) {
  return (
    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
      <p style={{ marginBottom: '0.5rem' }}>Keyframe animation is available for position, scale, rotation, opacity, and volume properties.</p>
      <p style={{ marginBottom: '0.5rem' }}>Use the timeline to add keyframes at specific times. Bezier, linear, and hold interpolation are supported.</p>
      <p>Clip speed: {clip.speed}× · Reverse: {clip.reverse ? 'yes' : 'no'}</p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.4rem 0.5rem',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text)',
  fontSize: '0.74rem',
};

const h4: React.CSSProperties = {
  fontSize: '0.6rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-dim)',
  fontWeight: 600,
  margin: '0.4rem 0 0.5rem',
  paddingTop: '0.5rem',
  borderTop: '1px solid var(--border)',
};
