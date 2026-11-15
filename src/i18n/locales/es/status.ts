// Mi estado: indicadores, evolución y feed de la nave.
import type { Messages } from "../../translate";
import type { status as source } from "../en/status";

export const status: Messages<typeof source> = {
  lastReading: "Último registro · {time}",
  sensorReading: "Medido con el sensor · {time}",
  indicators: "Tus indicadores",
  /** Peligro de NASA al que responde cada indicador: por qué importa. */
  hazard: "RIDGE · {hazard}",
  // Qué mide cada indicador, en palabras simples (glosario de SISTEMA.md).
  explain: {
    bpm: "Cuántas veces late tu corazón por minuto cuando estás en reposo.",
    hrv: "Cuánto varía el tiempo entre latidos. Alta indica relajación y recuperación; baja indica estrés o cansancio.",
    spo2: "Es el porcentaje de oxigenación de tu sangre. Sirve más para ver tendencias que valores aislados.",
  },
  trend: "Tu evolución",
  /** Leyenda de la línea punteada de la gráfica. */
  baseline: "Línea punteada: tu línea base, {value}",
  tasks: "Tus tareas de hoy",
  tasksDone: "{count} de {total} hechas",
  ship: {
    title: "Datos de la nave",
    description: "Lo que registra la nave sobre dosis, ejercicio y ambiente.",
    dose: "Dosis acumulada",
    exercise: "Ejercicio (7 días)",
    co2: "CO₂ de cabina",
    temperature: "Temperatura",
    pressure: "Presión",
    humidity: "Humedad",
    minutes: "{value} min",
  },
};
