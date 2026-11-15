// Mi estado: indicadores, evolución y feed de la nave.
export const status = {
  lastReading: "Last reading · {time}",
  indicators: "Your indicators",
  /** Peligro de NASA al que responde cada indicador: por qué importa. */
  hazard: "RIDGE · {hazard}",
  // Qué mide cada indicador, en palabras simples (glosario de SISTEMA.md).
  explain: {
    bpm: "How many times your heart beats per minute while you rest.",
    hrv: "How much the time between heartbeats changes. Higher points to rest and recovery; lower, to stress or fatigue.",
    spo2: "How much oxygen your blood carries. It's more useful for spotting trends than as a single reading.",
  },
  trend: "Your trend",
  /** Leyenda de la línea punteada de la gráfica. */
  baseline: "Dashed line: your baseline, {value}",
  tasks: "Your tasks for today",
  tasksDone: "{count} of {total} done",
  ship: {
    title: "Ship data",
    description: "What the ship records about dose, exercise and the cabin.",
    dose: "Cumulative dose",
    exercise: "Exercise (7 days)",
    co2: "Cabin CO₂",
    temperature: "Temperature",
    pressure: "Pressure",
    humidity: "Humidity",
    minutes: "{value} min",
  },
};
