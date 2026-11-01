import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Film, ImageIcon, Cpu, Activity, Layers } from 'lucide-react';
import GridOverlay from './components/GridOverlay';
import PromptInput from './components/PromptInput';
import Gallery from './components/Gallery';
import SettingsPanel from './components/Settings';
import { MODELS, generate } from './lib/models';
import { loadGallery, saveGallery, loadSettings, saveSettings } from './lib/storage';
import type { ModelDef, GenItem, Settings } from './types';

let idCounter = 0;
const nextId = () => `gen-${Date.now()}-${idCounter++}`;

export default function App() {
  const [model, setModel] = useState<ModelDef>(MODELS[0]);
  const [items, setItems] = useState<GenItem[]>([]);
  const [settings, setSettings] = useState<Settings>({ apiKeys: {}, theme: 'dark' });
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    setItems(loadGallery());
    setSettings(loadSettings());
  }, []);

  // Persist gallery
  useEffect(() => {
    saveGallery(items);
  }, [items]);

  const handleGenerate = useCallback(
    async (prompt: string) => {
      setIsGenerating(true);
      const item: GenItem = {
        id: nextId(),
        modelId: model.id,
        modelName: model.name,
        category: model.category,
        prompt,
        status: 'queued',
        createdAt: Date.now(),
        accent: model.accent,
      };
      setItems((prev) => [item, ...prev]);

      const ac = new AbortController();
      abortRef.current = ac;

      // Move to running shortly (simulate queue transition)
      setTimeout(() => {
        setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: 'running' } : it)));
      }, 300);

      try {
        const { url } = await generate(model, prompt, ac.signal);
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'done', resultUrl: url, thumbnailUrl: url } : it
          )
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'error', error: String(err) } : it))
        );
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [model]
  );

  const handleExport = useCallback(async (item: GenItem) => {
    if (window.canvasAPI?.saveFile) {
      const result = await window.canvasAPI.saveFile({
        defaultName: `canvas-${item.id}.${item.category === 'video' ? 'mp4' : 'png'}`,
        data: item.resultUrl || '',
        extension: item.category === 'video' ? 'mp4' : 'png',
      });
      if (!result.canceled && result.filePath && item.resultUrl) {
        // In a real app we'd write the buffer; here we just open the URL
        window.open(item.resultUrl, '_blank');
      }
    } else if (item.resultUrl) {
      window.open(item.resultUrl, '_blank');
    }
  }, []);

  const handleSaveSettings = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const imageCount = items.filter((i) => i.category === 'image').length;
  const videoCount = items.filter((i) => i.category === 'video').length;
  const runningCount = items.filter((i) => i.status === 'running' || i.status === 'queued').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <GridOverlay />

      {/* Header */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(5,5,9,0.6)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {/* Gradient C logo */}
          <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: 'linear-gradient(135deg, var(--purple), var(--cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 20,
              color: '#050509',
              boxShadow: '0 0 20px rgba(145,70,255,0.5)',
              fontFamily: 'var(--font)',
            }}
          >
            C
          </motion.div>
          <div>
            <h1 className="brand-gradient" style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>
              The Canvas
            </h1>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>
              powered by Momentum Labs
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Stat icon={<ImageIcon size={13} color="var(--cyan)" />} label="Images" value={imageCount} />
            <Stat icon={<Film size={13} color="var(--emerald)" />} label="Videos" value={videoCount} />
            <Stat icon={<Activity size={13} color={runningCount > 0 ? 'var(--emerald)' : 'var(--text-dim)'} />} label="Active" value={runningCount} />
          </div>
          <SettingsPanel settings={settings} onSave={handleSaveSettings} />
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Sidebar — Prompt + Queue */}
        <aside
          style={{
            width: 360,
            minWidth: 300,
            padding: '1.2rem',
            overflowY: 'auto',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <PromptInput model={model} onModelChange={setModel} onGenerate={handleGenerate} isGenerating={isGenerating} />

          {/* Queue */}
          <div className="glass" style={{ padding: '1rem', position: 'relative' }}>
            <span className="bracket tl" />
            <span className="bracket tr" />
            <span className="bracket bl" />
            <span className="bracket br" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
              <Layers size={14} color="var(--emerald)" />
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', fontWeight: 600 }}>
                Queue
              </span>
            </div>
            {items.filter((i) => i.status === 'queued' || i.status === 'running').length === 0 ? (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Queue empty</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {items
                  .filter((i) => i.status === 'queued' || i.status === 'running')
                  .map((q) => (
                    <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(145,70,255,0.06)', borderRadius: 6 }}>
                      <span className={`status-dot ${q.status}`} />
                      <span style={{ fontSize: '0.7rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.prompt}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{q.modelName}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Model info */}
          <div className="glass" style={{ padding: '1rem', position: 'relative', marginTop: 'auto' }}>
            <span className="bracket tl" style={{ borderColor: model.accent }} />
            <span className="bracket tr" style={{ borderColor: model.accent }} />
            <span className="bracket bl" style={{ borderColor: model.accent }} />
            <span className="bracket br" style={{ borderColor: model.accent }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Cpu size={14} color={model.accent} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{model.name}</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{model.description}</p>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {model.provider}
            </p>
          </div>
        </aside>

        {/* Main gallery area */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1.2rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Sparkles size={16} color="var(--purple)" />
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>
              Gallery
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>· {items.length} items</span>
          </div>
          <Gallery items={items} onExport={handleExport} />
        </main>
      </div>

      {/* Footer status bar */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.4rem 1.5rem',
          borderTop: '1px solid var(--border)',
          background: 'rgba(5,5,9,0.6)',
          backdropFilter: 'blur(12px)',
          fontSize: '0.65rem',
          color: 'var(--text-dim)',
          zIndex: 10,
          position: 'relative',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="status-dot done" />
          <span>{isGenerating ? 'Generating…' : 'System ready'}</span>
        </span>
        <span>{MODELS.length} models · {window.canvasAPI?.platform || 'web'} · Momentum Labs</span>
      </footer>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      {icon}
      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
