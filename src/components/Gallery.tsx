import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Film, ImageIcon, Loader2, AlertTriangle, Pencil } from 'lucide-react';
import type { GenItem } from '../types';
import ImageEditor from './ImageEditor';

interface Props {
  items: GenItem[];
  onEdit?: (item: GenItem) => void;
}

export default function Gallery({ items, onEdit }: Props) {
  const [active, setActive] = useState<GenItem | null>(null);

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.7rem', color: 'var(--text-dim)' }}>
        <ImageIcon size={42} opacity={0.3} />
        <p style={{ fontSize: '0.86rem' }}>No generations yet</p>
        <p style={{ fontSize: '0.7rem' }}>Your gallery will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.7rem', alignContent: 'start' }}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.02, 0.2) }}
            className="tile"
            style={{ aspectRatio: '1 / 1' }}
            onClick={() => item.status === 'done' && item.resultUrl && setActive(item)}
          >
            {item.status === 'done' && item.resultUrl && (
              item.category === 'video' ? (
                <video src={item.resultUrl} muted loop autoPlay playsInline />
              ) : (
                <img src={item.resultUrl} alt={item.prompt} loading="lazy" />
              )
            )}
            {item.status === 'running' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.4rem' }}>
                <Loader2 size={20} className="spin" color="var(--accent)" />
                <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>Rendering…</span>
              </div>
            )}
            {item.status === 'queued' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.4rem' }}>
                <span className="status-dot queued" />
                <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>Queued</span>
              </div>
            )}
            {item.status === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.4rem', color: '#f87171', padding: '0.5rem', textAlign: 'center' }} title={item.error}>
                <AlertTriangle size={20} />
                <span style={{ fontSize: '0.6rem' }}>{(item.error || 'Failed').slice(0, 40)}</span>
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)',
                opacity: 0,
                transition: 'opacity var(--transition)',
              }}
              className="tile-overlay"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                {item.category === 'video' ? <Film size={11} color="var(--accent)" /> : <ImageIcon size={11} color="var(--accent)" />}
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{item.modelName}</span>
              </div>
              {item.batchTotal && item.batchTotal > 1 && (
                <span style={{ fontSize: '0.58rem', color: 'var(--text-dim)', alignSelf: 'flex-start' }}>
                  {item.batchIndex! + 1}/{item.batchTotal}
                </span>
              )}
              <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.prompt}
              </p>
              {onEdit && item.category === 'image' && item.status === 'done' && item.resultUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  style={{
                    position: 'absolute', bottom: '0.4rem', right: '0.4rem',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.3rem 0.5rem', border: '1px solid var(--border-bright)',
                    borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text)',
                    cursor: 'pointer', fontSize: '0.62rem', fontWeight: 600,
                  }}
                >
                  <Pencil size={11} /> Edit
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {active && <ImageEditor item={active} onClose={() => setActive(null)} />}
    </>
  );
}
