// Lo mínimo de los bindings de Cloudflare que usa el Worker, escrito a mano
// para no sumar una dependencia de tipos. Se configuran en wrangler.jsonc.

/** Workers AI. La forma de la respuesta depende del modelo (ver ai.ts). */
export type Ai = {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
};

/** Archivos estáticos de la app (dist/). */
export type Assets = { fetch(request: Request): Promise<Response> };

/** Límite de uso de Workers (Rate Limiting): `success` es false si se pasó. */
export type RateLimit = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

export type Env = {
  ASSETS: Assets;
  AI?: Ai;
  /** Peticiones de IA por IP y por minuto (wrangler.jsonc). Opcional: sin él
   *  (desarrollo local, pruebas) el Worker funciona igual, sin límite. */
  AI_RATE_LIMIT?: RateLimit;
  /** Modelo de voz de Lunito. Por defecto, MeloTTS (DECISIONS.md). */
  TTS_MODEL?: string;
  /** Voz dentro del modelo, si tiene varias (Aura: "celeste", "nestor"…). */
  TTS_SPEAKER?: string;
};
