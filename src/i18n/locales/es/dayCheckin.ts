// Inicio del día: saludo de Lunito y conversación.
import type { Messages } from "../../translate";
import type { dayCheckin as source } from "../en/dayCheckin";

export const dayCheckin: Messages<typeof source> = {
  region: "Conversación con Lunito",
  lunito: "Lunito",
  notNow: "Ahora no",
  finish: "Ir a Inicio",
  write: "Escribir respuesta",
  greeting: {
    hello: "¡Hola!",
    title: "Qué gusto verte",
    caption: "Hola, soy Lunito",
    speech: "¡Hola! Qué gusto verte. ¿Cómo amaneciste hoy?",
  },
  question: {
    title: "¿Cómo amaneciste hoy?",
    caption: "Cuéntame cómo te sientes",
  },
  readback: {
    title: "Entendido",
    line: "Entendido. Ánimo {mood} de 5, estrés {stress} de 5.",
    summary: "Ánimo {mood} de 5 · estrés {stress} de 5",
    change: "Cambiar algo",
  },
  mic: {
    talk: "Hablar con Lunito",
    stop: "Terminar de hablar",
  },
  heard: "Te escuché:",
  asking: { caption: "Lunito está preguntando…" },
  listening: {
    starting: "Preparando el micrófono…",
    caption: "Te toca · te escucho",
    hint: "Paro cuando hagas una pausa",
  },
  thinking: {
    transcribing: "Pasando tu voz a texto…",
    organizing: "Ordenando lo que dijiste…",
  },
  noVoice: "Este navegador no puede escucharte. Escribe tu respuesta.",
};
