import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX } from 'lucide-react';

interface Props {
  src: string;
  onClose?: () => void;
}

export default function VideoPlayer({ src, onClose }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      setProgress(v.currentTime);
      setDuration(v.duration || 0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setProgress(Number(e.target.value));
  };

  const fullscreen = () => {
    ref.current?.requestFullscreen?.();
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div style={{ width: '100%' }}>
      <video
        ref={ref}
        src={src}
        muted={muted}
        playsInline
        style={{ width: '100%', borderRadius: 'var(--radius-sm)', background: '#000', display: 'block' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', padding: '0.4rem 0.2rem' }}>
        <button onClick={toggle} className="icon-btn" style={{ padding: '0.4rem' }}>
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', minWidth: 34, fontVariantNumeric: 'tabular-nums' }}>{fmt(progress)}</span>
        <input type="range" min={0} max={duration || 0} value={progress} onChange={seek} style={{ flex: 1 }} />
        <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', minWidth: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(duration)}</span>
        <button onClick={() => setMuted((m) => !m)} className="icon-btn" style={{ padding: '0.4rem' }}>
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <button onClick={fullscreen} className="icon-btn" style={{ padding: '0.4rem' }}>
          <Maximize size={14} />
        </button>
        {onClose && (
          <button onClick={onClose} className="btn ghost" style={{ padding: '0.4rem 0.7rem' }}>Close</button>
        )}
      </div>
    </div>
  );
}
