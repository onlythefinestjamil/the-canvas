import type { ModelDef, GenSettings, ImageResolution, VideoResolution, VideoDuration, VideoFps, AspectRatio, BatchCount } from '../types';

interface Props {
  model: ModelDef;
  settings: GenSettings;
  onChange: (s: GenSettings) => void;
}

const ASPECTS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const IMG_RES: ImageResolution[] = ['512', '1024', '2048'];
const VID_RES: VideoResolution[] = ['480p', '720p', '1080p'];
const DURATIONS: VideoDuration[] = [4, 5, 10];
const FPS: VideoFps[] = [24, 30, 60];
const BATCH: BatchCount[] = [1, 2, 4, 8];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <label style={{ fontSize: '0.66rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Pills<T extends string | number>({ options, value, onChange }: { options: T[]; value: T | undefined; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={String(o)} className={value === o ? 'active' : ''} onClick={() => onChange(o)}>
          {String(o)}
        </button>
      ))}
    </div>
  );
}

export default function ModelSettings({ model, settings, onChange }: Props) {
  const isImage = model.category === 'image';

  return (
    <div style={{ marginTop: '0.8rem', padding: '0.7rem 0.8rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
      {isImage ? (
        <>
          <Row label="Resolution">
            <Pills options={IMG_RES} value={settings.resolution as ImageResolution | undefined} onChange={(v) => onChange({ ...settings, resolution: v })} />
          </Row>
          <Row label="Aspect ratio">
            <Pills options={ASPECTS} value={settings.aspectRatio} onChange={(v: AspectRatio) => onChange({ ...settings, aspectRatio: v })} />
          </Row>
        </>
      ) : (
        <>
          <Row label="Resolution">
            <Pills options={VID_RES} value={settings.resolution as VideoResolution | undefined} onChange={(v) => onChange({ ...settings, resolution: v })} />
          </Row>
          <Row label="Duration">
            <Pills options={DURATIONS} value={settings.duration} onChange={(v: VideoDuration) => onChange({ ...settings, duration: v })} />
          </Row>
          <Row label="Frame rate">
            <Pills options={FPS} value={settings.fps} onChange={(v: VideoFps) => onChange({ ...settings, fps: v })} />
          </Row>
        </>
      )}
      <Row label="Variations (batch)">
        <Pills options={BATCH} value={settings.batchCount} onChange={(v: BatchCount) => onChange({ ...settings, batchCount: v })} />
      </Row>
    </div>
  );
}
