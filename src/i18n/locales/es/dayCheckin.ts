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
  mic: {
    talk: "Hablar con Lunito",
    stop: "Terminar de hablar",
  },
  listening: {
    starting: "Preparando el micrófono…",
    caption: "Escuchando…",
    hint: "Toca la onda cuando termines · quedan {seconds} s",
  },
  thinking: {
    transcribing: "Pasando tu voz a texto…",
    organizing: "Ordenando lo que dijiste…",
  },
  noVoice: "Este navegador no puede escucharte. Escribe tu respuesta.",
};
