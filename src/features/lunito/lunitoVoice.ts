// La voz de Lunito (DECISIONS.md: "Lunito tiene voz; la boca sigue lo que
// dice"). Pide el audio al Worker y, si no hay, usa la voz del navegador;
// las dos en el idioma activo. Mientras suena, el modelo 3D le pregunta en
// cada frame cómo va la boca y qué está haciendo (pensar o hablar).
import { useSyncExternalStore } from "react";
import { api } from "@/api/client";
import { LIMITS } from "@/api/contract";
import { persistedStore } from "@/data/persisted";
import { rmsLevel } from "@/features/voice/level";
import { getLocale, LOCALE_TAG, type Locale } from "@/i18n";
import {
  mouthAt,
  restPose,
  timelineOf,
  VISEMES,
  type MouthPose,
  type Segment,
} from "./visemes";

/** Boca de Lunito en un instante: formas para hablar y gesto de pensar. */
export type LunitoMouth = { visemes: MouthPose; pucker: number };

/** Qué hace Lunito: nada, espera una respuesta o está hablando. */
export type LunitoActivity = "idle" | "thinking" | "speaking";

export const restMouth = (): LunitoMouth => ({
  visemes: restPose(),
  pucker: 0,
});

type Speech = {
  id: number;
  timeline: Segment[];
  /** Segundos que dura el audio (estimados con la voz del navegador). */
  duration: number;
  startedAt: number;
  /** Reloj del audio, en segundos. */
  now: () => number;
  /** Volumen de la voz en este instante, de 0 a 1. */
  level: () => number;
  stop: () => void;
};

let speech: Speech | null = null;
let thinking = false;
let turn = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const mutedStore = persistedStore<boolean>(
  "nostos.lunito-silencio",
  (raw) => raw === "1",
  (muted) => (muted ? "1" : "0"),
);

let audioContext: AudioContext | undefined;
const audio = () => (audioContext ??= new AudioContext());

// Las frases que se repiten (saludo, pregunta del check-in) no se vuelven a
// pedir al Worker. La clave lleva el idioma: la misma frase suena distinto.
const CACHE_SIZE = 12;
const cache = new Map<string, AudioBuffer>();
const cacheKey = (text: string, locale: Locale) => `${locale}:${text}`;

/** El navegador solo deja sonar tras un toque; si no, no se espera para siempre. */
async function unlocked(context: AudioContext): Promise<AudioContext> {
  if (context.state === "suspended")
    await Promise.race([
      context.resume(),
      new Promise((_, reject) => setTimeout(reject, 1500)),
    ]);
  return context;
}

function finish(id: number) {
  if (speech?.id !== id) return;
  speech = null;
  notify();
}

async function load(context: AudioContext, key: string, text: string) {
  // `api.speak` manda el idioma activo, el mismo de `key`.
  const buffer = await context.decodeAudioData(await api.speak(text));
  if (cache.size >= CACHE_SIZE) cache.delete(cache.keys().next().value!);
  cache.set(key, buffer);
  return buffer;
}

async function playFromWorker(
  text: string,
  id: number,
  locale: Locale,
): Promise<void> {
  const context = await unlocked(audio());
  const key = cacheKey(text, locale);
  const buffer = cache.get(key) ?? (await load(context, key, text));
  if (id !== turn) return;

  const source = context.createBufferSource();
  source.buffer = buffer;
  const analyser = context.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
  analyser.connect(context.destination);
  const samples = new Uint8Array(analyser.fftSize);

  await new Promise<void>((resolve) => {
    const end = () => {
      finish(id);
      resolve();
    };
    source.addEventListener("ended", end, { once: true });
    speech = {
      id,
      timeline: timelineOf(text, locale),
      duration: buffer.duration,
      startedAt: context.currentTime,
      now: () => context.currentTime,
      level: () => rmsLevel(analyser, samples, 5),
      stop: () => source.stop(),
    };
    source.start();
    notify();
  });
}

/** Caracteres por segundo de la voz del navegador, para estimar la duración. */
const BROWSER_SPEED = 14;
const seconds = () => performance.now() / 1000;

/** Variantes de cada idioma, de la preferida a la menos. */
const VOICE_LANGS: Record<Locale, string[]> = {
  en: ["en-US", "en"],
  es: ["es-MX", "es-US", "es-419", "es"],
};

// Las voces neuronales suenan menos robóticas; los navegadores las marcan en
// el nombre ("Microsoft Aria Online (Natural)", "Google US English", "Ava
// (Premium)").
const NATURAL_VOICE = /natural|neural|online|google|premium|enhanced/i;

/**
 * La voz del navegador para `locale`: la variante preferida del idioma y,
 * dentro de ella, una voz natural si la hay. `undefined` si no hay ninguna.
 */
export function pickVoice<
  V extends Pick<SpeechSynthesisVoice, "lang" | "name">,
