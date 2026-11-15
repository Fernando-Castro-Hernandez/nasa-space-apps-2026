// Palabras compartidas por toda la app: estados, unidades, botones genéricos y avisos.
export const common = {
  appName: "Nóstos",
  // Los tres estados del semáforo (DISENO.md): siempre color y palabra.
  status: {
    verde: "Good",
    ambar: "Caution",
    rojo: "Alert",
  },
  emergency: "Emergency",
  simulated: "simulated",
  comingSoon: "Coming soon",
  notShared: "Not shared",
  notDiagnosis: "Prototype. Not a diagnosis.",
  // Lo que todavía no tiene fuente en FUENTES.md (reglas, umbrales, acciones).
  pendingValidation: "pending validation",
  missionDay: "Day {day}",
  // Los cinco peligros de NASA (RIDGE, SISTEMA.md §3), por su letra.
  hazards: {
    R: "Radiation",
    I: "Isolation",
    D: "Distance",
    G: "Gravity",
    E: "Environment",
  },
  // Los tres indicadores de salud, como los nombra el glosario.
  metrics: {
    bpm: "Pulse",
    hrv: "Heart rate variability",
    spo2: "Blood oxygen",
  },
  // Cada día en los ejes de las gráficas, de lunes a domingo. Tres letras,
  // como la consola de Tierra: con iniciales, "T" y "S" se repiten.
  weekdays: {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  },
  /** Semana abreviada en los ejes de las gráficas: "Wk 1". */
  weekShort: "Wk {n}",
  units: {
    bpm: "bpm",
    ms: "ms",
    percent: "%",
    hours: "h",
    seconds: "s",
  },
  minutes: {
    one: "{count} minute",
    other: "{count} minutes",
  },
  // Botones − y + de un número (components/ui/number-stepper).
  stepper: {
    decrease: "Decrease {label}",
    increase: "Increase {label}",
  },
  actions: {
    close: "Close",
    cancel: "Cancel",
    save: "Save",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    retry: "Try again",
    edit: "Edit",
    send: "Send",
  },
};
