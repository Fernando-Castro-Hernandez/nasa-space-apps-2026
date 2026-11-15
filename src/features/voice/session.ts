// Escuchar a la persona (HU-08). Dos motores con la misma forma:
//  - "worker": graba con el micrófono y transcribe en el Worker (Whisper).
//  - "browser": dictado del navegador (Web Speech API), si el Worker no está.
// Si no hay ninguno, el texto se escribe a mano.
// Los dos escuchan en el idioma activo de la app.
import { api } from "@/api/client";
import { localeTag } from "@/i18n";
import { rmsLevel } from "./level";

export type VoiceEngine = "worker" | "browser" | "none";

export type VoiceSession = {
  /** Deja de escuchar y devuelve lo que entendió. */
  stop(): Promise<string>;
  /** Descarta lo escuchado y suelta el micrófono. */
  cancel(): void;
  /** Volumen del micrófono en este instante, de 0 a 1. */
  level(): number;
};

type Capabilities = { ai: boolean; recorder: boolean; recognition: boolean };

export const pickEngine = (c: Capabilities): VoiceEngine =>
  c.ai && c.recorder ? "worker" : c.recognition ? "browser" : "none";

// Lo mínimo de la Web Speech API, que no está en los tipos del DOM.
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvents = {
  start: unknown;
  end: unknown;
  error: { error: string };
  result: { resultIndex: number; results: ArrayLike<RecognitionResult> };
};
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  addEventListener<K extends keyof RecognitionEvents>(
    type: K,
    listener: (event: RecognitionEvents[K]) => void,
  ): void;
  start(): void;
  stop(): void;
  abort(): void;
};

function recognitionCtor(): (new () => Recognition) | undefined {
  const w = window as unknown as Record<string, new () => Recognition>;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

// Si una transcripción falla, el resto de la sesión usa el dictado del
// navegador (HU-08: "si el Worker falla, se intenta con la Web Speech API").
let workerFailed = false;

export async function detectEngine(): Promise<VoiceEngine> {
  return pickEngine({
    ai: !workerFailed && (await api.aiAvailable()),
    recorder:
      typeof MediaRecorder !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia),
    recognition: Boolean(recognitionCtor()),
  });
}

/** `onEnd`: el motor dejó de escuchar por su cuenta (silencio largo). */
export function startVoiceSession(
  engine: Exclude<VoiceEngine, "none">,
  onEnd: () => void,
): Promise<VoiceSession> {
  return engine === "worker" ? record() : dictate(onEnd);
}

const RECORDER_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

async function record(): Promise<VoiceSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  });
  const mimeType = RECORDER_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
  // 32 kbps: 30 s de voz pesan unos 120 KB.
  const recorder = new MediaRecorder(stream, {
    mimeType,
    audioBitsPerSecond: 32_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 256;
  context.createMediaStreamSource(stream).connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);

  const release = () => {
    stream.getTracks().forEach((track) => track.stop());
    void context.close();
  };
  recorder.start();

  return {
    level: () => rmsLevel(analyser, samples),
    cancel() {
      recorder.onstop = null;
      if (recorder.state !== "inactive") recorder.stop();
      release();
    },
    stop: () =>
      new Promise<string>((resolve, reject) => {
        recorder.onstop = () => {
          release();
          const audio = new Blob(chunks, { type: recorder.mimeType });
          if (audio.size === 0) return resolve("");
          api.transcribe(audio).then(resolve, (error: unknown) => {
            workerFailed = true;
            reject(error);
          });
        };
        recorder.stop();
      }),
  };
}

function dictate(onEnd: () => void): Promise<VoiceSession> {
  const Ctor = recognitionCtor()!;
  return new Promise((resolve, reject) => {
    const recognition = new Ctor();
    recognition.lang = localeTag();
    recognition.continuous = true;
    recognition.interimResults = true;

    let finals = "";
    let interim = "";
    let started = false;
    let ended = false;
    let cancelled = false;
    let finish: ((text: string) => void) | undefined;
    const text = () => `${finals} ${interim}`.replace(/\s+/g, " ").trim();

    recognition.addEventListener("result", (event) => {
      interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]!;
        if (result.isFinal) finals += ` ${result[0].transcript}`;
        else interim += result[0].transcript;
      }
    });
    recognition.addEventListener("error", (event) => {
      if (!started) reject(new Error(event.error));
    });
    recognition.addEventListener("end", () => {
      ended = true;
      if (!started) return reject(new Error("El dictado no pudo empezar"));
      if (cancelled) return;
      if (finish) finish(text());
      else onEnd();
    });
    recognition.addEventListener("start", () => {
      started = true;
      resolve({
        // Sin acceso a la señal: la onda se mueve más cuando hay palabras.
        level: () => (interim ? 0.7 : 0.25),
        cancel() {
          cancelled = true;
          recognition.abort();
        },
        stop: () =>
          new Promise<string>((done) => {
            if (ended) return done(text());
            finish = done;
            recognition.stop();
          }),
      });
    });
    recognition.start();
  });
}
