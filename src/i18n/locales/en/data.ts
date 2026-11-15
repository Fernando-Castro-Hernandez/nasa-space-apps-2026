// Datos de muestra (src/data): tripulación, misión, feed de la nave.
export const data = {
  mission: {
    phase: "Mars transit",
  },
  crew: {
    roles: {
      specialist: "Mission specialist",
      cmo: "Crew medical officer (CMO)",
      commander: "Commander",
      engineer: "Flight engineer",
    },
    // Ánimo en palabras para la constelación: nunca números.
    moods: {
      shortOnRest: "Short on rest",
      good: "Doing well",
    },
  },
  // Acciones del día simuladas (actions.ts); la respiración guiada es la de domain.
  actions: {
    screens: "Turn off screens at 22:00",
  },
  // Gráficas de muestra (history.ts).
  history: {
    restingPulse: "Resting pulse",
    oxygen: "Blood oxygen",
    recovery: "Heart rate variability (HRV)",
  },
  // Lecturas de muestra que se eligen en la demo (sample.ts).
  samples: {
    normal: "Normal",
    lowRest: "Little rest",
    lowOxygen: "Low oxygen",
    confirmedAlert: "Confirmed alert",
  },
  // Compañero del día de la demo (lunitoDashboard.ts).
  companion: {
    shareCoffee: "Share a coffee and chat for a moment",
    askSleep: "Ask how they slept",
  },
};
