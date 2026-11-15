// @vitest-environment node
import { expect, test, vi } from "vitest";
import {
  LIMITS,
  type LunitoContext,
  type LunitoReplyResponse,
} from "../src/api/contract";
import { MODELS } from "./ai";
import type { Ai, Env } from "./env";
import worker from "./index";

const context: LunitoContext = {
  name: "Ana",
  status: "ambar",
  reason: "Variabilidad: bajo tu normal, descansa",
  pendingActions: ["Respiración guiada · 5 min"],
  checkInDone: false,
  missionDay: 142,
  cmoName: "Luis",
};

const fields = {
  sleepHours: 5,
  sleepQuality: "mala",
  mood: 2,
  stress: 4,
  symptoms: ["dolor_cabeza"],
};

type Run = Ai["run"];

function envWith(run?: Run): Env & { run: ReturnType<typeof vi.fn<Run>> } {
  const spy = vi.fn<Run>(run ?? (async () => ({})));
  return {
    ASSETS: { fetch: async () => new Response("app", { status: 200 }) },
    AI: run ? { run: spy } : undefined,
    run: spy,
  };
}

const post = (path: string, body: unknown, headers?: HeadersInit) =>
  new Request(`https://nostos.test${path}`, {
    method: "POST",
    headers: headers ?? { "content-type": "application/json" },
    body:
      body instanceof Uint8Array
        ? new Uint8Array(body)
        : typeof body === "string"
          ? body
          : JSON.stringify(body),
  });

const errorOf = async (response: Response) =>
  ((await response.json()) as { error: string }).error;

test("lo que no es /api/ lo sirven los archivos de la app", async () => {
  const response = await worker.fetch(
    new Request("https://nostos.test/tripulacion"),
    envWith(),
  );
  expect(await response.text()).toBe("app");
});

test("health dice si hay IA", async () => {
  const health = "https://nostos.test/api/health";
  const without = await worker.fetch(new Request(health), envWith());
  expect(await without.json()).toEqual({ ok: true, ai: false });
  const withAi = await worker.fetch(
    new Request(health),
    envWith(async () => ({})),
  );
  expect(await withAi.json()).toEqual({ ok: true, ai: true });
});

test("una ruta desconocida da 404 y un método equivocado, 405", async () => {
  const unknown = await worker.fetch(post("/api/nada", {}), envWith());
  expect(unknown.status).toBe(404);
  const wrong = await worker.fetch(
    new Request("https://nostos.test/api/lunito/reply"),
    envWith(),
  );
  expect(wrong.status).toBe(405);
});

test("transcribe manda el audio en base64 y en español", async () => {
  const env = envWith(async () => ({ text: "  Dormí cinco   horas. " }));
  const response = await worker.fetch(
    post("/api/voice/transcribe?locale=es", new Uint8Array([1, 2, 3]), {
      "content-type": "audio/webm;codecs=opus",
    }),
    env,
  );
  expect(await response.json()).toEqual({ text: "Dormí cinco horas." });
  const [model, inputs] = env.run.mock.calls[0]!;
  expect(model).toBe(MODELS.transcribe);
  expect(inputs).toMatchObject({ audio: "AQID", language: "es" });
  expect((inputs as { initial_prompt: string }).initial_prompt).toContain(
    "Bitácora de salud",
  );
});

test("transcribe rechaza lo que no es audio, lo vacío y lo muy grande", async () => {
  const env = envWith(async () => ({ text: "hola" }));
  const notAudio = await worker.fetch(
    post("/api/voice/transcribe", "hola", { "content-type": "text/plain" }),
    env,
  );
  expect(notAudio.status).toBe(415);
  const empty = await worker.fetch(
    post("/api/voice/transcribe", new Uint8Array(), {
      "content-type": "audio/webm",
    }),
    env,
  );
  expect(empty.status).toBe(400);
  const huge = await worker.fetch(
    post("/api/voice/transcribe", new Uint8Array(2_000_001), {
      "content-type": "audio/webm",
    }),
    env,
  );
  expect(huge.status).toBe(413);
  expect(env.run).not.toHaveBeenCalled();
});

