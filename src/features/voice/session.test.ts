import { afterEach, expect, test, vi } from "vitest";
import { setLocale } from "@/i18n";
import { levelOf } from "./level";
import { pickEngine, startVoiceSession } from "./session";

test("con IA y micrófono se transcribe en el Worker", () => {
  expect(pickEngine({ ai: true, recorder: true, recognition: true })).toBe(
    "worker",
  );
});

test("sin IA o sin grabadora se usa el dictado del navegador", () => {
  expect(pickEngine({ ai: false, recorder: true, recognition: true })).toBe(
    "browser",
  );
  expect(pickEngine({ ai: true, recorder: false, recognition: true })).toBe(
    "browser",
  );
});

test("sin ningún motor de voz solo queda escribir", () => {
  expect(pickEngine({ ai: false, recorder: true, recognition: false })).toBe(
    "none",
  );
});

test("el volumen va de 0 (silencio) a 1 (señal fuerte)", () => {
  expect(levelOf(new Uint8Array([128, 128, 128, 128]))).toBe(0);
  expect(levelOf(new Uint8Array([255, 0, 255, 0]))).toBe(1);
  const soft = levelOf(new Uint8Array([134, 122, 134, 122]));
  expect(soft).toBeGreaterThan(0.1);
  expect(soft).toBeLessThan(0.3);
  expect(levelOf(new Uint8Array())).toBe(0);
});

/** Dictado del navegador de mentira: jsdom no tiene la Web Speech API. */
function fakeRecognition() {
  const created: { lang: string }[] = [];
  class Recognition extends EventTarget {
    lang = "";
    continuous = false;
    interimResults = false;
    constructor() {
      super();
      created.push(this);
    }
    start() {
      this.dispatchEvent(new Event("start"));
    }
    stop() {
      this.dispatchEvent(new Event("end"));
    }
    abort() {}
  }
  vi.stubGlobal("SpeechRecognition", Recognition);
  return created;
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

test("el dictado del navegador escucha en el idioma activo", async () => {
  const created = fakeRecognition();
  setLocale("en");
  (await startVoiceSession("browser", () => {})).cancel();
  setLocale("es");
  (await startVoiceSession("browser", () => {})).cancel();
  expect(created.map((r) => r.lang)).toEqual(["en-US", "es-MX"]);
});
