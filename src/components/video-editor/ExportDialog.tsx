// Export dialog — resolution, codec, bitrate, fps, queue.
import { useState } from 'react';
import { Download, Loader2, CheckCircle2, AlertTriangle, X, Plus, Film } from 'lucide-react';
import type { VideoProject } from '../../lib/video/types';
import { exportProject, type ExportOptions, type ExportQueueItem, DEFAULT_EXPORT, totalDuration } from '../../lib/video/export';
import { formatTimecode } from '../../lib/video/clip';

interface Props {
  project: VideoProject;
  onClose: () => void;
}

export default function ExportDialog({ project, onClose }: Props) {
  const [opts, setOpts] = useState<ExportOptions>(DEFAULT_EXPORT);
  const [queue, setQueue] = useState<ExportQueueItem[]>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    const item: ExportQueueItem = {
      id: 'exp_' + Math.random().toString(36).slice(2, 8),
      project: { ...project },
      options: opts,
      status: 'running',
      progress: 0,
      startedAt: Date.now(),
    };
    setQueue((q) => [...q, item]);
    try {
      const url = await exportProject(project, opts, (p) => {
        setQueue((q) => q.map((it) => (it.id === item.id ? { ...it, progress: p } : it)));
      });
      setQueue((q) => q.map((it) => (it.id === item.id ? { ...it, status: 'done', url, progress: 1, finishedAt: Date.now() } : it)));
    } catch (err) {
      setQueue((q) => q.map((it) => (it.id === item.id ? { ...it, status: 'error', error: (err as Error).message } : it)));
    } finally {
      setRunning(false);
    }
  };

  const download = (item: ExportQueueItem) => {
    if (!item.url) return;
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `${project.name.replace(/[^a-z0-9_-]/gi, '_')}.${item.options.format}`;
    a.click();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ width: 560, maxHeight: '85vh', overflow: 'auto', padding: '1.2rem', background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Export Video</h2>
          <button className="icon-btn" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <Field label="Format">
            <select value={opts.format} onChange={(e) => setOpts({ ...opts, format: e.target.value as ExportOptions['format'] })} style={inputStyle}>
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="mov">MOV</option>
            </select>
          </Field>
          <Field label="Codec">
            <select value={opts.codec} onChange={(e) => setOpts({ ...opts, codec: e.target.value as ExportOptions['codec'] })} style={inputStyle}>
              <option value="h264">H.264</option>
              <option value="h265">H.265 / HEVC</option>
              <option value="vp9">VP9</option>
              <option value="av1">AV1</option>
            </select>
          </Field>
          <Field label="Resolution">
            <select value={opts.resolution} onChange={(e) => setOpts({ ...opts, resolution: e.target.value as ExportOptions['resolution'] })} style={inputStyle}>
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4k">4K</option>
            </select>
          </Field>
          <Field label="Frame Rate">
            <select value={opts.fps} onChange={(e) => setOpts({ ...opts, fps: parseInt(e.target.value) as ExportOptions['fps'] })} style={inputStyle}>
              <option value={24}>24 fps</option>
              <option value={30}>30 fps</option>
              <option value={60}>60 fps</option>
            </select>
          </Field>
          <Field label={`Bitrate (${opts.bitrate} kbps)`}>
            <input type="range" min={1000} max={20000} step={500} value={opts.bitrate} onChange={(e) => setOpts({ ...opts, bitrate: parseInt(e.target.value) })} style={{ width: '100%' }} />
          </Field>
          <Field label="Mode">
            <select value={opts.mode} onChange={(e) => setOpts({ ...opts, mode: e.target.value as ExportOptions['mode'] })} style={inputStyle}>
              <option value="cbr">CBR</option>
              <option value="vbr">VBR</option>
            </select>
          </Field>
          <Field label="Audio Codec">
            <select value={opts.audioCodec} onChange={(e) => setOpts({ ...opts, audioCodec: e.target.value as ExportOptions['audioCodec'] })} style={inputStyle}>
              <option value="aac">AAC</option>
              <option value="mp3">MP3</option>
            </select>
          </Field>
          <Field label={`Audio Bitrate (${opts.audioBitrate} kbps)`}>
            <input type="range" min={64} max={320} step={32} value={opts.audioBitrate} onChange={(e) => setOpts({ ...opts, audioBitrate: parseInt(e.target.value) })} style={{ width: '100%' }} />
          </Field>
        </div>

        <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)', marginBottom: '0.8rem', padding: '0.5rem', background: 'var(--surface-2)', borderRadius: 6 }}>
          Duration: {formatTimecode(totalDuration(project), opts.fps)} · {project.clips.length} clips · {opts.resolution} @ {opts.fps}fps
        </div>

        <button className="btn" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} onClick={run} disabled={running || project.clips.length === 0}>
          {running ? <><Loader2 size={14} className="spin" /> Rendering…</> : <><Plus size={14} /> Add to Export Queue</>}
        </button>

        {queue.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Queue ({queue.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {queue.map((q) => (
                <div key={q.id} style={{ padding: '0.6rem', background: 'var(--surface-2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    {q.status === 'running' && <Loader2 size={13} className="spin" color="var(--accent)" />}
                    {q.status === 'done' && <CheckCircle2 size={13} color="#34d399" />}
                    {q.status === 'error' && <AlertTriangle size={13} color="#f87171" />}
                    {q.status === 'queued' && <Film size={13} color="var(--text-dim)" />}
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, flex: 1 }}>{q.options.resolution} · {q.options.format.toUpperCase()} · {q.options.fps}fps</span>
                    {q.status === 'done' && q.url && (
                      <button className="icon-btn" onClick={() => download(q)} title="Download"><Download size={12} /></button>
                    )}
                  </div>
                  {q.status === 'running' && (
                    <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${q.progress * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.1s' }} />
                    </div>
                  )}
                  {q.status === 'error' && <p style={{ fontSize: '0.6rem', color: '#f87171' }}>{q.error}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>{label}</label>
      {children}
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
