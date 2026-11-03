import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clapperboard, Film, Music2, Smartphone, ScrollText, ListVideo, Eye,
  Copy, Download, FileText, Save, Sparkles, ChevronRight, Hash,
} from 'lucide-react';
import {
  generateScript,
  scriptToText,
  HDPC_FRAMEWORK,
  TOP_HOOKS,
  POPPIN_CONCEPTS,
  OTF_COMMERCIAL_CONCEPTS,
  type ScriptMode,
  type ScriptInput,
  type AnyScript,
  type CommercialScript,
  type MusicVideoTreatment,
  type SocialScript,
  type Screenplay,
  type ShotList,
  type DirectorsTreatment,
} from '../lib/scriptwriter';
import { loadGallery, saveGallery } from '../lib/storage';
import type { GenItem } from '../types';

interface Props {
  onBack: () => void;
}

const MODES: { id: ScriptMode; label: string; icon: React.ReactNode; desc: string; accent: string }[] = [
  { id: 'commercial', label: 'Commercial Ad', icon: <Clapperboard size={16} />, desc: 'Shot-by-shot, 15s to 90s, multi-angle', accent: '#7c5cff' },
  { id: 'music-video', label: 'Music Video', icon: <Music2 size={16} />, desc: 'Scene-by-scene treatment document', accent: '#ff6b3d' },
  { id: 'social', label: 'Social Media', icon: <Smartphone size={16} />, desc: 'Reels, TikToks, Shorts - hook to CTA', accent: '#22d3ee' },
  { id: 'screenplay', label: 'Screenplay', icon: <ScrollText size={16} />, desc: 'Industry standard, Courier 12pt', accent: '#c9a227' },
  { id: 'shot-list', label: 'Shot List', icon: <ListVideo size={16} />, desc: 'Numbered shot breakdown for the day', accent: '#34d399' },
  { id: 'director', label: "Director's Treatment", icon: <Eye size={16} />, desc: 'Visual style, tone, grade, refs', accent: '#f472b6' },
];

const PLATFORMS: { id: ScriptInput['platform']; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'tv', label: 'TV' },
];

const DURATIONS: { id: 15 | 30 | 60 | 90; label: string }[] = [
  { id: 15, label: '15s' },
  { id: 30, label: '30s' },
  { id: 60, label: '60s' },
  { id: 90, label: '90s' },
];