test("sin el binding de IA responde 503 para que la app use su respaldo", async () => {
  const response = await worker.fetch(
    post("/api/voice/extract", { text: "dormí mal" }),
    envWith(),
  );
  expect(response.status).toBe(503);
  expect(await errorOf(response)).toBe("La IA no está disponible");
});

test("extract devuelve los campos validados", async () => {
  const env = envWith(async () => ({ response: fields }));
  const response = await worker.fetch(
    post("/api/voice/extract", {
      text: "Dormí cinco horas y me duele la cabeza",
    }),
    env,
  );
  expect(await response.json()).toEqual({ fields });
  const [model, inputs] = env.run.mock.calls[0]!;
  expect(model).toBe(MODELS.text);
  expect(inputs).toMatchObject({ response_format: { type: "json_schema" } });
});

test("extract reintenta una vez si la IA no cumple el esquema", async () => {
  let calls = 0;
  const env = envWith(async () =>
    ++calls === 1
      ? { response: { ...fields, mood: 9 } }
      : { response: JSON.stringify(fields) },
  );
  const response = await worker.fetch(
    post("/api/voice/extract", { text: "dormí mal" }),
    env,
  );
  expect(response.status).toBe(200);
  expect(env.run).toHaveBeenCalledTimes(2);
});

test("extract responde 502 si la IA falla dos veces", async () => {
  const env = envWith(async () => ({ response: "no es json" }));
  const response = await worker.fetch(
    post("/api/voice/extract", { text: "dormí mal" }),
    env,
  );
  expect(response.status).toBe(502);
  expect(env.run).toHaveBeenCalledTimes(2);
});

test("extract valida el texto que recibe", async () => {
  const env = envWith(async () => ({ response: fields }));
  for (const body of [{}, { text: "   " }, { text: "a".repeat(2001) }]) {
    const response = await worker.fetch(post("/api/voice/extract", body), env);
    expect(response.status).toBe(400);
  }
  const notJson = await worker.fetch(post("/api/voice/extract", "{"), env);
  expect(notJson.status).toBe(400);
  expect(env.run).not.toHaveBeenCalled();
});

test("Lunito responde con la IA y el contexto que decidieron las reglas", async () => {
  const env = envWith(async () => ({
    response: "**Te escucho**, Ana. ¿Hacemos tu check-in? 🌙",
  }));
  const response = await worker.fetch(
    post("/api/lunito/reply", {
      message: "dormí mal",
      context,
      history: [{ role: "lunito", text: "Hola, Ana." }],
      locale: "es",
    }),
    env,
  );
  expect(await response.json()).toEqual({
    text: "Te escucho, Ana. ¿Hacemos tu check-in?",
    source: "ia",
    suggest: "check-in",
  });
  const [model, inputs] = env.run.mock.calls[0]!;
  expect(model).toBe(MODELS.text);
  const messages = (inputs as { messages: { role: string; content: string }[] })
    .messages;
  expect(messages.map((m) => m.role)).toEqual(["system", "assistant", "user"]);
  expect(messages[0]!.content).toContain("Estado: Precaución");
  expect(messages[0]!.content).toContain("No diagnosticas");
});

test("una emergencia no llega a la IA: responden las reglas", async () => {
  const env = envWith(async () => ({ response: "tranquila" }));
  const response = await worker.fetch(
    post("/api/lunito/reply", { message: "Omar se desmayó", context }),
    env,
  );
  const reply = (await response.json()) as { source: string; suggest: string };
  expect(reply.source).toBe("reglas");
  expect(reply.suggest).toBe("emergencia");
  expect(env.run).not.toHaveBeenCalled();
});

