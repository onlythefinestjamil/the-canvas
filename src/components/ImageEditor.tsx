import { useState, useRef, useEffect } from 'react';
import { Download, Copy, Crop, X } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import type { GenItem } from '../types';
import { downloadItem, copyImageToClipboard } from '../lib/download';

interface Props {
  item: GenItem;
  onClose: () => void;
}

export default function ImageEditor({ item, onClose }: Props) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [copyMsg, setCopyMsg] = useState('');
  const [dlMsg, setDlMsg] = useState('');
  const isVideo = item.category === 'video';

  const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  const reset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setZoom(100);
  };

  const handleCopy = async () => {
    try {
      await copyImageToClipboard(item);
      setCopyMsg('Copied!');
    } catch (e) {
      setCopyMsg(String((e as Error).message || e));
    }
    setTimeout(() => setCopyMsg(''), 1800);
  };

  const handleDownload = async () => {
    try {
      await downloadItem(item);
      setDlMsg('Saved');
    } catch (e) {
      setDlMsg(String((e as Error).message || e));
    }
    setTimeout(() => setDlMsg(''), 1800);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={onClose}>
      <div className="card" style={{ width: 'min(900px, 96vw)', maxHeight: '92vh', overflowY: 'auto', padding: '1.2rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.modelName}</div>
          <button onClick={onClose} className="icon-btn" style={{ padding: '0.3rem' }}>
            <X size={15} />
          </button>
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '0.8rem' }}>{item.prompt}</p>

        <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000', marginBottom: '0.9rem', display: 'flex', justifyContent: 'center' }}>
          {isVideo ? (
            <VideoPlayer src={item.resultUrl!} />
          ) : (
            <img src={item.resultUrl} alt={item.prompt} style={{ width: '100%', maxWidth: zoom > 100 ? `${zoom}%` : '100%', filter, display: 'block' }} />
          )}
        </div>

        {!isVideo && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem 1.2rem', marginBottom: '0.9rem' }}>
            <Slider label="Brightness" value={brightness} onChange={setBrightness} />
            <Slider label="Contrast" value={contrast} onChange={setContrast} />
            <Slider label="Saturation" value={saturation} onChange={setSaturation} />
            <Slider label="Zoom" value={zoom} onChange={setZoom} min={50} max={200} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleDownload} className="btn">
            <Download size={14} /> Save to disk
          </button>
          {!isVideo && (
            <button onClick={handleCopy} className="btn ghost">
              <Copy size={14} /> Copy {copyMsg && `· ${copyMsg}`}
            </button>
          )}
          {!isVideo && (
            <button onClick={reset} className="btn ghost">
              <Crop size={14} /> Reset
            </button>
          )}
          {dlMsg && <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>{dlMsg}</span>}
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, min = 0, max = 200 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
