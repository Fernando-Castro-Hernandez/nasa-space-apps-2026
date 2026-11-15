import { afterEach, expect, test, vi } from "vitest";
import { api } from "@/api/client";
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
  const created: (EventTarget & { lang: string })[] = [];
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

/** Micrófono de mentira: el volumen lo manda la prueba; cada grabadora entrega un trozo. */
function fakeMicrophone() {
  const mic = { loud: false, recorders: 0 };
  class Recorder {
    static isTypeSupported = () => true;
    mimeType = "audio/webm";
    state = "inactive";
    ondataavailable: ((event: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;
    start() {
      this.state = "recording";
      mic.recorders++;
    }
    stop() {
      this.state = "inactive";
      this.ondataavailable?.({ data: new Blob(["audio"]) });
      this.onstop?.();
    }
  }
  class Context {
    createAnalyser = () => ({
      fftSize: 0,
      getByteTimeDomainData(samples: Uint8Array) {
        samples.forEach(
          (_, i) => (samples[i] = mic.loud ? (i % 2 ? 0 : 255) : 128),
        );
      },
    });
    createMediaStreamSource = () => ({ connect() {} });
    close = async () => {};
  }
  vi.stubGlobal("MediaRecorder", Recorder);
  vi.stubGlobal("AudioContext", Context);
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) },
  });
  return mic;
}

test("Whisper graba por trozos: cada pausa transcribe su frase y el texto se ve mientras habla", async () => {
  vi.useFakeTimers();
  try {
    const mic = fakeMicrophone();
    const transcribe = vi
      .spyOn(api, "transcribe")
      .mockResolvedValueOnce("hola")
      .mockResolvedValueOnce("dormí cinco horas");
    const session = await startVoiceSession("worker", () => {});

    mic.loud = true;
    await vi.advanceTimersByTimeAsync(400);
    mic.loud = false;
    await vi.advanceTimersByTimeAsync(900); // pausa: cierra el primer trozo
    expect(transcribe).toHaveBeenCalledOnce();
    expect(session.partial?.()).toBe("hola");
    expect(mic.recorders).toBe(2); // otra grabadora tomó el micrófono

    mic.loud = true;
    await vi.advanceTimersByTimeAsync(400);
    // Al terminar solo falta la última frase; el silencio del final no se manda.
    await expect(session.stop()).resolves.toBe("hola dormí cinco horas");
    expect(transcribe).toHaveBeenCalledTimes(2);
  } finally {
    vi.useRealTimers();
  }
});

test("si nunca pasó del umbral de voz, el último trozo se manda igual", async () => {
  vi.useFakeTimers();
  try {
    fakeMicrophone();
    const transcribe = vi
      .spyOn(api, "transcribe")
      .mockResolvedValue("Thank you.");
    const session = await startVoiceSession("worker", () => {});
    await vi.advanceTimersByTimeAsync(2000);
    // Sin nada antes, el último trozo se manda igual: quien habla quedito no se pierde.
    await session.stop();
    expect(transcribe).toHaveBeenCalledOnce();
  } finally {
    vi.useRealTimers();
  }
});

test("con dictado disponible, el texto se ve mientras habla; sin él, frase por frase", async () => {
  vi.useFakeTimers();
  try {
    fakeMicrophone();
    const created = fakeRecognition();
    vi.spyOn(api, "transcribe").mockResolvedValue("hola qué tal");
    const session = await startVoiceSession("worker", () => {});
    const result = Object.assign(new Event("result"), {
      results: [{ isFinal: false, 0: { transcript: "hola qué" } }],
    });
    created[0]!.dispatchEvent(result);
    expect(session.partial?.()).toBe("hola qué");
    // El texto final es el de Whisper, no el de la vista previa.
    await expect(session.stop()).resolves.toBe("hola qué tal");
  } finally {
    vi.useRealTimers();
  }
});
