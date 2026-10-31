"use client";

import { useCanvasStore } from "@/store/canvas";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "Ad", text: "30-second ad for a streetwear clothing brand. Model wearing the latest drop, urban backdrop, cinematic lighting." },
  { label: "Music Video", text: "60-second music video for a hip hop track. High energy, neon visuals, beat-synced cuts." },
  { label: "Anime", text: "2-minute anime episode about a young warrior discovering their powers. Cel-shaded, dramatic angles." },
  { label: "Game Trailer", text: "60-second video game trailer cinematic. Epic orchestral score, gameplay footage mixed with cinematics." },
  { label: "Animation", text: "45-second animated short film about a robot learning to paint. Colorful, whimsical, 2D animation style." },
  { label: "TikTok", text: "15-second vertical TikTok product showcase. Fast cuts, trending style, vertical format." },
  { label: "Real Estate", text: "60-second luxury real estate property tour. Smooth camera movements, golden hour lighting." },
  { label: "Food", text: "30-second food ad for a restaurant. Close-up shots, steam, appetizing colors." },
];

const QUALITIES = [
  { value: "high", label: "High (Wan 2.2)", desc: "Best quality, slower" },
  { value: "fast", label: "Fast (LTX-2.3)", desc: "Faster, slightly lower quality" },
] as const;

const CAPTION_STYLES = [
  { value: "none", label: "None" },
  { value: "bold", label: "Bold" },
  { value: "hud", label: "HUD" },
  { value: "clean", label: "Clean" },
] as const;

export function GeneratePanel({ onGenerate }: { onGenerate: () => void }) {
  const {
    description,
    setDescription,
    quality,
    setQuality,
    voiceover,
    setVoiceover,
    captions,
    setCaptions,
    voice,
    setVoice,
    isGenerating,
  } = useCanvasStore();

  return (
    <div className="glass rounded-2xl p-6 glow-accent">
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
        Create
      </h2>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setDescription(p.text)}
            className="px-3 py-1.5 rounded-full text-xs border border-border bg-bg hover:border-accent hover:text-white text-muted transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className="block text-sm text-muted mb-2">
          Describe what you want to create
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. 30-second ad for a streetwear clothing brand. Show a model wearing the latest drop. Cinematic lighting, urban backdrop."
          className="w-full bg-bg border border-border rounded-xl p-4 text-sm text-white placeholder:text-muted/50 resize-y min-h-[120px] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        />
      </div>

      {/* Quality */}
      <div className="mb-5">
        <label className="block text-sm text-muted mb-2">Quality</label>
        <div className="grid grid-cols-2 gap-2">
          {QUALITIES.map((q) => (
            <button
              key={q.value}
              onClick={() => setQuality(q.value)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                quality === q.value
                  ? "border-accent bg-accent/10"
                  : "border-border bg-bg hover:border-accent/50"
              )}
            >
              <div className="text-sm font-medium text-white">{q.label}</div>
              <div className="text-xs text-muted mt-0.5">{q.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Voiceover toggle */}
      <div className="mb-5">
        <label className="block text-sm text-muted mb-2">Voiceover</label>
        <div className="flex gap-2">
          <button
            onClick={() => setVoiceover(true)}
            className={cn(
              "flex-1 py-2.5 rounded-xl border text-sm transition-all",
              voiceover
                ? "border-accent bg-accent/10 text-white"
                : "border-border bg-bg text-muted hover:border-accent/50"
            )}
          >
            On
          </button>
          <button
            onClick={() => setVoiceover(false)}
            className={cn(
              "flex-1 py-2.5 rounded-xl border text-sm transition-all",
              !voiceover
                ? "border-accent bg-accent/10 text-white"
                : "border-border bg-bg text-muted hover:border-accent/50"
            )}
          >
            Off
          </button>
        </div>
      </div>

      {/* Voice selector (only if voiceover on) */}
      {voiceover && (
        <div className="mb-5">
          <label className="block text-sm text-muted mb-2">Voice</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-accent"
          >
            <option value="af_heart">Heart (Warm Female)</option>
            <option value="af_bella">Bella (Soft Female)</option>
            <option value="af_sky">Sky (Bright Female)</option>
            <option value="am_adam">Adam (Deep Male)</option>
            <option value="am_michael">Michael (Neutral Male)</option>
          </select>
        </div>
      )}

      {/* Captions */}
      <div className="mb-6">
        <label className="block text-sm text-muted mb-2">Captions</label>
        <div className="grid grid-cols-4 gap-2">
          {CAPTION_STYLES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCaptions(c.value)}
              className={cn(
                "py-2 rounded-xl border text-sm transition-all",
                captions === c.value
                  ? "border-accent bg-accent/10 text-white"
                  : "border-border bg-bg text-muted hover:border-accent/50"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !description.trim()}
        className={cn(
          "w-full py-4 rounded-xl font-bold text-base transition-all",
          isGenerating || !description.trim()
            ? "opacity-40 cursor-not-allowed gradient-btn text-white"
            : "gradient-btn text-white hover:opacity-90 active:scale-[0.98]"
        )}
      >
        {isGenerating ? "Generating..." : "Generate"}
      </button>
    </div>
  );
}
