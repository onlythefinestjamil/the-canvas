import type { ModelDef } from '../types';

export const MODELS: ModelDef[] = [
  { id: 'dalle3', name: 'DALL·E 3', provider: 'OpenAI', category: 'image', description: 'High-fidelity natural language image synthesis', accent: '#38b6ff', apiKeyId: 'openai' },
  { id: 'sd3', name: 'Stable Diffusion 3', provider: 'Stability AI', category: 'image', description: 'Open-source diffusion with fine control', accent: '#9146ff', apiKeyId: 'stability' },
  { id: 'midjourney', name: 'Midjourney', provider: 'Midjourney', category: 'image', description: 'Aesthetic-first cinematic image generation', accent: '#28e5a0', apiKeyId: 'midjourney' },
  { id: 'flux', name: 'Flux', provider: 'Black Forest Labs', category: 'image', description: 'State-of-the-art photorealism & prompt adherence', accent: '#ff9966', apiKeyId: 'blackforest' },
  { id: 'imagen3', name: 'Imagen 3', provider: 'Google', category: 'image', description: 'Fast, high-quality photoreal generation', accent: '#ffb400', apiKeyId: 'google' },
  { id: 'runway3', name: 'Runway Gen-3', provider: 'Runway', category: 'video', description: 'Cinematic AI video from text & images', accent: '#28e5a0', apiKeyId: 'runway' },
  { id: 'pika', name: 'Pika', provider: 'Pika Labs', category: 'video', description: 'Playful, expressive short-form video', accent: '#ff4fa3', apiKeyId: 'pika' },
  { id: 'sora', name: 'Sora', provider: 'OpenAI', category: 'video', description: 'World-simulating long-form video synthesis', accent: '#38b6ff', apiKeyId: 'openai' },
  { id: 'seedance', name: 'Seedance', provider: 'Runway', category: 'video', description: 'Dynamic motion with precise control', accent: '#9146ff', apiKeyId: 'runway' },
  { id: 'kling', name: 'Kling', provider: 'Kuaishou', category: 'video', description: 'Realistic physics-based video generation', accent: '#ffb400', apiKeyId: 'kuaishou' },
  { id: 'minimax', name: 'MiniMax', provider: 'MiniMax', category: 'video', description: 'High-motion coherence & character consistency', accent: '#ff4fa3', apiKeyId: 'minimax' },
];

export const IMAGE_MODELS = MODELS.filter((m) => m.category === 'image');
export const VIDEO_MODELS = MODELS.filter((m) => m.category === 'video');

export function getModelById(id: string): ModelDef | undefined {
  return MODELS.find((m) => m.id === id);
}

// Re-export the real generate from the API layer so existing imports keep working.
export { generate } from './api';
