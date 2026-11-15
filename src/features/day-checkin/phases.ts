import saludo from "./assets/lunito-saludo.webp";
import pregunta from "./assets/lunito-pregunta.webp";
import escucha from "./assets/lunito-escucha.webp";

export type Phase = "saludo" | "pregunta" | "escucha" | "listo";
export type PhaseEvent = "tick" | "tapMic" | "stop" | "submitText";

export function nextPhase(phase: Phase, event: PhaseEvent): Phase {
  if (event === "submitText") return "listo";
  if (phase === "saludo" && event === "tick") return "pregunta";
  if ((phase === "saludo" || phase === "pregunta") && event === "tapMic")
    return "escucha";
  if (phase === "escucha" && (event === "stop" || event === "tapMic"))
    return "listo";
  return phase;
}

export const PHASE_COPY = {
  saludo: {
    title: "¡Hola!\nQué gusto verte",
    caption: "Hola, soy Lunito",
    pose: saludo,
  },
  pregunta: {
    title: "¿Cómo amaneciste\nhoy?",
    caption: "Cuéntame cómo te sientes",
    pose: pregunta,
  },
  escucha: {
    title: "¿Cómo amaneciste\nhoy?",
    caption: "Escuchando…",
    pose: escucha,
  },
  listo: {
    title: "¿Cómo amaneciste\nhoy?",
    caption: "Escuchando…",
    pose: escucha,
  },
};

export const GREETING_MS = 2600;
export const LISTEN_MAX_MS = 30_000;
