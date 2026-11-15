// Lo que dice Lunito por reglas y los textos de su conversación.
import type { Messages } from "../../translate";
import type { lunito as source } from "../en/lunito";

export const lunito: Messages<typeof source> = {
  // Frases fijas de las reglas (src/api/lunitoRules.ts). También se dicen en
  // voz alta: cortas y sin abreviaturas.
  rules: {
    hello: "Hola, {name}.",
    stateGood: "Hoy tu estado es Bien: tus indicadores están en tu normal.",
    state: "Hoy tu estado es {status}.",
    stateWithReason: "Hoy tu estado es {status}. {reason}.",
    repeatMeasurement: "Repite la medición.",
    tellCmo: "Avisa a {cmo}, tu oficial médico.",
    askCheckIn: "¿Hacemos tu check-in?",
    suggestAction: "Te propongo esto: {action}.",
    allDone: "Ya hiciste todo lo de hoy.",
    noDetail: "Ahora no puedo responderte con detalle.",
    emergency:
      "Eso puede ser una emergencia. Toca el botón rojo Emergencia ahora y avisa a {cmo}, tu oficial médico. Aquí sigo contigo.",
    emergencySelf:
      "Eso puede ser una emergencia. Toca el botón rojo Emergencia ahora. Aquí sigo contigo.",
  },
  chat: {
    region: "Habla con Lunito",
    you: "Tú: “{message}”",
    thinking: "Déjame pensar…",
    openEmergency: "Abrir Emergencia",
    doCheckIn: "Hacer mi check-in",
    mic: "Hablarle a Lunito",
    input: "Escríbele a Lunito",
    listening: "Te escucho… toca el micrófono para enviar",
    send: "Enviar mensaje a Lunito",
    speaking: "Lunito está hablando",
    listen: "Escuchar a Lunito",
    voiceOff: "Voz apagada",
    turnVoiceOff: "Apagar voz",
    disclaimer: "Lunito te acompaña y te guía. No diagnostica.",
    cmoFallback: "el oficial médico",
  },
};
