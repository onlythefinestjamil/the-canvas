import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Zap, History as HistoryIcon } from 'lucide-react';
import ModelSelector from './ModelSelector';
import ModelSettings from './ModelSettings';
import type { ModelDef, GenSettings } from '../types';

interface Props {
  model: ModelDef;
  onModelChange: (m: ModelDef) => void;
  onGenerate: (prompt: string, settings: GenSettings) => void;
  isGenerating: boolean;
  genSettings: GenSettings;
  onGenSettingsChange: (s: GenSettings) => void;
  creditsLeft: number;
  onOpenHistory: () => void;
}

export default function PromptInput({
  model,
  onModelChange,
  onGenerate,
  isGenerating,
  genSettings,
  onGenSettingsChange,
  creditsLeft,
  onOpenHistory,
}: Props) {
  const [prompt, setPrompt] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim(), genSettings);
    }
  };

  const noCredits = creditsLeft <= 0;
  const batch = genSettings.batchCount || 1;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card" style={{ padding: '1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={15} color="var(--accent)" />
          <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>
            Create
          </span>
        </div>
        <button onClick={onOpenHistory} className="icon-btn" style={{ padding: '0.3rem 0.5rem' }} title="Prompt history">
          <HistoryIcon size={14} />
        </button>
      </div>

      <ModelSelector value={model} onChange={onModelChange} />

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKey}
        placeholder={`Describe what you want ${model.name} to create…`}
        rows={4}
        style={{
          width: '100%',
          marginTop: '0.7rem',
          padding: '0.7rem 0.8rem',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          resize: 'none',
          fontSize: '0.86rem',
          lineHeight: 1.5,
        }}
      />

      <button
        onClick={() => setShowSettings((s) => !s)}
        className="icon-btn"
        style={{ width: '100%', marginTop: '0.6rem', justifyContent: 'center' }}
      >
        {showSettings ? 'Hide' : 'Show'} {model.category === 'image' ? 'image' : 'video'} settings
        {batch > 1 ? ` · ${batch} variations` : ''}
      </button>

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <ModelSettings model={model} settings={genSettings} onChange={onGenSettingsChange} />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
        <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>
          {noCredits ? 'No credits left this month' : prompt.trim() ? `${prompt.trim().length} chars · ⌘⏎ to generate` : '⌘/Ctrl + Enter to generate'}
        </span>
        <button
          className="btn"
          onClick={() => prompt.trim() && onGenerate(prompt.trim(), genSettings)}
          disabled={!prompt.trim() || isGenerating || noCredits}
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="spin" /> Generating
            </>
          ) : (
            <>
              <Zap size={14} /> Generate{batch > 1 ? ` ×${batch}` : ''}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
