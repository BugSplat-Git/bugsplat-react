/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BUGSPLAT_DATABASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
