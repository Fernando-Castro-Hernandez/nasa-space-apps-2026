// La palabra de cada punto de las escalas de 1 a 5 de la bitácora, como
// claves del diccionario (`voiceUi.fields.moodLevels` y `stressLevels`). Las
// usan la hoja donde se eligen y el resumen del check-in en Inicio.
export const MOOD_LEVELS = [
  "veryLow",
  "low",
  "okay",
  "good",
  "veryGood",
] as const;

export const STRESS_LEVELS = [
  "none",
  "little",
  "some",
  "quiteABit",
  "aLot",
] as const;
