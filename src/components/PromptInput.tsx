import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Zap } from 'lucide-react';
import ModelSelector from './ModelSelector';
import type { ModelDef } from '../types';

interface Props {
  model: ModelDef;
  onModelChange: (m: ModelDef) => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export default function PromptInput({ model, onModelChange, onGenerate, isGenerating }: Props) {
  const [prompt, setPrompt] = useState('');

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass"
      style={{ padding: '1.2rem', position: 'relative' }}
    >
      <span className="bracket tl" />
      <span className="bracket tr" />
      <span className="bracket bl" />
      <span className="bracket br" />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
        <Sparkles size={16} color={model.accent} />
        <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', fontWeight: 600 }}>
          Create
        </span>
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
          marginTop: '0.8rem',
          padding: '0.8rem',
          background: 'rgba(5,5,9,0.7)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          resize: 'none',
          fontSize: '0.88rem',
          lineHeight: 1.5,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
          {prompt.trim() ? `${prompt.trim().length} chars` : '⌘/Ctrl + Enter to generate'}
        </span>
        <button
          className="glow-btn"
          onClick={() => prompt.trim() && onGenerate(prompt.trim())}
          disabled={!prompt.trim() || isGenerating}
          style={{ ['--accent' as string]: model.accent }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="spin" style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Generating
            </>
          ) : (
            <>
              <Zap size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Generate
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
