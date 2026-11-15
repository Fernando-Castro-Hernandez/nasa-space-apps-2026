interface ImportMetaEnv {
  /** "staging" o "production" en los despliegues; sin definir en local. */
  readonly VITE_APP_ENV?: string;
  /** SHA del commit desplegado; lo define el workflow de CI. */
  readonly VITE_COMMIT_SHA?: string;
  /** "on" enciende el texto en vivo con el dictado del navegador mientras
   *  Whisper graba (src/features/voice/session.ts). Apagado por defecto. */
  readonly VITE_VOICE_PREVIEW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
