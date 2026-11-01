import type { ModelDef, GenSettings, ImageResolution } from '../types';

/**
 * Real API dispatch layer. Each provider is called with the user's key
 * (from Settings). Responses are normalised to a { url } the gallery can
 * render. Errors are thrown with a readable message so the GenItem can show
 * them gracefully.
 */

function requireKey(key: string | undefined, provider: string): string {
  if (!key || !key.trim()) throw new Error(`No API key set for ${provider}. Add it in Settings.`);
  return key.trim();
}

async function checkOk(res: Response, provider: string): Promise<void> {
  if (!res.ok) {
    let detail = '';
    try {
      const t = await res.text();
      detail = t.slice(0, 240);
    } catch {
      /* ignore */
    }
    throw new Error(`${provider} request failed (${res.status} ${res.statusText}). ${detail}`);
  }
}

function sizeFor(res: ImageResolution | undefined, aspect: string | undefined): string {
  const r = res || '1024';
  if (aspect === '16:9') return r === '512' ? '768x512' : r === '2048' ? '1792x1024' : '1024x1024';
  if (aspect === '9:16') return r === '512' ? '512x768' : r === '2048' ? '1024x1792' : '1024x1024';
  return `${r}x${r}`;
}

async function blobToUrl(res: Response): Promise<string> {
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ---- OpenAI (DALL-E 3 image, Sora video) ----
async function callOpenAI(model: ModelDef, prompt: string, settings: GenSettings, key: string, signal?: AbortSignal): Promise<string> {
  if (model.category === 'image') {
    const body = {
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: sizeFor(settings.resolution as ImageResolution | undefined, settings.aspectRatio),
      response_format: 'url',
    };
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    await checkOk(res, 'OpenAI');
    const json = await res.json();
    const url = json?.data?.[0]?.url;
    if (!url) throw new Error('OpenAI returned no image URL.');
    return url;
  }
  // Video (Sora) — OpenAI video API is not generally available; attempt and surface error.
  const res = await fetch('https://api.openai.com/v1/videos/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'sora-1', prompt }),
    signal,
  });
  await checkOk(res, 'OpenAI Sora');
  const json = await res.json().catch(() => ({}));
  const url = json?.data?.[0]?.url || json?.url || json?.video_url;
  if (!url) throw new Error('Sora API did not return a video URL (may not be enabled for this key).');
  return url;
}

// ---- Stability AI (SD3) ----
async function callStability(_model: ModelDef, prompt: string, settings: GenSettings, key: string, signal?: AbortSignal): Promise<string> {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('output_format', 'png');
  form.append('aspect_ratio', (settings.aspectRatio || '1:1').replace(':', '-'));
  const res = await fetch('https://api.stability.ai/v2/stable-image/core', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, Accept: 'image/*' },
    body: form,
    signal,
  });
  await checkOk(res, 'Stability AI');
  return blobToUrl(res);
}

// ---- Flux via fal.ai ----
async function callFlux(_model: ModelDef, prompt: string, _settings: GenSettings, key: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch('https://fal.run/fal-ai/flux', {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, num_images: 1 }),
    signal,
  });
  await checkOk(res, 'Flux (fal)');
  const json = await res.json();
  if (Array.isArray(json?.images) && json.images[0]?.url) return json.images[0].url;
  if (json?.image?.url) return json.image.url;
  if (json?.request_id) {
    const id = json.request_id as string;
    let status = 'IN_QUEUE';
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
      const s = await fetch(`https://fal.run/fal-ai/flux/requests/${id}/status`, {
        headers: { Authorization: `Key ${key}` },
        signal,
      });
      const sj = await s.json().catch(() => ({}));
      status = sj?.status || status;
      if (status === 'COMPLETED') break;
      if (status === 'FAILED') throw new Error('Flux generation failed.');
    }
    const g = await fetch(`https://fal.run/fal-ai/flux/requests/${id}/get`, {
      headers: { Authorization: `Key ${key}` },
      signal,
    });
    const gj = await g.json().catch(() => ({}));
    const url = gj?.images?.[0]?.url || gj?.image?.url;
    if (!url) throw new Error('Flux returned no image.');
    return url;
  }
  throw new Error('Flux (fal) returned an unexpected response.');
}

// ---- Google Imagen 3 ----
async function callGoogle(_model: ModelDef, prompt: string, settings: GenSettings, key: string, signal?: AbortSignal): Promise<string> {
  const body = {
    prompt: { 0: { prompt } },
    sampleCount: 1,
    aspectRatio: settings.aspectRatio || '1:1',
  };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/imagen-3:generateImage?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  await checkOk(res, 'Google Imagen');
  const json = await res.json();
  const b64 = json?.generatedImages?.[0]?.image?.bytesBase64Encoded;
  if (!b64) throw new Error('Imagen 3 returned no image.');
  return `data:image/png;base64,${b64}`;
}

// ---- Runway (Gen-3 + Seedance) ----
async function callRunway(model: ModelDef, prompt: string, settings: GenSettings, key: string, signal?: AbortSignal): Promise<string> {
  const body = {
    model: model.id === 'seedance' ? 'seedance' : 'gen3',
    prompt,
    duration: settings.duration || 5,
    resolution: settings.resolution || '720p',
  };
  const res = await fetch('https://api.runwayml.com/v1/generate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Runway-API-Key': key },
    body: JSON.stringify(body),
    signal,
  });
  await checkOk(res, 'Runway');
  const json = await res.json().catch(() => ({}));
  const url = json?.output?.[0] || json?.video_url || json?.url || json?.data?.[0]?.url;
  if (!url) throw new Error('Runway returned no video URL.');
  return url as string;
}

// ---- Pika ----
async function callPika(_model: ModelDef, prompt: string, settings: GenSettings, key: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch('https://api.pika.art/v1/generate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptText: prompt, aspectRatio: settings.aspectRatio || '1:1', duration: settings.duration || 5 }),
    signal,
  });
  await checkOk(res, 'Pika');
  const json = await res.json().catch(() => ({}));
  const url = json?.data?.[0]?.url || json?.video_url || json?.url;
  if (!url) throw new Error('Pika returned no video URL.');
  return url as string;
}

// ---- MiniMax ----
async function callMiniMax(_model: ModelDef, prompt: string, settings: GenSettings, key: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch('https://api.minimax.io/v1/generate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'video', prompt, duration: settings.duration || 5, resolution: settings.resolution || '720p' }),
    signal,
  });
  await checkOk(res, 'MiniMax');
  const json = await res.json().catch(() => ({}));
  const url = json?.data?.[0]?.url || json?.video_url || json?.file_link || json?.url;
  if (!url) throw new Error('MiniMax returned no video URL.');
  return url as string;
}

const DISPATCH: Record<string, (m: ModelDef, p: string, s: GenSettings, k: string, sig?: AbortSignal) => Promise<string>> = {
  openai: callOpenAI,
  stability: callStability,
  blackforest: callFlux,
  google: callGoogle,
  runway: callRunway,
  pika: callPika,
  minimax: callMiniMax,
};

export async function generate(
  model: ModelDef,
  prompt: string,
  settings: GenSettings,
  apiKeys: Record<string, string>,
  signal?: AbortSignal
): Promise<{ url: string }> {
  const key = requireKey(apiKeys[model.apiKeyId], model.provider);
  const fn = DISPATCH[model.apiKeyId];
  if (!fn) throw new Error(`Provider "${model.provider}" is not yet wired for direct generation.`);
  const url = await fn(model, prompt, settings, key, signal);
  return { url };
}
