import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Film, ImageIcon, Layers, LogOut, User as UserIcon, Pencil, Clapperboard } from 'lucide-react';
import PromptInput from './components/PromptInput';
import Gallery from './components/Gallery';
import SettingsPanel from './components/Settings';
import Auth from './components/Auth';
import PromptHistory from './components/PromptHistory';
import PhotoEditor from './components/PhotoEditor';
import VideoEditor from './components/video-editor/VideoEditor';
import type { VideoProject } from './lib/video/types';
import { createProject } from './lib/video/project';
import { makeClip } from './lib/video/clip';
import { addClip } from './lib/video/timeline';
import { MODELS } from './lib/models';
import { runBatch } from './lib/batch';
import { loadGallery, saveGallery, loadSettings, saveSettings } from './lib/storage';
import { loadUser, saveUser, logOut, upgradePlan } from './lib/auth';
import { creditsRemaining, canGenerate, resetUsage, usedThisMonth } from './lib/credits';
import { startCheckout, planInfo } from './lib/billing';
import type { ModelDef, GenItem, Settings, GenSettings, AuthUser, Plan, HistoryEntry } from './types';

export default function App() {
  const [model, setModel] = useState<ModelDef>(MODELS[0]);
  const [items, setItems] = useState<GenItem[]>([]);
  const [settings, setSettings] = useState<Settings>({ apiKeys: {}, theme: 'dark' });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [genSettings, setGenSettings] = useState<GenSettings>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [videoProject, setVideoProject] = useState<VideoProject | null>(null);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  const [view, setView] = useState<'studio'>('studio');

  useEffect(() => {
    setItems(loadGallery());
    setSettings(loadSettings());
    const u = loadUser();
    setUser(u);
  }, []);

  useEffect(() => {
    saveGallery(items);
  }, [items]);

  const creditsLeft = useMemo(() => creditsRemaining(user), [user, items]);
  const used = usedThisMonth();

  const handleGenerate = useCallback(
    async (prompt: string, gs: GenSettings) => {
      if (!user) {
        setAuthOpen(true);
        return;
      }
      if (!canGenerate(user)) return;
      setIsGenerating(true);
      try {
        await runBatch(
          model,
          prompt,
          gs,
          settings.apiKeys,
          (item) => setItems((prev) => [item, ...prev]),
          (id, patch) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [model, settings, user]
  );

  const handleSaveSettings = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const handleAuth = useCallback((u: AuthUser) => {
    setUser(u);
    saveUser(u);
  }, []);

  const handleLogout = useCallback(() => {
    logOut();
    setUser(null);
    setAuthOpen(true);
  }, []);


  const handleSelectPlan = useCallback(
    async (p: Plan) => {
      if (!user) {
        setAuthOpen(true);
        return;
      }
      if (p === user.plan) return;
      const res = await startCheckout(p);
      if (res.ok) {
        const updated = upgradePlan(p);
        if (p !== 'free') resetUsage();
        if (updated) {
          setUser(updated);
          setItems((prev) => [...prev]);
        }
      }
    },
    [user]
  );

  const handleHistorySelect = useCallback(
    (entry: HistoryEntry) => {
      const m = MODELS.find((mm) => mm.id === entry.modelId) || model;
      setModel(m);
      setGenSettings(entry.settings || {});
    },
    [model]
  );

  const imageCount = items.filter((i) => i.category === 'image').length;
  const videoCount = items.filter((i) => i.category === 'video').length;
  const runningCount = items.filter((i) => i.status === 'running' || i.status === 'queued').length;

  const planLabel = planInfo(user?.plan || 'free');
  const creditsDisplay = creditsLeft === Infinity ? '∞' : creditsLeft;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8rem 1.4rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <button onClick={() => setView('studio')} className="icon-btn" title="Back to studio" style={{ padding: '0.35rem 0.5rem' }}>
            ←
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 17,
              color: '#fff',
            }}
          >
            C
          </motion.div>
          <div>
            <h1 className="brand-gradient" style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>
              The Canvas
            </h1>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
              AI Creative Studio
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
            <Stat icon={<ImageIcon size={13} />} label="Images" value={imageCount} />
            <Stat icon={<Film size={13} />} label="Videos" value={videoCount} />
            <Stat icon={<Sparkles size={13} />} label="Active" value={runningCount} />
          </div>

          {user && (
            <div className="card" style={{ padding: '0.3rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{planLabel.name}</span>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent)' }}>{creditsDisplay}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{creditsLeft === Infinity ? 'credits' : 'left'}</span>
            </div>
          )}

          {user ? (
            <button onClick={handleLogout} className="icon-btn" title={`${user.email} — log out`}>
              <UserIcon size={14} /> {user.email.split('@')[0].slice(0, 8)}
              <LogOut size={13} style={{ marginLeft: 2 }} />
            </button>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="btn">Sign in</button>
          )}

          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            <button
              onClick={() => { setEditorImage(null); setEditorOpen(true); }}
              className="btn ghost"
              title="Open the image editor on a blank canvas"
              style={{ flexShrink: 0 }}
            >
              <Pencil size={14} /> New Canvas
            </button>

            <button
              onClick={() => { setVideoProject(null); setVideoEditorOpen(true); }}
              className="btn"
              title="Open the video editor on a new project"
              style={{ flexShrink: 0 }}
            >
              <Clapperboard size={14} /> New Video
            </button>

            <SettingsPanel settings={settings} onSave={handleSaveSettings} plan={user?.plan || 'free'} onSelectPlan={handleSelectPlan} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: 360, minWidth: 300, padding: '1rem', overflowY: 'auto', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <PromptInput
            model={model}
            onModelChange={setModel}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            genSettings={genSettings}
            onGenSettingsChange={setGenSettings}
            creditsLeft={creditsLeft === Infinity ? 999 : creditsLeft}
            onOpenHistory={() => setHistoryOpen(true)}
          />

          {/* Queue */}
          <div className="card" style={{ padding: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Layers size={14} color="var(--accent)" />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>Queue</span>
            </div>
            {runningCount === 0 ? (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Queue empty</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {items.filter((i) => i.status === 'queued' || i.status === 'running').map((q) => (
                  <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', background: 'var(--surface-2)', borderRadius: 6 }}>
                    <span className={`status-dot ${q.status}`} />
                    <span style={{ fontSize: '0.68rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.prompt}</span>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-dim)' }}>{q.modelName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Model info */}
          <div className="card" style={{ padding: '0.9rem', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: model.accent }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{model.name}</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{model.description}</p>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-faint)', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{model.provider}</p>
            {used > 0 && <p style={{ fontSize: '0.6rem', color: 'var(--text-faint)', marginTop: '0.3rem' }}>{used} used this cycle</p>}
          </div>
        </aside>

        {/* Gallery */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <Sparkles size={15} color="var(--accent)" />
            <h2 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>Gallery</h2>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>· {items.length} items</span>
          </div>
          <Gallery
            items={items}
            onEdit={(item) => { setEditorImage(item.resultUrl ?? null); setEditorOpen(true); }}
            onEditVideo={(item) => {
              if (!item.resultUrl) return;
              const proj = createProject(`Edit — ${item.prompt.slice(0, 28)}`);
              const vTrack = proj.tracks.find((t) => t.kind === 'video')!;
              const clip = makeClip(vTrack.id, { type: 'gallery', url: item.resultUrl, mediaType: 'video' }, 0, 5, {
                sourceDuration: 5,
                outPoint: 5,
                label: item.prompt.slice(0, 24),
              });
              setVideoProject(addClip(proj, clip));
              setVideoEditorOpen(true);
            }}
          />
        </main>
      </div>

      {/* Footer */}
      <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 1.4rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="status-dot done" />
          <span>{isGenerating ? 'Rendering…' : 'Ready'}</span>
        </span>
        <span>{MODELS.length} models · {window.canvasAPI?.platform || 'web'} · The Canvas</span>
      </footer>

      <Auth open={authOpen} onClose={() => setAuthOpen(false)} onAuth={handleAuth} />
      <PromptHistory open={historyOpen} onClose={() => setHistoryOpen(false)} onSelect={handleHistorySelect} />
      {editorOpen && (
        <PhotoEditor
          initialImage={editorImage}
          onClose={() => { setEditorOpen(false); setEditorImage(null); }}
        />
      )}
      {videoEditorOpen && (
        <VideoEditor
          galleryItems={items}
          initialProject={videoProject ?? undefined}
          onClose={() => { setVideoEditorOpen(false); setVideoProject(null); }}
        />
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      {icon}
      <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{value}</span>
    </div>
  );
}
