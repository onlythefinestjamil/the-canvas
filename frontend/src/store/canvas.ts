import { create } from "zustand";

type GenStatus = "idle" | "planning" | "generating" | "done" | "error";

interface GenProgress {
  status: GenStatus;
  message: string;
  shot?: number;
  totalShots?: number;
  duration?: number;
  aspect?: string;
  contentType?: string;
  outputUrl?: string;
  error?: string;
}

interface CreditInfo {
  totalGenerations: number;
  localCount: number;
  apiCount: number;
  totalCost: number;
}

interface CanvasState {
  // Generation
  description: string;
  quality: "high" | "fast";
  voiceover: boolean;
  captions: "none" | "bold" | "hud" | "clean";
  voice: string;
  progress: GenProgress;
  outputUrl: string | null;
  isGenerating: boolean;

  // Credits
  credits: CreditInfo | null;

  // Actions
  setDescription: (d: string) => void;
  setQuality: (q: "high" | "fast") => void;
  setVoiceover: (v: boolean) => void;
  setCaptions: (c: "none" | "bold" | "hud" | "clean") => void;
  setVoice: (v: string) => void;
  setProgress: (p: Partial<GenProgress>) => void;
  setOutput: (url: string | null) => void;
  setGenerating: (g: boolean) => void;
  setCredits: (c: CreditInfo | null) => void;
  reset: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  description: "",
  quality: "high",
  voiceover: true,
  captions: "none",
  voice: "af_heart",
  progress: { status: "idle", message: "" },
  outputUrl: null,
  isGenerating: false,
  credits: null,

  setDescription: (d) => set({ description: d }),
  setQuality: (q) => set({ quality: q }),
  setVoiceover: (v) => set({ voiceover: v }),
  setCaptions: (c) => set({ captions: c }),
  setVoice: (v) => set({ voice: v }),
  setProgress: (p) => set((s) => ({ progress: { ...s.progress, ...p } })),
  setOutput: (url) => set({ outputUrl: url }),
  setGenerating: (g) => set({ isGenerating: g }),
  setCredits: (c) => set({ credits: c }),
  reset: () =>
    set({
      description: "",
      progress: { status: "idle", message: "" },
      outputUrl: null,
      isGenerating: false,
    }),
}));