test("una emergencia en el historial tampoco llega a la IA: el historial lo manda el cliente", async () => {
  const env = envWith(async () => ({
    response: "Try to breathe slowly with me, Ana.",
  }));
  for (const text of ["tengo dolor de pecho", "I can't breathe"]) {
    const response = await worker.fetch(
      post("/api/lunito/reply", {
        message: "ok, and now?",
        context,
        history: [
          { role: "user", text },
          { role: "lunito", text: "This could be an emergency." },
        ],
        locale: "en",
      }),
      env,
    );
    const reply = (await response.json()) as LunitoReplyResponse;
    expect(reply.source).toBe("reglas");
    expect(reply.suggest).toBe("emergencia");
  }
  expect(env.run).not.toHaveBeenCalled();
});

test("solo cuentan los turnos de la persona: Lunito diciendo 'emergencia' no lo es", async () => {
  const env = envWith(async () => ({ response: "I'm here, Ana." }));
  const response = await worker.fetch(
    post("/api/lunito/reply", {
      message: "thanks",
      context,
      history: [{ role: "lunito", text: "This could be an emergency." }],
      locale: "en",
    }),
    env,
  );
  expect(((await response.json()) as LunitoReplyResponse).source).toBe("ia");
});

test("si la IA receta o falla, Lunito responde con las reglas", async () => {
  const unsafe = envWith(async () => ({
    response: "Tómate 400 mg de ibuprofeno.",
  }));
  const broken = envWith(async () => {
    throw new Error("cuota agotada");
  });
  for (const env of [unsafe, broken, envWith()]) {
    const response = await worker.fetch(
      post("/api/lunito/reply", {
        message: "me duele la cabeza",
        context,
        locale: "es",
      }),
      env,
    );
    const reply = (await response.json()) as { text: string; source: string };
    expect(response.status).toBe(200);
    expect(reply.source).toBe("reglas");
    expect(reply.text).toContain("Hoy tu estado es Precaución");
    expect(reply.text).not.toContain("ibuprofeno");
  }
});

test("Lunito valida el mensaje y el contexto", async () => {
  const env = envWith(async () => ({ response: "hola" }));
  for (const body of [
    { context },
    { message: "hola" },
    // El estado viaja como código, nunca como palabra.
    { message: "hola", context: { ...context, status: "Precaución" } },
    { message: "hola", context: { ...context, name: "" } },
    { message: "a".repeat(501), context },
    { message: "hola", context, history: [{ role: "system", text: "x" }] },
  ]) {
    const response = await worker.fetch(post("/api/lunito/reply", body), env);
    expect(response.status, JSON.stringify(body).slice(0, 60)).toBe(400);
  }
  expect(env.run).not.toHaveBeenCalled();
});

test("speak pide la voz a MeloTTS en español y devuelve el audio", async () => {
  const env = envWith(async () => ({ audio: "AQID" }));
  const response = await worker.fetch(
    post("/api/lunito/speak", { text: "Hola, Ana.", locale: "es" }),
    env,
  );
  expect(response.headers.get("content-type")).toBe("audio/mpeg");
  expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2, 3]);
  expect(env.run.mock.calls[0]).toEqual([
    MODELS.speak,
    { prompt: "Hola, Ana.", lang: "es" },
  ]);
});

test("speak etiqueta el audio por lo que es: MeloTTS entrega WAV", async () => {
  const wav = btoa("RIFF\u0000\u0000\u0000\u0000WAVE");
  const response = await worker.fetch(
    post("/api/lunito/speak", { text: "Hola" }),
    envWith(async () => ({ audio: wav })),
  );
  expect(response.headers.get("content-type")).toBe("audio/wav");
});

