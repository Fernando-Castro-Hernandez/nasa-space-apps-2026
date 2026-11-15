// Simulación del sensor del check-in para la demo: cuenta regresiva y lecturas
// del MAX30102 que se estabilizan en la lectura del día, la misma que muestra
// Inicio (useLunitoDashboard). Así el sensor no contradice al resultado.
export const SENSOR_SECONDS = 60;

/** Segundos restantes de una cuenta regresiva, nunca negativos. */
export const secondsLeft = (elapsed: number, total: number) =>
  Math.max(0, total - Math.floor(elapsed));

export type SensorTarget = { bpm: number; spo2: number };

/** Pulso y SpO2 en vivo: oscilan al principio y convergen a `target`. */
export function liveVitals(elapsed: number, target: SensorTarget) {
  const settle = Math.max(0, 1 - elapsed / 20);
  return {
    bpm: Math.round(target.bpm + Math.sin(elapsed * 1.7) * 6 * settle),
    spo2: Math.min(
      100,
      Math.round(target.spo2 - Math.abs(Math.sin(elapsed)) * 2 * settle),
    ),
  };
}
