// Media browser — import files, generated gallery items, color mattes.
import { useRef } from 'react';
import { Film, ImagePlus, Music, Upload, Square } from 'lucide-react';
import type { ClipSource } from '../../lib/video/types';
import type { GenItem } from '../../types';

interface Props {
  galleryItems: GenItem[];
  onImport: (source: ClipSource, label: string) => void;
}

const ACCEPT = 'video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-m4v,audio/wav,audio/mpeg,audio/aac,audio/x-m4a,audio/ogg,image/*';

export default function MediaBrowser({ galleryItems, onImport }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const isImage = file.type.startsWith('image');
      const mediaType = isVideo ? 'video' : isAudio ? 'audio' : isImage ? 'image' : 'video';
      onImport({ type: 'file', url, fileName: file.name, mediaType }, file.name);
    });
  };

  const videoGallery = galleryItems.filter((i) => i.category === 'video' && i.status === 'done' && i.resultUrl);
  const imageGallery = galleryItems.filter((i) => i.category === 'image' && i.status === 'done' && i.resultUrl);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Upload size={13} color="var(--accent)" />
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-dim)' }}>Media</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <button
          onClick={() => fileInput.current?.click()}
          className="btn ghost"
          style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}
        >
          <Upload size={14} /> Import File
        </button>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT}
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <Section icon={<Square size={11} />} label="Color Mattes">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {['#000000', '#ffffff', '#7c5cff', '#5b8cff', '#34d399', '#f87171', '#fbbf24', '#ec4899'].map((c) => (
              <button
                key={c}
                onClick={() => onImport({ type: 'color', color: c }, 'Color')}
                title={`Add ${c} matte`}
                style={{
                  aspectRatio: '1 / 1',
                  background: c,
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </Section>

        <Section icon={<Film size={11} />} label={`Generated Videos (${videoGallery.length})`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {videoGallery.map((item) => (
              <button
                key={item.id}
                onClick={() => onImport({ type: 'gallery', url: item.resultUrl!, mediaType: 'video' }, item.prompt.slice(0, 24))}
                title={item.prompt}
                style={{ aspectRatio: '9/16', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: 0, background: 'var(--surface-2)' }}
              >
                <video src={item.resultUrl} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<ImagePlus size={11} />} label={`Generated Images (${imageGallery.length})`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {imageGallery.map((item) => (
              <button
                key={item.id}
                onClick={() => onImport({ type: 'gallery', url: item.resultUrl!, mediaType: 'image' }, item.prompt.slice(0, 24))}
                title={item.prompt}
                style={{ aspectRatio: '1/1', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: 0, background: 'var(--surface-2)' }}
              >
                <img src={item.resultUrl} alt={item.prompt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<Music size={11} />} label="Tip">
          <p style={{ fontSize: '0.62rem', color: 'var(--text-faint)', lineHeight: 1.5 }}>
            Import WAV/MP3 audio files for music, voiceover, or SFX. Drag clips onto the timeline.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
        <span style={{ color: 'var(--text-dim)' }}>{icon}</span>
        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-dim)' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}