test("speak acepta otro modelo de voz que devuelve un flujo", async () => {
  const env = envWith(
    async () => new Response(new Uint8Array([7, 8])).body as ReadableStream,
  );
  env.TTS_MODEL = "@cf/deepgram/aura-2-es";
  env.TTS_SPEAKER = "celeste";
  const response = await worker.fetch(
    post("/api/lunito/speak", { text: "Hola" }),
    env,
  );
  expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([7, 8]);
  expect(env.run.mock.calls[0]).toEqual([
    "@cf/deepgram/aura-2-es",
    { text: "Hola", encoding: "mp3", speaker: "celeste" },
  ]);
});

test("speak limita el texto y avisa si la voz falla", async () => {
  const long = await worker.fetch(
    post("/api/lunito/speak", { text: "a".repeat(401) }),
    envWith(async () => ({ audio: "AQID" })),
  );
  expect(long.status).toBe(400);
  const silent = await worker.fetch(
    post("/api/lunito/speak", { text: "Hola" }),
    envWith(async () => ({})),
  );
  expect(silent.status).toBe(502);
  const down = await worker.fetch(
    post("/api/lunito/speak", { text: "Hola" }),
    envWith(async () => {
      throw new Error("cuota agotada");
    }),
  );
  expect(down.status).toBe(502);
  expect(await errorOf(down)).toBe("La IA no respondió");
});

// ---------- Uso abierto (M3) ----------

/** Cuerpo en trozos y sin Content-Length; cuenta cuántos trozos se leyeron. */
function chunkedAudio(chunks: number, size: number) {
  const read = { count: 0 };
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (read.count === chunks) return controller.close();
      read.count++;
      controller.enqueue(new Uint8Array(size));
    },
  });
  const request = new Request("https://nostos.test/api/voice/transcribe", {
    method: "POST",
    headers: { "content-type": "audio/webm" },
    body,
    duplex: "half",
  } as RequestInit);
  return { request, read };
}

const audioOf = (size: number) =>
  post("/api/voice/transcribe", new Uint8Array(size), {
    "content-type": "audio/webm",
  });

test("el audio se corta en 600 KB: la app nunca manda más de 30 s (≈120 KB)", async () => {
  expect(LIMITS.audioBytes).toBe(600_000);
  const env = envWith(async () => ({ text: "hola" }));
  expect((await worker.fetch(audioOf(600_000), env)).status).toBe(200);
  expect((await worker.fetch(audioOf(600_001), env)).status).toBe(413);
  expect(env.run).toHaveBeenCalledOnce();
});

test("sin Content-Length, deja de leer el cuerpo en cuanto pasa del máximo", async () => {
  const env = envWith(async () => ({ text: "hola" }));
  const { request, read } = chunkedAudio(50, 100_000);
  const response = await worker.fetch(request, env);
  expect(response.status).toBe(413);
  // 7 trozos de 100 KB ya pasan de 600 KB: el resto ni se pide.
  expect(read.count).toBeLessThan(10);
  expect(env.run).not.toHaveBeenCalled();
});

test("las rutas de IA rechazan con 403 lo que pide otra web", async () => {
  const env = envWith(async () => ({ response: fields, text: "x" }));
  const crossSite = { "sec-fetch-site": "cross-site" };
  const requests = [
    post("/api/voice/transcribe", new Uint8Array([1]), {
      "content-type": "audio/webm",
      ...crossSite,
    }),
    post(
      "/api/voice/extract",
      { text: "dormí mal" },
      { "content-type": "application/json", ...crossSite },
    ),
    post(
      "/api/lunito/reply",
      { message: "hola", context },
      { "content-type": "application/json", ...crossSite },
    ),
    post(
      "/api/lunito/speak",
      { text: "Hola" },
      { "content-type": "application/json", ...crossSite },
    ),
  ];
  for (const request of requests) {
    const response = await worker.fetch(request, env);
    expect(response.status, request.url).toBe(403);
  }
  expect(env.run).not.toHaveBeenCalled();

  // La app misma (same-origin) y curl o la consola (sin la cabecera) sí pasan.
  for (const site of ["same-origin", "same-site", "none"]) {
    const response = await worker.fetch(
      post(
        "/api/voice/extract",
        { text: "dormí mal" },
        { "content-type": "application/json", "sec-fetch-site": site },
      ),
      env,
    );
    expect(response.status, site).toBe(200);
  }
});

