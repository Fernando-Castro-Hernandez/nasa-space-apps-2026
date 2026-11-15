// Textos que producen las reglas de salud (src/domain): motivos, acciones, peligros.
// Los motivos empiezan en minúscula: la pantalla los pone después del estado
// o del indicador ("Caution · pulse: above your usual range").
export const domain = {
  reasons: {
    // Indicadores del dashboard (vitals.ts).
    outOfRangeCmo: "out of range, tell the crew medical officer",
    lowCmo: "low, tell the crew medical officer",
    doubtful: "unclear reading, measure again",
    aboveUsual: "above your usual range",
    belowUsual: "below your usual range",
    belowUsualRest: "below your usual range, get some rest",
    usual: "within your usual range",
    // Reglas de signos vitales del semáforo (vitalRules.ts).
    insufficientBaseline: "not enough baseline data yet",
    fewReadings: "too few readings this week",
    // Los indicadores con el nombre del glosario: pulse, heart rate
    // variability (HRV), blood oxygen.
    hrvLow:
      "heart rate variability (HRV) below your usual range on the 7-day average",
    hrvOk: "heart rate variability within your usual range",
    pulseRed: "pulse of {bpm} bpm, out of range",
    pulseHigh: "resting pulse above your usual range on the 3-day average",
    pulseOk: "pulse within your usual range",
    spo2Red: "blood oxygen at {value}%",
    spo2Below94: "blood oxygen below 94%",
    spo2Drop: "blood oxygen 3 points below your usual level",
    spo2Ok: "blood oxygen within your usual range",
    sleepLow: "you slept {hours} h on average over the last 3 nights",
    sleepOk: "sleep within your usual range",
    reactionLapses: "more attention lapses than usual (threshold {pending})",
    reactionOk: "attention within your usual range",
    // Reglas con datos de la nave (shipRules.ts).
    co2High: "cabin CO2 at {value} mmHg (1-hour average)",
    co2Ok: "cabin air is normal",
    radiationLimit: "cumulative dose of {dose} mSv, at the {limit} mSv limit",
    radiationNear:
      "cumulative dose close to the {limit} mSv limit (margin {pending})",
    radiationOk: "dose within the limit",
    exerciseLow: "{minutes} of {goal} min of exercise this week",
    exerciseOk: "exercise on track",
    // Luz D: enlace con Tierra (distanceRule.ts).
    noLink: "no link with Ground: follow the onboard protocol",
    awaitingGround: "waiting for Ground to respond",
    groundResponds: "Ground responds in ~{minutes} min",
    /** Una regla sin fuente que pedía rojo baja a amarillo y lo dice. */
    unsourced: "{reason} ({pending})",
  },
  /** Motivo en una línea con la letra del peligro: "I · Isolation: …". */
  reasonLine: "{letter} · {hazard}: {reason}",
  // Acciones del día (HU-14), ligadas a las reglas (actions.ts).
  actions: {
    contactSurgeon: "Contact the flight surgeon",
    doseLimit: "Contact the flight surgeon: your dose has reached the limit",
    repeatReading: "Measure again: 60 s at rest, with your hand still",
    onboardProtocol: "Follow the onboard protocol while Ground responds",
    ventilation: "Check the module's ventilation",
    sleep: "Make sleep a priority: at least 7 h tonight",
    exercise: "Finish today's exercise (goal: 600 min per week)",
    breathing: "Guided breathing · 5 min",
    restRecheck: "Rest, then measure again tomorrow at rest",
    doseCmo: "Review your cumulative dose with the crew medical officer",
    routine: "No changes, keep up your routine",
    disclaimer: "Prototype, not a diagnosis",
  },
  // Evento ambiental en la tripulación (environment.ts, HU-13).
  environment: {
    checkVentilation: "Check the ventilation in the {module}",
  },
  // Etiquetas de fuentes que no son un título original (sources.ts). Los
  // títulos y autores de las citas no se traducen.
  sources: {
    news2Response: "NEWS2 clinical response",
    ochmoRadiation: "OCHMO, radiation",
    nasaDelay: "NASA, space communications",
  },
};
