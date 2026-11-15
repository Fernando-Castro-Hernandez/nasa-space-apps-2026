// Worker de Nóstos (HU-29): el mismo que sirve la app responde la API.
// Todo lo que no empieza con /api/ son los archivos de la app (dist/).
//
//   GET  /api/health            ¿hay Worker y hay IA?
//   POST /api/voice/transcribe  audio → texto (HU-08)
//   POST /api/voice/extract     texto → campos de la bitácora (HU-09)
//   POST /api/lunito/reply      mensaje + contexto → respuesta de Lunito
//   POST /api/lunito/speak      texto → voz de Lunito (audio)
//
// Las rutas de IA reciben el idioma de la persona (`locale`, "en" o "es"; en
// transcribe, `?locale=`). Si no viene, responden en inglés.
import {
  LIMITS,
  type ExtractResponse,
  type HealthResponse,
  type TranscribeResponse,
} from "../src/api/contract";
import { audioType, extractFields, requireAi, speak, transcribe } from "./ai";
import type { Env } from "./env";
import {
  errorResponse,
  HttpError,
  json,
  parseLocale,
  readBytes,
  readJson,
  requireText,
} from "./http";
import { lunitoReply, parseReplyRequest } from "./lunito";

type Handler = (request: Request, env: Env) => Promise<Response>;

const ROUTES: Record<string, Handler> = {
  "GET /api/health": async (_request, env) =>
    json({ ok: true, ai: Boolean(env.AI) } satisfies HealthResponse),

  "POST /api/voice/transcribe": async (request, env) => {
    const ai = requireAi(env.AI);
    // El cuerpo es el audio: el idioma viaja en `?locale=`.
    const locale = parseLocale(new URL(request.url).searchParams.get("locale"));
    const type = request.headers.get("content-type") ?? "";
    if (!type.startsWith("audio/"))
      throw new HttpError(415, "Se esperaba un archivo de audio");
    const audio = await readBytes(request, LIMITS.audioBytes);
    if (audio.byteLength === 0) throw new HttpError(400, "El audio está vacío");
    const text = await transcribe(ai, audio, locale);
    return json({ text } satisfies TranscribeResponse);
  },

  "POST /api/voice/extract": async (request, env) => {
    const ai = requireAi(env.AI);
    const body = await readJson(request);
    const text = requireText(body.text, "text", LIMITS.textChars);
    const locale = parseLocale(body.locale);
    const fields = await extractFields(ai, text, locale);
    if (!fields) throw new HttpError(502, "La IA no devolvió campos válidos");
    return json({ fields } satisfies ExtractResponse);
  },

  "POST /api/lunito/reply": async (request, env) => {
    const body = await readJson(request);
    return json(await lunitoReply(env.AI, parseReplyRequest(body)));
  },

  "POST /api/lunito/speak": async (request, env) => {
    const ai = requireAi(env.AI);
    const body = await readJson(request);
    const text = requireText(body.text, "text", LIMITS.speakChars);
    const locale = parseLocale(body.locale);
    const audio = await speak(ai, text, locale, env.TTS_MODEL, env.TTS_SPEAKER);
    return new Response(audio, {
      headers: {
        "content-type": audioType(audio),
        "cache-control": "no-store",
      },
    });
  },
};

async function handleApi(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);
  const handler = ROUTES[`${request.method} ${pathname}`];
  if (!handler) {
    const known = Object.keys(ROUTES).some((r) => r.endsWith(` ${pathname}`));
    return known
      ? errorResponse(405, "Método no permitido")
      : errorResponse(404, "Esa ruta de la API no existe");
  }
  try {
    return await handler(request, env);
  } catch (error) {
    if (error instanceof HttpError)
      return errorResponse(error.status, error.message);
    console.error("Error en la API", error);
    return errorResponse(500, "Error interno");
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    return pathname.startsWith("/api/")
      ? handleApi(request, env)
      : env.ASSETS.fetch(request);
  },
};
