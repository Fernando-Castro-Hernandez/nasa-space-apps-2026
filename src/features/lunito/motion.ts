// Convierte una lectura en lo que Lunito hace con su cuerpo. Cada dato sale de
// una parte que tiene sentido biológico: la pancita late (pulso), las branquias
// brillan (oxígeno, un ajolote respira por ellas) y el cuerpo se mece (HRV).
import type { Baseline, Reading } from "@/domain/vitals";

export type Motion = {
  /** Segundos entre latidos. */
  beatInterval: number;
  /** Cuánto crece la pancita al latir (0 = quieta). */
  beatAmplitude: number;
  /** Brillo de las branquias, de 0 a 1. */
  gillGlow: number;
  /** Cuánto sube y baja el cuerpo al respirar. */
  breathDepth: number;
  /** Segundos por respiración: corto es tenso, largo es calmo. */
  breathPeriod: number;
  /** Vida de reposo (flotar, balancearse, ondear branquias): 0 o 1. */
  idle: number;
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export type MotionOptions = {
  /** "live" durante el check-in; "rest" muestra la última lectura, más calmo. */
  mode: "live" | "rest";
  reducedMotion?: boolean;
};

/**
 * Sin lectura que mostrar: respira tranquilo y la pancita no late, porque un
 * latido sin dato sería un pulso inventado.
 */
export const calmMotion = (reducedMotion = false): Motion => ({
  beatInterval: 1,
  beatAmplitude: 0,
  gillGlow: 1,
  breathDepth: reducedMotion ? 0 : 0.025,
  breathPeriod: 4.5,
  idle: reducedMotion ? 0 : 1,
});

export function motionFor(
  r: Reading,
  b: Baseline,
  { mode, reducedMotion = false }: MotionOptions,
): Motion {
  // Oxígeno: 100 % branquias llenas, 90 % casi apagadas.
  const gillGlow = clamp((r.spo2 - 90) / 10, 0.15, 1);
  // HRV relativo a tu normal: bajo = respiración corta y poco profunda.
  const hrvRatio = clamp(r.hrv / b.hrv.mean, 0.4, 1.2);
  const breathPeriod = 2.5 + hrvRatio * 2.5;
  const breathDepth = 0.01 + hrvRatio * 0.03;
  const calm = mode === "rest" ? 0.5 : 1;
  const still = reducedMotion ? 0 : 1;
  return {
    beatInterval: 60 / clamp(r.bpm, 30, 220),
    beatAmplitude: 0.06 * calm * still,
    gillGlow,
    breathDepth: breathDepth * calm * still,
    breathPeriod,
    idle: still,
  };
}
