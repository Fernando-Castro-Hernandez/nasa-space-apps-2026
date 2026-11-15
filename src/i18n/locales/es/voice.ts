// Mensajes del motor de voz: errores y estados al escuchar.
import type { Messages } from "../../translate";
import type { voice as source } from "../en/voice";

export const voice: Messages<typeof source> = {
  errors: {
    nothingHeard: "No escuché nada. Intenta de nuevo.",
    notUnderstood: "No pude entender el audio. Intenta de nuevo.",
    noMic: "No pude usar el micrófono.",
  },
  // Nombre de cada síntoma de la bitácora; la clave es su código del contrato.
  symptoms: {
    mareo: "Mareo",
    congestion: "Congestión",
    dolor_cabeza: "Dolor de cabeza",
    dolor_espalda: "Dolor de espalda",
    otro: "Otro",
  },
};
