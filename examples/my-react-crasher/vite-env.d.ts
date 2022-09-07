/// <reference types="vite/client" />
/// <reference types="vitest" />

interface ImportMetaEnv {
  readonly BUGSPLAT_DATABASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
