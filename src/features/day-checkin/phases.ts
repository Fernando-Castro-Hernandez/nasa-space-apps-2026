// Fases del check-in único (/buenos-dias) y cómo se pasa de una a otra.
// Saludo → pregunta → escucha → pensando → "Esto entendí" (la hoja, también
// para quien escribe) → sensor (opcional) → prueba de reacción (opcional) →
// resultado → Inicio. Funciones puras: la pantalla solo despacha eventos.
import type { StatusCode } from "@/api/contract";
import type { LunitoPose } from "@/features/lunito/poses";
import type { VoiceLogState } from "@/features/voice/useVoiceLog";
import type { VoiceStatus } from "@/features/voice/useVoiceInput";
import saludo from "./assets/lunito-saludo.webp";
import pregunta from "./assets/lunito-pregunta.webp";
import escucha from "./assets/lunito-escucha.webp";

export type Phase =
  | "saludo"
  | "pregunta"
  | "escucha"
  | "pensando"
  | "revisar"
  | "sensor"
  | "reaccion"
  | "resultado";

export type PhaseEvent =
  /** Terminó el saludo. */
  | "tick"
  /** Tocó el micrófono. */
  | "tapMic"
  /** Dejó de escuchar: se transcribe o se ordena. */
  | "think"
  /** Ya hay texto (y campos, o el aviso de llenarlos a mano). */
  | "heard"
  /** No se pudo escuchar: vuelve a preguntar, con el aviso. */
  | "failed"
  /** "Escribir respuesta": la misma hoja, con lo que haya. */
  | "write"
  /** Cerró la hoja sin terminar. */
  | "close"
  /** Guardó la bitácora. */
  | "confirm"
  /** Terminó o saltó el paso opcional. */
  | "next";

/** Fases de la conversación: se puede escribir en lugar de hablar. */
export const TALKING: readonly Phase[] = [
  "saludo",
  "pregunta",
  "escucha",
  "pensando",
];

export function nextPhase(phase: Phase, event: PhaseEvent): Phase {
  switch (event) {
    case "tick":
      return phase === "saludo" ? "pregunta" : phase;
    case "tapMic":
      return phase === "saludo" || phase === "pregunta" ? "escucha" : phase;
    case "think":
      return phase === "escucha" ? "pensando" : phase;
    case "heard":
      return phase === "escucha" || phase === "pensando" ? "revisar" : phase;
    case "failed":
      return phase === "escucha" || phase === "pensando" ? "pregunta" : phase;
    case "write":
      return TALKING.includes(phase) ? "revisar" : phase;
    case "close":
      return phase === "revisar" ? "pregunta" : phase;
    case "confirm":
      return phase === "revisar" ? "sensor" : phase;
    case "next":
      return phase === "sensor"
        ? "reaccion"
        : phase === "reaccion"
          ? "resultado"
          : phase;
  }
}

/** Lo que la pantalla sabe de la sesión de voz y de la bitácora. */
export type VoiceSnapshot = {
  status: VoiceStatus;
  error: string | null;
  log: VoiceLogState["phase"];
  organizing: VoiceLogState["organizing"];
};

/**
 * Mientras se escucha y se piensa, la voz lleva la conversación: al soltar el
 * micrófono, Lunito piensa; con el texto ordenado, abre "Esto entendí"; si no
 * oyó nada o no hay micrófono, vuelve a preguntar. Nunca se queda atascado.
 */
export function voiceEvent(
  phase: Phase,
  voice: VoiceSnapshot,
): PhaseEvent | null {
  if (phase !== "escucha" && phase !== "pensando") return null;
  if (voice.status === "starting" || voice.status === "listening") return null;
  if (voice.status === "transcribing" || voice.organizing === "working")
    return phase === "escucha" ? "think" : null;
  if (voice.log === "review") return "heard";
  return voice.error ? "failed" : null;
}

/** Tamaño de Lunito: grande en la conversación, más chico en los pasos. */
export type LunitoSize = "l" | "m" | "s";

type PhaseView = { pose: LunitoPose; image: string; size: LunitoSize };

/** Pose del Lunito 3D, su imagen de respaldo y su tamaño en cada fase. */
export const PHASE_VIEW: Record<Phase, PhaseView> = {
  saludo: { pose: "greeting", image: saludo, size: "l" },
  pregunta: { pose: "asking", image: pregunta, size: "l" },
  escucha: { pose: "listening", image: escucha, size: "l" },
  pensando: { pose: "thinking", image: escucha, size: "l" },
  revisar: { pose: "listening", image: escucha, size: "l" },
  sensor: { pose: "idle", image: pregunta, size: "m" },
  reaccion: { pose: "idle", image: pregunta, size: "s" },
  resultado: { pose: "idle", image: pregunta, size: "m" },
};

/**
 * Lunito en el resultado: mientras lo dice, habla solo (followVoice); al
 * terminar, celebra que hiciste tu check-in (se premian acciones, no valores).
 * En Atención no celebra: te cuida (SISTEMA.md §1).
 */
export function resultPose(status: StatusCode, finished: boolean): LunitoPose {
  if (status === "rojo") return "caring";
  if (finished) return "celebrating";
  return status === "verde" ? "idle" : "caring";
}

/** Imagen de respaldo de la pose del resultado. */
export const resultImage = (pose: LunitoPose) =>
  pose === "celebrating" ? saludo : pregunta;

/** El saludo dura lo que tarda en leerse; después, la pregunta. */
export const GREETING_MS = 2600;
/** "¡Listo!" se ve este tiempo antes de pasar a Inicio. */
export const DONE_MS = 1200;
