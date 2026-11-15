// Lo mínimo de los bindings de Cloudflare que usa el Worker, escrito a mano
// para no sumar una dependencia de tipos. Se configuran en wrangler.jsonc.

/** Workers AI. La forma de la respuesta depende del modelo (ver ai.ts). */
export type Ai = {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
};

/** Archivos estáticos de la app (dist/). */
export type Assets = { fetch(request: Request): Promise<Response> };

export type Env = {
  ASSETS: Assets;
  AI?: Ai;
  /** Modelo de voz de Lunito. Por defecto, MeloTTS (DECISIONS.md). */
  TTS_MODEL?: string;
  /** Voz dentro del modelo, si tiene varias (Aura: "celeste", "nestor"…). */
  TTS_SPEAKER?: string;
};