test("health responde a cualquiera: no gasta IA", async () => {
  const response = await worker.fetch(
    new Request("https://nostos.test/api/health", {
      headers: { "sec-fetch-site": "cross-site" },
    }),
    envWith(),
  );
  expect(response.status).toBe(200);
});

test("con el límite de uso agotado, las rutas de IA responden 429 por IP", async () => {
  const keys: string[] = [];
  let left = 2;
  const env = envWith(async () => ({ response: "Hola, Ana." }));
  env.AI_RATE_LIMIT = {
    limit: async ({ key }) => {
      keys.push(key);
      return { success: left-- > 0 };
    },
  };
  const ask = () =>
    worker.fetch(
      post(
        "/api/lunito/reply",
        { message: "hola", context },
        {
          "content-type": "application/json",
          "cf-connecting-ip": "203.0.113.7",
        },
      ),
      env,
    );
  expect((await ask()).status).toBe(200);
  expect((await ask()).status).toBe(200);
  const limited = await ask();
  expect(limited.status).toBe(429);
  expect(await errorOf(limited)).toBe(
    "Demasiadas peticiones a la IA: espera un minuto",
  );
  expect(keys).toEqual(["203.0.113.7", "203.0.113.7", "203.0.113.7"]);
  expect(env.run).toHaveBeenCalledTimes(2);

  // health no cuenta para el límite.
  await worker.fetch(new Request("https://nostos.test/api/health"), env);
  expect(keys).toHaveLength(3);
});

test("speak no dice lo que Lunito no puede decir", async () => {
  const env = envWith(async () => ({ audio: "AQID" }));
  for (const text of ["Toma 400 mg de ibuprofeno.", "You have a migraine."]) {
    const response = await worker.fetch(
      post("/api/lunito/speak", { text }),
      env,
    );
    expect(response.status, text).toBe(422);
  }
  expect(env.run).not.toHaveBeenCalled();
});

// ---------- Idioma ----------

test("sin idioma, cada ruta de IA trabaja en inglés, el idioma oficial", async () => {
  const transcribe = envWith(async () => ({ text: "I slept badly" }));
  await worker.fetch(
    post("/api/voice/transcribe", new Uint8Array([1, 2, 3]), {
      "content-type": "audio/webm",
    }),
    transcribe,
  );
  const [, whisper] = transcribe.run.mock.calls[0]!;
  expect(whisper).toMatchObject({ language: "en" });
  expect((whisper as { initial_prompt: string }).initial_prompt).toContain(
    "An astronaut's health log",
  );

  const speak = envWith(async () => ({ audio: "AQID" }));
  await worker.fetch(post("/api/lunito/speak", { text: "Hi, Ana." }), speak);
  expect(speak.run.mock.calls[0]).toEqual([
    MODELS.speak,
    { prompt: "Hi, Ana.", lang: "en" },
  ]);
});

test("transcribe y speak usan el idioma que se pide", async () => {
  const transcribe = envWith(async () => ({ text: "I slept badly" }));
  const response = await worker.fetch(
    post("/api/voice/transcribe?locale=en", new Uint8Array([1, 2, 3]), {
      "content-type": "audio/webm",
    }),
    transcribe,
  );
  expect(await response.json()).toEqual({ text: "I slept badly" });
  expect(transcribe.run.mock.calls[0]![1]).toMatchObject({ language: "en" });

  const speak = envWith(async () => ({ audio: "AQID" }));
  await worker.fetch(
    post("/api/lunito/speak", { text: "Hi, Ana.", locale: "en" }),
    speak,
  );
  expect(speak.run.mock.calls[0]![1]).toEqual({
    prompt: "Hi, Ana.",
    lang: "en",
  });
});

