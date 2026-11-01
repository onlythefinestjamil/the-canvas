// Export dialog: format, quality, resolution scale, copy, export individual layer.
import { useState } from 'react';
import { Download, Copy, X } from 'lucide-react';
import type { ExportFormat } from '../lib/export';
import type { Layer } from '../lib/layers';

interface Props {
  layers: Layer[];
  canvasWidth: number;
  canvasHeight: number;
  onClose: () => void;
}

export default function ExportDialog({ layers, canvasWidth, canvasHeight, onClose }: Props) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(1);
  const [exportLayer, setExportLayer] = useState(false);
  const [layerIdx, setLayerIdx] = useState(0);
  const [msg, setMsg] = useState('');

  const handleExport = async () => {
    try {
      const { exportComposite, exportLayer: exportSingle, downloadBlob, copyToClipboard } = await import('../lib/export');
      if (exportLayer) {
        const layer = layers[layerIdx];
        if (!layer) return;
        const { blob, ext } = exportSingle(layer, canvasWidth, canvasHeight, { format, quality, scale });
        downloadBlob(blob, `canvas-layer.${ext}`);
      } else {
        const { blob, ext } = exportComposite(layers, canvasWidth, canvasHeight, { format, quality, scale });
        downloadBlob(blob, `canvas-export.${ext}`);
      }
      setMsg('Exported!');
    } catch (e) {
      setMsg(String((e as Error).message || e));
    }
    setTimeout(() => setMsg(''), 2000);
  };

  const handleCopy = async () => {
    try {
      const { exportComposite, copyToClipboard } = await import('../lib/export');
      const { blob } = exportComposite(layers, canvasWidth, canvasHeight, { format: 'png' });
      await copyToClipboard(blob);
      setMsg('Copied to clipboard!');
    } catch (e) {
      setMsg(String((e as Error).message || e));
    }
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="card" style={{ width: 380, padding: '1.2rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Export</span>
          <button onClick={onClose} className="icon-btn" style={{ padding: '0.3rem' }}><X size={14} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <Field label="Format">
            <select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)} style={selectStyle}>
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WebP</option>
              <option value="svg">SVG</option>
            </select>
          </Field>

          {(format === 'jpg' || format === 'webp') && (
            <Field label={`Quality: ${quality}%`}>
              <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
            </Field>
          )}

          <Field label={`Resolution: ${scale}×`}>
            <select value={scale} onChange={(e) => setScale(Number(e.target.value))} style={selectStyle}>
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
              <option value={3}>3×</option>
              <option value={4}>4×</option>
            </select>
          </Field>
          <p style={{ fontSize: '0.62rem', color: 'var(--text-faint)' }}>Output: {Math.round(canvasWidth * scale)} × {Math.round(canvasHeight * scale)} px</p>

          <Field label="Scope">
            <label style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={exportLayer} onChange={(e) => setExportLayer(e.target.checked)} /> Export single layer
            </label>
          </Field>
          {exportLayer && (
            <Field label="Layer">
              <select value={layerIdx} onChange={(e) => setLayerIdx(Number(e.target.value))} style={selectStyle}>
                {layers.map((l, i) => (
                  <option key={l.id} value={i}>{l.name} ({l.type})</option>
                ))}
              </select>
            </Field>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
            <button onClick={handleExport} className="btn" style={{ flex: 1 }}>
              <Download size={14} /> Export
            </button>
            <button onClick={handleCopy} className="btn ghost">
              <Copy size={14} /> Copy
            </button>
          </div>
          {msg && <p style={{ fontSize: '0.68rem', color: 'var(--accent)' }}>{msg}</p>}
        </div>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--text)', fontSize: '0.74rem', padding: '0.4rem 0.5rem',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '0.64rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>{label}</p>
      {children}
    </div>
  );
}
