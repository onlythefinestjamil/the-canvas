import type { ModelDef } from '../types';

export const MODELS: ModelDef[] = [
  {
    id: 'dalle3',
    name: 'DALL·E 3',
    provider: 'OpenAI',
    category: 'image',
    description: 'High-fidelity natural language image synthesis',
    accent: '#38B6FF',
  },
  {
    id: 'sd3',
    name: 'Stable Diffusion 3',
    provider: 'Stability AI',
    category: 'image',
    description: 'Open-source diffusion with fine control',
    accent: '#9146FF',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'Midjourney (API)',
    category: 'image',
    description: 'Aesthetic-first cinematic image generation',
    accent: '#28E5A0',
  },
  {
    id: 'flux',
    name: 'Flux',
    provider: 'Black Forest Labs',
    category: 'image',
    description: 'State-of-the-art photorealism & prompt adherence',
    accent: '#FF6B9146',
  },
  {
    id: 'imagen3',
    name: 'Imagen 3',
    provider: 'Google',
    category: 'image',
    description: 'Fast, high-quality photoreal generation',
    accent: '#FFB400',
  },
  {
    id: 'runway3',
    name: 'Runway Gen-3',
    provider: 'Runway',
    category: 'video',
    description: 'Cinematic AI video from text & images',
    accent: '#28E5A0',
  },
  {
    id: 'pika',
    name: 'Pika',
    provider: 'Pika Labs',
    category: 'video',
    description: 'Playful, expressive short-form video',
    accent: '#FF4FA3',
  },
  {
    id: 'sora',
    name: 'Sora',
    provider: 'OpenAI',
    category: 'video',
    description: 'World-simulating long-form video synthesis',
    accent: '#38B6FF',
  },
  {
    id: 'seedance',
    name: 'Seedance',
    provider: 'ByteDance',
    category: 'video',
    description: 'Dynamic motion with precise control',
    accent: '#9146FF',
  },
  {
    id: 'kling',
    name: 'Kling',
    provider: 'Kuaishou',
    category: 'video',
    description: 'Realistic physics-based video generation',
    accent: '#FFB400',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    provider: 'MiniMax',
    category: 'video',
    description: 'High-motion coherence & character consistency',
    accent: '#FF4FA3',
  },
];

export const IMAGE_MODELS = MODELS.filter((m) => m.category === 'image');
export const VIDEO_MODELS = MODELS.filter((m) => m.category === 'video');

export function getModelById(id: string): ModelDef | undefined {
  return MODELS.find((m) => m.id === id);
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1518709268805-4e390dd1ef8e?w=800&q=80',
  'https://images.unsplash.com/photo-1545239351-1141bd82e44a?w=800&q=80',
  'https://images.unsplash.com/photo-1502691879-6ead3b5a8f0a?w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1573227346851-c1b1b1b1b1b1?w=800&q=80',
  'https://images.unsplash.com/photo-1451187580459-9548f0c05f1a?w=800&q=80',
];

function pick(seed: number): string {
  return PLACEHOLDER_IMAGES[seed % PLACEHOLDER_IMAGES.length];
}

/**
 * Simulated generation call. In a real build this would dispatch to the
 * appropriate provider SDK using the user's API key from Settings.
 */
export async function generate(
  model: ModelDef,
  prompt: string,
  signal?: AbortSignal
): Promise<{ url: string }> {
  const delay = 1200 + Math.random() * 1800;
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, delay);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
  // Deterministic-ish thumbnail for the demo gallery
  const seed = Array.from(prompt).reduce((a, c) => a + c.charCodeAt(0), 0);
  return { url: pick(seed + Date.now()) };
}
