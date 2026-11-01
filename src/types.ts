export type ModelCategory = 'image' | 'video';

export interface ModelDef {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  description: string;
  accent: string;
  apiKeyId: string;
}

export type GenStatus = 'queued' | 'running' | 'done' | 'error';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type ImageResolution = '512' | '1024' | '2048';
export type VideoResolution = '480p' | '720p' | '1080p';
export type VideoDuration = 4 | 5 | 10;
export type VideoFps = 24 | 30 | 60;
export type BatchCount = 1 | 2 | 4 | 8;

export interface GenSettings {
  resolution?: ImageResolution | VideoResolution;
  aspectRatio?: AspectRatio;
  duration?: VideoDuration;
  fps?: VideoFps;
  batchCount?: BatchCount;
}

export interface GenItem {
  id: string;
  modelId: string;
  modelName: string;
  category: ModelCategory;
  prompt: string;
  status: GenStatus;
  resultUrl?: string;
  thumbnailUrl?: string;
  createdAt: number;
  error?: string;
  accent: string;
  settings?: GenSettings;
  batchId?: string;
  batchIndex?: number;
  batchTotal?: number;
}

export interface Settings {
  apiKeys: Record<string, string>;
  theme: 'dark';
}

export type Plan = 'free' | 'pro' | 'promax';

export interface AuthUser {
  email: string;
  plan: Plan;
  billingStart: number;
}

export interface HistoryEntry {
  id: string;
  prompt: string;
  modelId: string;
  modelName: string;
  settings?: GenSettings;
  createdAt: number;
  resultUrl?: string;
  category: ModelCategory;
}

declare global {
  interface Window {
    canvasAPI?: {
      saveFile: (opts: { defaultName: string; data: string; extension: string }) => Promise<{ canceled: boolean; filePath?: string }>;
      saveBuffer: (opts: { defaultName: string; buffer: ArrayBuffer; extension: string }) => Promise<{ canceled: boolean; filePath?: string }>;
      platform: string;
      versions: Record<string, string>;
    };
  }
}
