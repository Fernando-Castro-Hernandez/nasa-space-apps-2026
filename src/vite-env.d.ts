interface ImportMetaEnv {
  /** "staging" o "production" en los despliegues; sin definir en local. */
  readonly VITE_APP_ENV?: string;
  /** SHA del commit desplegado; lo define el workflow de CI. */
  readonly VITE_COMMIT_SHA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