export default function ScriptStudio({ onBack }: Props) {
  const [mode, setMode] = useState<ScriptMode>('commercial');
  const [brand, setBrand] = useState('');
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [platform, setPlatform] = useState<ScriptInput['platform']>('instagram');
  const [duration, setDuration] = useState<15 | 30 | 60 | 90>(30);
  const [styleRefs, setStyleRefs] = useState('');
  const [tone, setTone] = useState('');
  const [script, setScript] = useState<AnyScript | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const input: ScriptInput = useMemo(
    () => ({ brand: brand || 'OTF', product: product || undefined, audience: audience || undefined, platform, duration, styleRefs: styleRefs || undefined, tone: tone || undefined }),
    [brand, product, audience, platform, duration, styleRefs, tone]
  );

  const handleGenerate = useCallback(() => {
    setScript(generateScript(mode, input));
    setCopied(false);
    setSaved(false);
  }, [mode, input]);

  const handleCopy = useCallback(async () => {
    if (!script) return;
    const text = scriptToText(script);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [script]);

  const downloadBlob = useCallback((text: string, name: string, ext: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportText = useCallback(() => {
    if (!script) return;
    const text = scriptToText(script);
    if (window.canvasAPI?.saveFile) {
      window.canvasAPI.saveFile({ defaultName: `${script.mode}-${Date.now()}`, data: text, extension: 'txt' });
    } else {
      downloadBlob(text, `${script.mode}-${Date.now()}`, 'txt');
    }
  }, [script, downloadBlob]);

  const handleExportPdf = useCallback(() => {
    if (!script) return;
    // Print-friendly HTML that the user can Save as PDF
    const text = scriptToText(script);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${script.mode} script</title>
<style>body{font-family:monospace;background:#0a0a0a;color:#f5f5f7;padding:2.5rem;max-width:7.5in;margin:0 auto;white-space:pre-wrap;line-height:1.5}
h1{font-family:sans-serif;color:#7c5cff}</style></head>
<body><h1>The Canvas - Script Studio</h1>${text}</body></html>`;
    if (window.canvasAPI?.saveFile) {
      window.canvasAPI.saveFile({ defaultName: `${script.mode}-${Date.now()}`, data: html, extension: 'html' });
    } else {
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
        setTimeout(() => w.print(), 400);
      } else {
        downloadBlob(html, `${script.mode}-${Date.now()}`, 'html');
      }
    }
  }, [script, downloadBlob]);

  const handleSaveToGallery = useCallback(() => {
    if (!script) return;
    const items = loadGallery();
    const text = scriptToText(script);
    const item: GenItem = {
      id: `script-${Date.now()}`,
      modelId: 'script-studio',
      modelName: 'Script Studio',
      category: 'image',
      prompt: `${mode}: ${brand || 'OTF'} ${product || ''}`.trim(),
      status: 'done',
      resultUrl: undefined,
      createdAt: Date.now(),
      accent: MODES.find((m) => m.id === mode)?.accent || '#7c5cff',
    };
    // Persist the script text in the prompt so it survives reloads
    item.prompt = `${item.prompt}\n\n${text}`;
    saveGallery([item, ...items].slice(0, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }, [script, mode, brand, product]);

  return (
    <div className="scriptstudio">
      <nav className="scriptstudio-nav">
        <div className="scriptstudio-nav-brand">
          <Clapperboard size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <strong>Script Studio</strong>
            <span>The Canvas - AI script generation</span>
          </div>
        </div>
        <button className="scriptstudio-back" onClick={onBack}>{'<-'} The Canvas</button>
      </nav>

      <div className="scriptstudio-body">
        <aside className="scriptstudio-side">
          {/* Mode selector */}
          <div className="card" style={{ padding: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
              <Sparkles size={14} color="var(--accent)" />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>Mode</span>
            </div>
            <div className="scriptstudio-modes">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className={`scriptstudio-mode ${mode === m.id ? 'active' : ''}`}
                  onClick={() => setMode(m.id)}
                  style={mode === m.id ? ({ '--mode-accent': m.accent } as React.CSSProperties) : undefined}
                >
                  <span className="scriptstudio-mode-icon" style={{ color: m.accent }}>{m.icon}</span>
                  <div className="scriptstudio-mode-text">
                    <strong>{m.label}</strong>
                    <span>{m.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input form */}
          <div className="card" style={{ padding: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
              <Film size={14} color="var(--accent)" />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>Brief</span>
            </div>
            <label className="scriptstudio-field">
              <span>Brand / Artist</span>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. OTF" />
            </label>
            <label className="scriptstudio-field">
              <span>Product / Track</span>
              <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. Heat Index Tracksuit" />
            </label>
            <label className="scriptstudio-field">
              <span>Target Audience</span>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. streetwear buyers 18-34" />
            </label>
            <label className="scriptstudio-field">
              <span>Platform</span>
              <div className="seg">
                {PLATFORMS.map((p) => (
                  <button key={p.id} className={platform === p.id ? 'active' : ''} onClick={() => setPlatform(p.id)}>{p.label}</button>
                ))}
              </div>
            </label>
            <label className="scriptstudio-field">
              <span>Duration</span>
              <div className="seg">
                {DURATIONS.map((d) => (
                  <button key={d.id} className={duration === d.id ? 'active' : ''} onClick={() => setDuration(d.id)}>{d.label}</button>
                ))}
              </div>
            </label>
            <label className="scriptstudio-field">
              <span>Style References</span>
              <input value={styleRefs} onChange={(e) => setStyleRefs(e.target.value)} placeholder="e.g. Saint Laurent, Apple" />
            </label>
            <label className="scriptstudio-field">
              <span>Tone</span>
              <input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. bold, nocturnal" />
            </label>
            <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={handleGenerate}>
              <Sparkles size={14} /> Generate {MODES.find((m) => m.id === mode)?.label}
            </button>
          </div>

          {/* HDPC framework */}
          <div className="card" style={{ padding: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Hash size={14} color="var(--accent)" />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>HDPC Framework</span>
            </div>
            {HDPC_FRAMEWORK.map((b) => (
              <div key={b.label} className="scriptstudio-hdpc">
                <strong>{b.label} <em>{b.range}</em></strong>
                <span>{b.description}</span>
              </div>
            ))}
          </div>

          {/* Top hooks */}
          <div className="card" style={{ padding: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Sparkles size={14} color="var(--accent)" />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>Top Hooks</span>
            </div>
            {TOP_HOOKS.map((h) => (
              <div key={h.name} className="scriptstudio-hook">
                <strong>{h.name} <em>{Math.round(h.weight * 100)}%</em></strong>
                <span>{h.template}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="scriptstudio-main">
          <div className="scriptstudio-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-dot done" />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {script ? `${MODES.find((m) => m.id === script.mode)?.label} - ready` : 'No script yet'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="icon-btn" disabled={!script} onClick={handleCopy} title="Copy to clipboard">
                <Copy size={13} /> {copied ? 'Copied' : 'Copy'}
              </button>
              <button className="icon-btn" disabled={!script} onClick={handleExportText} title="Export as .txt">
                <FileText size={13} /> Text
              </button>
              <button className="icon-btn" disabled={!script} onClick={handleExportPdf} title="Export / print as PDF">
                <Download size={13} /> PDF
              </button>
              <button className="icon-btn" disabled={!script} onClick={handleSaveToGallery} title="Save to gallery">
                <Save size={13} /> {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {script ? (
              <motion.div
                key={script.mode + (brand + product + duration)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="scriptstudio-output"
              >
                {script.mode === 'commercial' && <CommercialView script={script as CommercialScript} />}
                {script.mode === 'music-video' && <MusicVideoView script={script as MusicVideoTreatment} />}
                {script.mode === 'social' && <SocialView script={script as SocialScript} />}
                {script.mode === 'screenplay' && <ScreenplayView script={script as Screenplay} />}
                {script.mode === 'shot-list' && <ShotListView script={script as ShotList} />}
                {script.mode === 'director' && <DirectorView script={script as DirectorsTreatment} />}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="scriptstudio-empty"
              >
                <Clapperboard size={40} style={{ color: 'var(--text-faint)', marginBottom: '0.8rem' }} />
                <h2>Pick a mode and fill the brief</h2>
                <p>Choose one of six script modes, set the brand and platform, then generate. Multiple creative variations come back instantly.</p>
                <div className="scriptstudio-empty-cards">
                  {MODES.map((m) => (
                    <button key={m.id} className="scriptstudio-empty-card" onClick={() => { setMode(m.id); }}>
                      <span style={{ color: m.accent }}>{m.icon}</span>
                      <strong>{m.label}</strong>
                      <span>{m.desc}</span>
                      <ChevronRight size={13} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Templates */}
          <section className="scriptstudio-templates">
            <h3>21 Poppin Concepts</h3>
            <div className="scriptstudio-template-grid">
              {POPPIN_CONCEPTS.map((c) => (
                <motion.div key={c.id} className="card scriptstudio-template-card" whileHover={{ y: -2 }}>
                  <div className="scriptstudio-template-head">
                    <span className="scriptstudio-template-num">{c.id}</span>
                    <strong>{c.name}</strong>
                    <span className="scriptstudio-template-cat">{c.category}</span>
                  </div>
                  <p>{c.description}</p>
                  <div className="scriptstudio-hdpc-mini">
                    <span><b>Hook</b> {c.hdpc.hook}</span>
                    <span><b>Demo</b> {c.hdpc.demo}</span>
                    <span><b>Proof</b> {c.hdpc.proof}</span>
                    <span><b>CTA</b> {c.hdpc.cta}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="scriptstudio-templates">
            <h3>8 OTF Commercial Concepts</h3>
            <div className="scriptstudio-template-grid">
              {OTF_COMMERCIAL_CONCEPTS.map((c) => (
                <motion.div key={c.id} className="card scriptstudio-template-card scriptstudio-otf" whileHover={{ y: -2 }}>
                  <div className="scriptstudio-template-head">
                    <span className="scriptstudio-template-num otf">{c.id}</span>
                    <strong>{c.name}</strong>
                    <span className="scriptstudio-template-cat otf">OTF</span>
                  </div>
                  <p>{c.description}</p>
                  <div className="scriptstudio-hdpc-mini">
                    <span><b>Hook</b> {c.hdpc.hook}</span>
                    <span><b>Demo</b> {c.hdpc.demo}</span>
                    <span><b>Proof</b> {c.hdpc.proof}</span>
                    <span><b>CTA</b> {c.hdpc.cta}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View components per mode
// ---------------------------------------------------------------------------

function CommercialView({ script }: { script: CommercialScript }) {
  return (
    <div className="scriptstudio-script">
      <header className="scriptstudio-script-head">
        <h2>{script.brand} - {script.duration}s Commercial</h2>
        <span className="scriptstudio-pill">{script.platform}</span>
        <span className="scriptstudio-pill">{script.variations.length} variations</span>
      </header>
      {script.variations.map((v) => (
        <div key={v.title} className="card scriptstudio-variation">
          <div className="scriptstudio-variation-head">
            <h3>{v.title}</h3>
            <span className="scriptstudio-pill ghost">{v.platform}</span>
          </div>
          <p className="scriptstudio-variation-angle">{v.angle}</p>
          <div className="scriptstudio-table">
            <div className="scriptstudio-table-head">
              <span>TIME</span><span>VISUAL</span><span>AUDIO</span><span>ON-SCREEN TEXT</span>
            </div>
            {v.shots.map((s, i) => (
              <div key={i} className="scriptstudio-table-row">
                <span className="mono">{s.time}</span>
                <span>{s.visual}</span>
                <span>{s.audio}</span>
                <span>{s.onScreenText || '-'}</span>
                <div className="scriptstudio-shot-meta">
                  <em>{s.cameraAngle} - {s.lens} - {s.movement} - {s.lighting}</em>
                  <em>VO: {s.voiceover} | {s.musicSfx}</em>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MusicVideoView({ script }: { script: MusicVideoTreatment }) {
  return (
    <div className="scriptstudio-script">
      <header className="scriptstudio-script-head">
        <h2>{script.title}</h2>
        <span className="scriptstudio-pill">{script.scenes.length} scenes</span>
      </header>
      <div className="card scriptstudio-treatment">
        <div className="scriptstudio-treatment-grid">
          <div><b>Visual style</b><span>{script.visualStyle}</span></div>
          <div><b>Mood</b><span>{script.mood}</span></div>
          <div><b>Pacing</b><span>{script.pacing}</span></div>
          <div>
            <b>Color palette</b>
            <span className="scriptstudio-palette">
              {script.colorPalette.map((c) => <i key={c} style={{ background: c }} />)}
            </span>
          </div>
        </div>
      </div>
      {script.scenes.map((s) => (
        <div key={s.scene} className="card scriptstudio-scene">
          <div className="scriptstudio-scene-head">
            <h3>Scene {s.scene}</h3>
            <span className="scriptstudio-pill ghost">{s.location}</span>
          </div>
          <p>{s.description}</p>
          <div className="scriptstudio-scene-shots">
            {s.shotList.map((sh, i) => <span key={i} className="scriptstudio-chip">{sh}</span>)}
          </div>
          <div className="scriptstudio-scene-meta">
            <span><b>Light</b> {s.lighting}</span>
            <span><b>Wardrobe</b> {s.wardrobe}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialView({ script }: { script: SocialScript }) {
  return (
    <div className="scriptstudio-script">
      <header className="scriptstudio-script-head">
        <h2>{script.brand} - Social ({script.platform})</h2>
        <span className="scriptstudio-pill">{script.variations.length} variations</span>
      </header>
      {script.variations.map((v) => (
        <div key={v.title} className="card scriptstudio-social">
          <div className="scriptstudio-social-head">
            <h3>{v.title}</h3>
            <span className="scriptstudio-pill ghost">{v.hookType}</span>
          </div>
          <div className="scriptstudio-social-hook"><b>HOOK (0-3s)</b><span>{v.hook}</span></div>
          <div className="scriptstudio-social-body">
            <b>BODY</b>
            <ul>{v.body.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </div>
          <div className="scriptstudio-social-cta"><b>CTA</b><span>{v.cta}</span></div>
          <div className="scriptstudio-social-foot">
            <span><b>Captions</b> {v.captions}</span>
            <span className="mono">{v.hashtags}</span>
            <span><b>Audio</b> {v.audioSuggestion}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScreenplayView({ script }: { script: Screenplay }) {
  return (
    <div className="scriptstudio-script">
      <header className="scriptstudio-script-head">
        <h2>{script.title}</h2>
        <span className="scriptstudio-pill">Screenplay</span>
      </header>
      <p className="scriptstudio-format-note">{script.format}</p>
      <div className="scriptstudio-screenplay mono">
        {script.scenes.map((s, i) => (
          <div key={i} className="scriptstudio-sp-scene">
            <div className="scriptstudio-sp-heading">{s.heading}</div>
            <div className="scriptstudio-sp-action">{s.action}</div>
            {s.dialogue.map((d, j) => (
              <div key={j} className="scriptstudio-sp-dialogue">
                <div className="scriptstudio-sp-character">{d.character}</div>
                {d.parenthetical && <div className="scriptstudio-sp-paren">({d.parenthetical})</div>}
                <div className="scriptstudio-sp-line">{d.line}</div>
              </div>
            ))}
            <div className="scriptstudio-sp-transition">{s.transition}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShotListView({ script }: { script: ShotList }) {
  return (
    <div className="scriptstudio-script">
      <header className="scriptstudio-script-head">
        <h2>Shot List - {script.project}</h2>
        <span className="scriptstudio-pill">{script.shots.length} shots</span>
      </header>
      <div className="scriptstudio-shotlist-table card">
        <div className="scriptstudio-shotlist-head">
          <span>#</span><span>SCENE</span><span>TYPE</span><span>MOVE</span><span>LENS</span><span>LIGHT</span><span>DUR</span><span>NOTES</span>
        </div>
        {script.shots.map((s) => (
          <div key={s.shot} className="scriptstudio-shotlist-row">
            <span className="scriptstudio-shotlist-num">{s.shot}</span>
            <span>{s.scene}</span>
            <span>{s.shotType}</span>
            <span>{s.cameraMovement}</span>
            <span className="mono">{s.lens}</span>
            <span>{s.lighting}</span>
            <span className="mono">{s.duration}</span>
            <span>{s.notes}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DirectorView({ script }: { script: DirectorsTreatment }) {
  return (
    <div className="scriptstudio-script">
      <header className="scriptstudio-script-head">
        <h2>Director's Treatment - {script.brand}</h2>
        <span className="scriptstudio-pill">Treatment</span>
      </header>
      <div className="card scriptstudio-treatment">
        <div className="scriptstudio-treatment-grid">
          <div><b>Visual style</b><span>{script.visualStyle}</span></div>
          <div><b>Tone</b><span>{script.tone}</span></div>
          <div><b>Mood</b><span>{script.mood}</span></div>
          <div><b>Color grading</b><span>{script.colorGrading}</span></div>
          <div><b>Pacing</b><span>{script.pacing}</span></div>
          <div><b>Music</b><span>{script.musicDirection}</span></div>
        </div>
      </div>
      <div className="card scriptstudio-director-rows">
        <h3>Lensing</h3>
        <ul>{script.lensing.map((l, i) => <li key={i}>{l}</li>)}</ul>
        <h3 style={{ marginTop: '1rem' }}>Reference films</h3>
        <ul>{script.referenceFilms.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>
    </div>
  );
}
