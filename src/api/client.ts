// Cliente de la API del Worker (HU-29). Todo módulo de la app habla con el
// backend por aquí. Cada llamada tiene tiempo límite y falla con `ApiError`:
// quien llama decide su respaldo (dictado del navegador, reglas, texto a mano).
// Cada petición de IA lleva el idioma activo (`locale`): quien llama no tiene
// que pensarlo.
import { getLocale } from "@/i18n";
import type {
  ApiErrorBody,
  CheckInFields,
  ExtractRequest,
  ExtractResponse,
  HealthResponse,
  LunitoReplyRequest,
  LunitoReplyResponse,
  SpeakRequest,
  TranscribeQuery,
  TranscribeResponse,
} from "./contract";

export class ApiError extends Error {
  /** `status` 0: no hubo respuesta (sin red, sin Worker o tiempo agotado). */
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call(
  path: string,
  init: RequestInit,
  timeoutMs: number,
  expect: "json" | "audio",
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new ApiError(0, "Sin conexión con el servidor");
  }
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok) {
    const body = type.includes("json")
      ? ((await response.json().catch(() => null)) as ApiErrorBody | null)
      : null;
    throw new ApiError(response.status, body?.error ?? "El servidor falló");
  }
  // Sin Worker (vista previa estática), /api/ puede devolver el index.html.
  if (!type.includes(expect))
    throw new ApiError(0, "El servidor no tiene la API");
  return response;
}

const postJson = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

let healthCheck: Promise<boolean> | undefined;
const RECHECK_MS = 30_000;

/** Sin IA no vale la pena ni preguntar: quien llama pasa a su respaldo. */
async function requireAi() {
  if (!(await api.aiAvailable()))
    throw new ApiError(503, "La IA no está disponible");
}

export const api = {
  /** ¿Hay Worker con IA? Un "sí" vale toda la sesión; un "no" se vuelve a
   *  preguntar a los 30 s, por si solo fue un corte de red. */
  aiAvailable(): Promise<boolean> {
    healthCheck ??= call("/api/health", {}, 4000, "json")
      .then(async (r) => ((await r.json()) as HealthResponse).ai)
      .catch(() => false)
      .then((ok) => {
        if (!ok) setTimeout(() => (healthCheck = undefined), RECHECK_MS);
        return ok;
      });
    return healthCheck;
  },

  /** Audio de la bitácora → texto (HU-08). */
  async transcribe(audio: Blob): Promise<string> {
    await requireAi();
    const query = new URLSearchParams({
      locale: getLocale(),
    } satisfies TranscribeQuery);
    const response = await call(
      `/api/voice/transcribe?${query}`,
      {
        method: "POST",
        headers: { "content-type": audio.type || "audio/webm" },
        body: audio,
      },
      20_000,
      "json",
    );
    return ((await response.json()) as TranscribeResponse).text;
  },

  /** Texto de la bitácora → campos. 10 s como máximo (HU-09). */
  async extract(text: string): Promise<CheckInFields> {
    await requireAi();
    const response = await call(
      "/api/voice/extract",
      postJson({ text, locale: getLocale() } satisfies ExtractRequest),
      10_000,
      "json",
    );
    return ((await response.json()) as ExtractResponse).fields;
  },

  async lunitoReply(
    request: Omit<LunitoReplyRequest, "locale">,
  ): Promise<LunitoReplyResponse> {
    const response = await call(
      "/api/lunito/reply",
      postJson({
        ...request,
        locale: getLocale(),
      } satisfies LunitoReplyRequest),
      12_000,
      "json",
    );
    return (await response.json()) as LunitoReplyResponse;
  },

  /** Texto → voz de Lunito (audio que el navegador sabe decodificar). */
  async speak(text: string): Promise<ArrayBuffer> {
    await requireAi();
    const response = await call(
      "/api/lunito/speak",
      postJson({ text, locale: getLocale() } satisfies SpeakRequest),
      12_000,
      "audio",
    );
    return response.arrayBuffer();
  },
};
