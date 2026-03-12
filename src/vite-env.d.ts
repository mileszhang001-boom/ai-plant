/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QWEN_API_KEY: string;
  readonly VITE_QWEN_MODEL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
