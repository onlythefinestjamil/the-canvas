export type ModelCategory = 'image' | 'video';

export interface ModelDef {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  description: string;
  accent: string; // hex color for glow
}

export type GenStatus = 'queued' | 'running' | 'done' | 'error';

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
}

export interface Settings {
  apiKeys: Record<string, string>;
  theme: 'dark';
}

declare global {
  interface Window {
    canvasAPI?: {
      saveFile: (opts: { defaultName: string; data: string; extension: string }) => Promise<{ canceled: boolean; filePath?: string }>;
      platform: string;
      versions: Record<string, string>;
    };
  }
}
