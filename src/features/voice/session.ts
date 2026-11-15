// Escuchar a la persona (HU-08). Dos motores con la misma forma:
//  - "worker": graba con el micrófono y transcribe en el Worker (Whisper).
//  - "browser": dictado del navegador (Web Speech API), si el Worker no está.
// Si no hay ninguno, el texto se escribe a mano.
// Los dos escuchan en el idioma activo de la app.
import { api } from "@/api/client";
import { localeTag } from "@/i18n";
import { rmsLevel } from "./level";
import { silenceDetector, VOICE_LEVEL } from "./silence";

export type VoiceEngine = "worker" | "browser" | "none";

export type VoiceSession = {
  /** Deja de escuchar y devuelve lo que entendió. */
  stop(): Promise<string>;
  /** Descarta lo escuchado y suelta el micrófono. */
  cancel(): void;
  /** Volumen del micrófono en este instante, de 0 a 1. */
  level(): number;
  /** Lo que lleva entendido mientras habla. Solo el dictado del navegador lo
   *  sabe; Whisper transcribe al terminar. */
  partial?(): string;
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

/** Una pausa así de larga cierra un trozo: se transcribe mientras sigue hablando. */
const PAUSE_MS = 700;
/** Por debajo de esto un trozo es solo ruido y no vale una transcripción. */
const FAINT_LEVEL = VOICE_LEVEL / 2;

/**
 * La vista previa palabra por palabra está apagada salvo que el build lleve
 * `VITE_VOICE_PREVIEW=on`. Usa el dictado del navegador a la vez que Whisper,
 * y en Chrome ese dictado manda el audio al servicio de voz de Google: con
 * ella, la bitácora de salud sale de Cloudflare (DECISIONS.md, "un motor de
 * voz a la vez"). Apagada, el texto se ve frase por frase, con Whisper.
 */
const previewEnabled = () => import.meta.env.VITE_VOICE_PREVIEW === "on";

/** Errores del dictado que no se arreglan reintentando (sin permiso, sin red,
 *  servicio no disponible). "no-speech" y "aborted" sí son pasajeros. */
const TRANSIENT_ERRORS = new Set(["no-speech", "aborted"]);

/**
 * Texto en vivo mientras se habla: el dictado del navegador como vista previa
 * (Whisper no transcribe palabra por palabra). El texto final sigue siendo el
 * de Whisper. Si está apagada, el navegador no la tiene, o es Android (donde
 * dos capturas del micrófono a la vez se pelean), se ve frase por frase.
 */
function livePreview(): { text(): string; stop(): void } | null {
  const Ctor = recognitionCtor();
  if (!previewEnabled() || !Ctor || /Android/i.test(navigator.userAgent))
    return null;
  try {
    const recognition = new Ctor();
    recognition.lang = localeTag();
    recognition.continuous = true;
    recognition.interimResults = true;
    let text = "";
    // Lo dicho antes de que el navegador reiniciara el dictado.
    let carried = "";
    let active = true;
    recognition.addEventListener("result", (event) => {
      text = [carried, ...Array.from(event.results, (r) => r[0].transcript)]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    });
    // Un fallo que no es pasajero apaga la vista previa: reintentar sería
    // un bucle de arranques fallidos mientras dura la grabación.
    recognition.addEventListener("error", (event) => {
      if (!TRANSIENT_ERRORS.has(event.error)) active = false;
    });
    // El navegador lo corta solo tras un silencio largo: se reanuda.
    recognition.addEventListener("end", () => {
      if (!active) return;
      carried = text;
      try {
        recognition.start();
      } catch {
        active = false;
      }
    });
    recognition.start();
    return {
      text: () => text,
      stop() {
        active = false;
        recognition.abort();
      },
    };
  } catch {
    return null;
  }
}

// Graba en trozos, uno por frase: cada pausa cierra el trozo y lo manda a
// transcribir en segundo plano, y otra grabadora toma el micrófono sin hueco.
// Así el texto aparece mientras habla (`partial`) y, al terminar, solo falta
// la última frase. Cada trozo es un archivo completo: partir una sola
// grabación no sirve, solo el primer pedazo trae el encabezado.
async function record(): Promise<VoiceSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  });
  try {
    return recordFrom(stream);
  } catch (error) {
    // Sin esto, si algo falla después de abrir el micrófono, queda encendido.
    stream.getTracks().forEach((track) => track.stop());
    throw error;
  }
}

function recordFrom(stream: MediaStream): VoiceSession {
  const mimeType = RECORDER_TYPES.find((t) => MediaRecorder.isTypeSupported(t));

  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 256;
  context.createMediaStreamSource(stream).connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);

  const startSegment = () => {
    // 32 kbps: 30 s de voz pesan unos 120 KB.
    const recorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 32_000,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.start();
    return { recorder, chunks, spoke: false };
  };
  type Segment = ReturnType<typeof startSegment>;

  const texts: string[] = [];
  const pending: Promise<void>[] = [];
  // `force`: el último trozo se transcribe aunque sea muy bajito si todavía
  // no hay nada, para no perder a quien habla quedito.
  const close = (segment: Segment, force: boolean) => {
    const slot = texts.push("") - 1;
    const job = new Promise<void>((resolve, reject) => {
      segment.recorder.onstop = () => {
        const audio = new Blob(segment.chunks, {
          type: segment.recorder.mimeType,
        });
        if (audio.size === 0 || !(segment.spoke || force)) return resolve();
        api.transcribe(audio).then((text) => {
          texts[slot] = text.trim();
          resolve();
        }, reject);
      };
      if (segment.recorder.state !== "inactive") segment.recorder.stop();
      else resolve();
    });
    // El error se entrega en `stop`; aquí no es una promesa sin atender.
    job.catch(() => {});
    pending.push(job);
  };

  const preview = livePreview();
  let current = startSegment();
  let quiet = silenceDetector(PAUSE_MS);
  const timer = window.setInterval(() => {
    const level = rmsLevel(analyser, samples);
    if (level >= FAINT_LEVEL) current.spoke = true;
    if (!quiet(level, performance.now())) return;
    const finished = current;
    current = startSegment();
    quiet = silenceDetector(PAUSE_MS);
    close(finished, false);
  }, 100);

  const release = () => {
    window.clearInterval(timer);
    preview?.stop();
    stream.getTracks().forEach((track) => track.stop());
    void context.close();
  };

  return {
    level: () => rmsLevel(analyser, samples),
    partial: () => preview?.text() || texts.filter(Boolean).join(" "),
    cancel() {
      current.recorder.onstop = null;
      if (current.recorder.state !== "inactive") current.recorder.stop();
      release();
    },
    async stop() {
      release();
      close(current, !texts.some(Boolean) && pending.length === 0);
      try {
        await Promise.all(pending);
      } catch (error) {
        workerFailed = true;
        throw error;
      }
      return texts.filter(Boolean).join(" ");
    },
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
        // Sin acceso a la señal: la onda se mueve más cuando hay palabras, y
        // sin palabras queda por debajo del umbral de voz (silence.ts).
        level: () => (interim ? 0.7 : 0.05),
        partial: text,
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
