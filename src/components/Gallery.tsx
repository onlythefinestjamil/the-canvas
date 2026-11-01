import { motion } from 'framer-motion';
import { Download, Film, ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import type { GenItem } from '../types';

interface Props {
  items: GenItem[];
  onExport: (item: GenItem) => void;
}

export default function Gallery({ items, onExport }: Props) {
  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.8rem', color: 'var(--text-dim)' }}>
        <ImageIcon size={48} opacity={0.3} />
        <p style={{ fontSize: '0.9rem' }}>No generations yet</p>
        <p style={{ fontSize: '0.72rem' }}>Your gallery will appear here</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '0.8rem',
        alignContent: 'start',
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          className="tile"
          style={{ aspectRatio: '1 / 1', ['--accent' as string]: item.accent }}
        >
          {item.status === 'done' && item.resultUrl && (
            <img src={item.resultUrl} alt={item.prompt} loading="lazy" />
          )}
          {item.status === 'running' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem' }}>
              <Loader2 size={22} className="spin" color={item.accent} />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Synthesizing…</span>
            </div>
          )}
          {item.status === 'queued' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem' }}>
              <span className="status-dot queued" />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Queued</span>
            </div>
          )}
          {item.status === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: 'var(--pink)' }}>
              <AlertTriangle size={22} />
              <span style={{ fontSize: '0.68rem' }}>Failed</span>
            </div>
          )}

          {/* overlay meta */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '0.5rem',
              background: 'linear-gradient(to top, rgba(5,5,9,0.9), transparent 60%)',
              opacity: 0,
              transition: 'opacity 0.25s',
            }}
            className="tile-overlay"
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
          >
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', alignSelf: 'flex-start' }}>
              {item.category === 'video' ? <Film size={12} color={item.accent} /> : <ImageIcon size={12} color={item.accent} />}
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {item.modelName}
              </span>
            </div>
            {item.status === 'done' && (
              <button
                onClick={() => onExport(item)}
                style={{
                  alignSelf: 'flex-end',
                  padding: '0.3rem 0.6rem',
                  background: 'rgba(145,70,255,0.3)',
                  border: '1px solid var(--purple)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.65rem',
                }}
              >
                <Download size={11} /> Save
              </button>
            )}
            <p style={{ fontSize: '0.66rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.prompt}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
