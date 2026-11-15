import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { setLocale } from "@/i18n";
import { api } from "./client";
import type { LunitoContext } from "./contract";

type Sent = { url: string; body: unknown };
let sent: Sent[] = [];

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
  });

const respond = (url: string): Response => {
  if (url.startsWith("/api/health")) return json({ ok: true, ai: true });
  if (url.startsWith("/api/voice/transcribe")) return json({ text: "hi" });
  if (url.startsWith("/api/voice/extract"))
    return json({
      fields: {
        sleepHours: null,
        sleepQuality: null,
        mood: 3,
        stress: 2,
        symptoms: [],
      },
    });
  if (url.startsWith("/api/lunito/reply"))
    return json({ text: "Hi", source: "ia", suggest: null });
  return new Response(new Uint8Array([1]), {
    headers: { "content-type": "audio/wav" },
  });
};

beforeEach(() => {
  sent = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      sent.push({
        url,
        body: typeof init?.body === "string" ? JSON.parse(init.body) : null,
      });
      return respond(url);
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

const context: LunitoContext = {
  name: "Ana",
  status: "ambar",
  reason: null,
  pendingActions: [],
  checkInDone: false,
  missionDay: 142,
  cmoName: "Luis",
};

async function callAll() {
  await api.transcribe(new Blob([new Uint8Array([1])], { type: "audio/webm" }));
  await api.extract("dormí mal");
  await api.lunitoReply({ message: "hola", context, history: [] });
  await api.speak("Hola");
  return sent.filter((s) => !s.url.startsWith("/api/health"));
}

test("cada petición de IA lleva el idioma activo sin que quien llama lo pida", async () => {
  setLocale("en");
  const [transcribe, extract, reply, speak] = await callAll();
  expect(transcribe!.url).toBe("/api/voice/transcribe?locale=en");
  expect(extract!.body).toEqual({ text: "dormí mal", locale: "en" });
  expect(reply!.body).toEqual({
    message: "hola",
    context,
    history: [],
    locale: "en",
  });
  expect(speak!.body).toEqual({ text: "Hola", locale: "en" });
});

test("si la persona cambia a español, las peticiones siguientes van en español", async () => {
  setLocale("es");
  const calls = await callAll();
  expect(calls[0]!.url).toBe("/api/voice/transcribe?locale=es");
  for (const call of calls.slice(1))
    expect((call.body as { locale: string }).locale).toBe("es");
});
