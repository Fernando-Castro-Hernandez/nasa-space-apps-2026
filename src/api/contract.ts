// Contrato entre la app y el Worker (HU-29). Lo importan los dos lados para
// que una petición y su respuesta tengan una sola definición. Solo tipos,
// listas cerradas y límites: nada de lógica.
//
// Idioma: cada petición de IA lleva `locale` ("en" o "es"), el idioma de la
// persona. Va en el cuerpo JSON y, en transcribe (el cuerpo es el audio), en
// `?locale=`. Si no viene, el Worker usa inglés, el idioma oficial.
import type { Locale } from "../i18n/translate";

export type { Locale };

/** Síntomas que la bitácora puede registrar (HU-09: lista cerrada). Los
 *  códigos no cambian con el idioma; su nombre está en `symptomLabels.ts`. */
export const SYMPTOMS = [
  "mareo",
  "congestion",
  "dolor_cabeza",
  "dolor_espalda",
  "otro",
] as const;
export type Symptom = (typeof SYMPTOMS)[number];

export const SLEEP_QUALITIES = ["mala", "regular", "buena"] as const;
export type SleepQuality = (typeof SLEEP_QUALITIES)[number];

/** Campos de la bitácora por voz (HU-09). `null` es "no lo dijo". */
export type CheckInFields = {
  /** Horas dormidas, de 0 a 24. */
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;
  /** Ánimo de 1 (muy bajo) a 5 (muy bueno). */
  mood: number | null;
  /** Estrés de 1 (nada) a 5 (mucho). */
  stress: number | null;
  symptoms: Symptom[];
};

/** POST /api/voice/transcribe?locale=en|es · el cuerpo es el audio crudo. */
export type TranscribeQuery = { locale: Locale };
export type TranscribeResponse = { text: string };

export type ExtractRequest = { text: string; locale: Locale };
export type ExtractResponse = { fields: CheckInFields };

/** Estado del semáforo como código (domain/vitals). Cada lado lo dice en su
 *  idioma: Good · Caution · Alert, o Bien · Precaución · Atención. */
export const STATUS_CODES = ["verde", "ambar", "rojo"] as const;
export type StatusCode = (typeof STATUS_CODES)[number];

/** Lo que las reglas ya decidieron y Lunito puede decir. La IA no ve más.
 *  Los textos (`reason`, `pendingActions`) llegan ya en el idioma de la persona. */
export type LunitoContext = {
  name: string;
  status: StatusCode;
  /** Motivo del estado en una línea, o null si todo está Bien. */
  reason: string | null;
  /** Acciones del día sin completar. */
  pendingActions: string[];
  checkInDone: boolean;
  missionDay: number;
  /** Nombre del oficial médico a bordo. */
  cmoName: string;
};

export type LunitoTurn = { role: "user" | "lunito"; text: string };

export type LunitoReplyRequest = {
  message: string;
  context: LunitoContext;
  history?: LunitoTurn[];
  locale: Locale;
};

/** A dónde invita Lunito después de responder. Lo deciden las reglas. */
export type LunitoSuggestion = "emergencia" | "check-in" | null;

export type LunitoReplyResponse = {
  text: string;
  /** "reglas": frase fija, sin IA (emergencia o IA no disponible). */
  source: "ia" | "reglas";
  suggest: LunitoSuggestion;
};

export type SpeakRequest = { text: string; locale: Locale };

export type HealthResponse = { ok: true; ai: boolean };

export type ApiErrorBody = { error: string };

export const LIMITS = {
  /** 30 s de audio comprimido caben de sobra. */
  audioBytes: 2_000_000,
  /** Transcripción de la bitácora. */
  textChars: 2000,
  /** Mensaje para Lunito. */
  messageChars: 500,
  /** Texto que Lunito dice en voz alta. */
  speakChars: 400,
  historyTurns: 6,
} as const;
