// Datos de muestra (src/data): tripulación, misión, feed de la nave.
import type { Messages } from "../../translate";
import type { data as source } from "../en/data";

export const data: Messages<typeof source> = {
  mission: {
    phase: "Tránsito a Marte",
  },
  crew: {
    roles: {
      specialist: "Especialista de misión",
      cmo: "Oficial médico (CMO)",
      commander: "Comandante",
      engineer: "Ingeniero de vuelo",
    },
    // Ánimo en palabras para la constelación: nunca números.
    moods: {
      shortOnRest: "Descansando poco",
      good: "Bien",
    },
  },
  // Acciones del día simuladas (actions.ts); la respiración guiada es la de domain.
  actions: {
    screens: "Apagar pantallas a las 22:00",
  },
  // Gráficas de muestra (history.ts).
  history: {
    restingPulse: "Pulso en reposo",
    oxygen: "Oxígeno en sangre",
    recovery: "Variabilidad cardíaca (HRV)",
  },
  // Lecturas de muestra que se eligen en la demo (sample.ts).
  samples: {
    normal: "Normal",
    lowRest: "Poco descanso",
    lowOxygen: "Oxígeno bajo",
    confirmedAlert: "Rojo confirmado",
  },
  // Compañero del día de la demo (lunitoDashboard.ts).
  companion: {
    shareCoffee: "Compartan un café y conversen un momento",
    askSleep: "Pregúntale cómo durmió",
  },
};
