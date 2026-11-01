import type { ModelDef, GenSettings, GenItem, BatchCount } from '../types';
import { generate } from './api';
import { addHistory } from './history';
import { incrementUsage } from './credits';

let idCounter = 0;
export const nextId = () => `gen-${Date.now()}-${idCounter++}`;

export interface BatchResult {
  items: GenItem[];
  errors: string[];
}

/**
 * Runs `settings.batchCount` (1/2/4/8) generations in parallel for the same
 * prompt + model. Each result is a separate GenItem linked by batchId.
 */
export async function runBatch(
  model: ModelDef,
  prompt: string,
  settings: GenSettings,
  apiKeys: Record<string, string>,
  onItem: (item: GenItem) => void,
  onUpdate: (id: string, patch: Partial<GenItem>) => void
): Promise<void> {
  const count: BatchCount = settings.batchCount || 1;
  const batchId = `batch-${Date.now()}`;

  const items: GenItem[] = Array.from({ length: count }, (_, i) => ({
    id: nextId(),
    modelId: model.id,
    modelName: model.name,
    category: model.category,
    prompt,
    status: 'queued' as const,
    createdAt: Date.now(),
    accent: model.accent,
    settings,
    batchId,
    batchIndex: i,
    batchTotal: count,
  }));

  for (const it of items) onItem(it);

  await Promise.all(
    items.map(async (item) => {
      onUpdate(item.id, { status: 'running' });
      try {
        const { url } = await generate(model, prompt, settings, apiKeys);
        incrementUsage();
        addHistory({
          id: item.id,
          prompt,
          modelId: model.id,
          modelName: model.name,
          settings,
          createdAt: item.createdAt,
          resultUrl: url,
          category: model.category,
        });
        onUpdate(item.id, { status: 'done', resultUrl: url, thumbnailUrl: url });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        onUpdate(item.id, { status: 'error', error: String((err as Error).message || err) });
      }
    })
  );
}