>(voices: readonly V[], locale: Locale): V | undefined {
  for (const lang of VOICE_LANGS[locale]) {
    const matching = voices.filter((v) =>
      v.lang.replace("_", "-").startsWith(lang),
    );
    const voice =
      matching.find((v) => NATURAL_VOICE.test(v.name)) ?? matching[0];
    if (voice) return voice;
  }
  return undefined;
}

function playFromBrowser(
  text: string,
  id: number,
  locale: Locale,
): Promise<void> {
  const synth = window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === "undefined")
    return Promise.resolve();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LOCALE_TAG[locale];
  const voice = pickVoice(synth.getVoices(), locale);
  if (voice) utterance.voice = voice;
  const duration = Math.max(1, text.length / BROWSER_SPEED);

  return new Promise<void>((resolve) => {
    let guard = 0;
    const end = () => {
      window.clearTimeout(guard);
      finish(id);
      resolve();
    };
    // Seguro: algunas voces (las "Google" de red en Chrome) cortan las frases
    // largas sin avisar "end", y Chrome puede descartar un speak() lanzado
    // justo después de cancel(). Si tarda bastante más de lo esperado, la
    // frase se da por terminada: la boca y "Lunito está hablando" no se pegan.
    guard = window.setTimeout(
      () => {
        if (id === turn) synth.cancel();
        end();
      },
      (duration * 1.5 + 2) * 1000,
    );
    utterance.addEventListener("start", () => {
      // Ya le pidieron callar o decir otra cosa antes de empezar.
      if (id !== turn) return synth.cancel();
      speech = {
        id,
        timeline: timelineOf(text, locale),
        duration,
        startedAt: seconds(),
        now: seconds,
        // Sin acceso al audio: un vaivén parejo en lugar del volumen real.
        level: () => 0.7 + 0.3 * Math.sin(performance.now() / 90),
        // Cancelar dispara "end" (o "error"), que cierra el turno.
        stop: () => synth.cancel(),
      };
      notify();
    });
    // Cada palabra que empieza corrige la estimación de por dónde va.
    utterance.addEventListener("boundary", (event) => {
      if (speech?.id === id)
        speech.startedAt =
          seconds() - (event.charIndex / text.length) * speech.duration;
    });
    utterance.addEventListener("end", end);
    utterance.addEventListener("error", end);
    synth.cancel();
    synth.speak(utterance);
  });
}

export const lunitoVoice = {
  /**
   * Lunito dice `text` en voz alta; termina cuando acaba de hablar. En
   * silencio (o sin voz disponible) no suena nada: el texto ya está en pantalla.
   */
  async say(text: string): Promise<void> {
    lunitoVoice.stop();
    const id = ++turn;
    const line = text.trim().slice(0, LIMITS.speakChars);
    if (!line || mutedStore.get()) return;
    const locale = getLocale();
    try {
      await playFromWorker(line, id, locale);
    } catch {
      if (id === turn) await playFromBrowser(line, id, locale);
    }
  },

  stop() {
    turn++;
    const current = speech;
    if (!current) return;
    speech = null;
    current.stop();
    notify();
  },

  /** Lunito espera una respuesta: hace el gesto de pensar. */
  setThinking(value: boolean) {
    if (thinking === value) return;
    thinking = value;
    notify();
  },

  /**
   * Qué hace Lunito en este instante. Lectura directa, sin React: sirve para
   * preguntarlo en cada frame. Hablar tiene prioridad sobre pensar.
   */
  activity(): LunitoActivity {
    if (speech) return "speaking";
    return thinking ? "thinking" : "idle";
  },

  setMuted(muted: boolean) {
    if (muted) lunitoVoice.stop();
    mutedStore.set(muted);
  },

  /** Cómo va la boca en este instante. Escribe en `out` y lo devuelve. */
  mouth(out: LunitoMouth): LunitoMouth {
    out.pucker = !speech && thinking ? 0.7 : 0;
    if (!speech) {
      for (const key of VISEMES) out.visemes[key] = 0;
      return out;
    }
    const progress = (speech.now() - speech.startedAt) / speech.duration;
    mouthAt(speech.timeline, progress, out.visemes);
    // El volumen abre más o menos la boca (LUNITO-ARTE.md §10).
    const open = 0.45 + 0.55 * speech.level();
    for (const key of VISEMES) out.visemes[key] *= open;
    return out;
  },
};

export const useLunitoSpeaking = () =>
  useSyncExternalStore(
    subscribe,
    () => speech !== null,
    () => false,
  );

/** Lo mismo que `lunitoVoice.activity()`, para un componente: cambia con él. */
export const useLunitoActivity = () =>
  useSyncExternalStore(
    subscribe,
    lunitoVoice.activity,
    (): LunitoActivity => "idle",
  );

export const useLunitoMuted = mutedStore.use;