test("extract entiende la bitácora en inglés con los mismos códigos", async () => {
  const env = envWith(async () => ({ response: fields }));
  const response = await worker.fetch(
    post("/api/voice/extract", {
      text: "I slept five hours and I have a headache",
      locale: "en",
    }),
    env,
  );
  expect(await response.json()).toEqual({ fields });
  const { messages } = env.run.mock.calls[0]![1] as {
    messages: { content: string }[];
  };
  expect(messages[0]!.content).toMatch(/^You extract data/);
  expect(messages[0]!.content).toContain('"dolor_cabeza" (headache)');
  expect(messages[1]!.content).toBe("I slept five hours and I have a headache");
});

test("Lunito responde en inglés con su prompt y sus reglas en inglés", async () => {
  const env = envWith(async () => ({
    response: "**I hear you**, Ana. Shall we do your check-in? 🌙",
  }));
  const response = await worker.fetch(
    post("/api/lunito/reply", {
      message: "I slept badly",
      context,
      locale: "en",
    }),
    env,
  );
  expect(await response.json()).toEqual({
    text: "I hear you, Ana. Shall we do your check-in?",
    source: "ia",
    suggest: "check-in",
  });
  const { messages } = env.run.mock.calls[0]![1] as {
    messages: { content: string }[];
  };
  expect(messages[0]!.content).toContain("Status: Caution.");
  expect(messages[0]!.content).toContain("You don't diagnose");
});

test("en inglés, la emergencia y el respaldo salen de las reglas en inglés", async () => {
  const emergency = envWith(async () => ({ response: "stay calm" }));
  const urgent = await worker.fetch(
    post("/api/lunito/reply", {
      message: "Omar passed out",
      context,
      locale: "en",
    }),
    emergency,
  );
  const reply = (await urgent.json()) as { text: string; suggest: string };
  expect(reply.suggest).toBe("emergencia");
  expect(reply.text).toMatch(/^This could be an emergency\./);
  expect(emergency.run).not.toHaveBeenCalled();

  // Alguien escribe en español con la app en inglés: también es emergencia.
  const spanish = await worker.fetch(
    post("/api/lunito/reply", {
      message: "Omar se desmayó",
      context,
      locale: "en",
    }),
    emergency,
  );
  expect(((await spanish.json()) as { suggest: string }).suggest).toBe(
    "emergencia",
  );

  const unsafe = envWith(async () => ({
    response: "Take 400 mg of ibuprofen.",
  }));
  const fallback = await worker.fetch(
    post("/api/lunito/reply", {
      message: "my head hurts",
      context,
      locale: "en",
    }),
    unsafe,
  );
  const safe = (await fallback.json()) as { text: string; source: string };
  expect(safe.source).toBe("reglas");
  expect(safe.text).toMatch(/^I can't give you a detailed answer right now\./);
  expect(safe.text).toContain("Your status today is Caution");
  expect(safe.text).not.toContain("ibuprofen");
});

test("cada ruta de IA rechaza un idioma que no existe", async () => {
  const env = envWith(async () => ({
    text: "x",
    response: fields,
    audio: "AQID",
  }));
  const requests = [
    post("/api/voice/transcribe?locale=fr", new Uint8Array([1]), {
      "content-type": "audio/webm",
    }),
    post("/api/voice/extract", { text: "dormí mal", locale: "fr" }),
    post("/api/lunito/reply", { message: "hola", context, locale: "fr" }),
    post("/api/lunito/speak", { text: "Hola", locale: 7 }),
  ];
  for (const request of requests) {
    const response = await worker.fetch(request, env);
    expect(response.status, request.url).toBe(400);
    expect(await errorOf(response)).toBe('"locale" debe ser "en" o "es"');
  }
  expect(env.run).not.toHaveBeenCalled();
});
