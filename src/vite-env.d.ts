/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_RUNWAY_API_KEY: string;
  readonly VITE_STABILITY_API_KEY: string;
  readonly VITE_FAL_KEY: string;
  readonly VITE_MINIMAX_API_KEY: string;
  readonly VITE_CLOUDFLARE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
