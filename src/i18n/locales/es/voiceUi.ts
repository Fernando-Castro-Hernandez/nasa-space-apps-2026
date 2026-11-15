// Bloques de voz: micrófono, transcripción y campos de la bitácora.
import type { Messages } from "../../translate";
import type { voiceUi as source } from "../en/voiceUi";

export const voiceUi: Messages<typeof source> = {
  mic: {
    stop: "Terminar de hablar",
  },
  sheet: {
    heard: "Esto entendí",
    text: "Tu respuesta",
    placeholder: "Cuéntame cómo dormiste y cómo te sientes.",
    organize: "Ordenar mi bitácora",
    organizing: "Ordenando lo que dijiste…",
    understood: "Lo que entendí · toca para corregir",
    failed: "No pude ordenar tu bitácora. Llena los campos a mano.",
    required: "Elige tu ánimo y tu estrés para terminar.",
    confirm: "Listo",
  },
  followUp: {
    sleep: "¿Cuántas horas dormiste?",
    mood: "¿Y tu ánimo, del 1 al 5?",
    stress: "¿Y qué tan estresado estás, del 1 al 5?",
    symptoms: "¿Algo te molesta, como dolor de cabeza o mareo?",
  },
  fields: {
    sleep: "Sueño",
    sleepHours: "Horas de sueño",
    sleepQuality: "Calidad del sueño: {quality}",
    qualities: {
      mala: "Mala",
      regular: "Regular",
      buena: "Buena",
    },
    symptoms: "Síntomas",
    mood: "Ánimo",
    stress: "Estrés",
    moodLevels: {
      veryLow: "muy bajo",
      low: "bajo",
      okay: "regular",
      good: "bueno",
      veryGood: "muy bueno",
    },
    stressLevels: {
      none: "nada",
      little: "poco",
      some: "algo",
      quiteABit: "bastante",
      aLot: "mucho",
    },
    scaleOption: "{name} {value} de 5: {word}",
    selected: "{name} · {word}",
    pending: "{name} · falta elegir",
  },
};
