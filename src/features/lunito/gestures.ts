// Gestos de una vez: se disparan, duran poco y vuelven a la pose. Cada gesto
// lleva algunas partes a una posición (`set`: subir la mano, cerrar los ojos
// de gusto) y le suma movimiento a otras (`add`: asentir, saltar, sacudirse).
// Entran y salen con una envolvente suave, así que nunca dan saltos.
// Función pura: no sabe de three.js.
import { addRig, mixRig, type Rig } from "./rig";

export const LUNITO_GESTURES = ["wave", "nod", "cheer", "giggle"] as const;
export type LunitoGesture = (typeof LUNITO_GESTURES)[number];

/** Segundos que dura cada gesto. */
export const GESTURE_DURATION: Record<LunitoGesture, number> = {
  wave: 1.8,
  nod: 1.1,
  cheer: 1.3,
  giggle: 1.1,
};

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/** Entra en `attack` y sale en `release` (fracciones del gesto). */
export const envelope = (p: number, attack = 0.2, release = 0.28) =>
  Math.min(smooth(p / attack), smooth((1 - p) / release));

const wave = (p: number, cycles: number) => Math.sin(p * cycles * Math.PI * 2);

type Shape = { set?: Partial<Rig>; add?: Partial<Rig> };

/** Lo que hace cada gesto en `p` (de 0 a 1), antes de la envolvente. */
const SHAPES: Record<LunitoGesture, (p: number) => Shape> = {
  // Sube la mano junto a la cara y la agita tres veces.
  wave: (p) => ({
    set: {
      armLRaise: 0.55 + 0.13 * wave(p, 3),
      armLReach: 0.26 + 0.05 * wave(p + 0.05, 3),
      smile: 0.35,
    },
    add: { tilt: 0.04 },
  }),
  // Dos "sí" con la cabeza, con los ojos felices.
  nod: (p) => ({
    set: { happy: 1, smile: 0.3 },
    add: {
      pitch: 0.13 * Math.max(0, wave(p, 2)),
      lift: -0.008 * Math.max(0, wave(p, 2)),
    },
  }),
  // ¡Bien! Brazos arriba y un saltito, agachándose antes de despegar.
  cheer: (p) => {
    const jump = Math.sin(smooth((p - 0.25) / 0.45) * Math.PI);
    const crouch = p < 0.3 ? Math.sin((p / 0.3) * Math.PI) : 0;
    return {
      set: {
        armLRaise: 0.46,
        armRRaise: 0.46,
        armLReach: 0.3,
        armRReach: 0.3,
        happy: 1,
        smile: 0.7,
        open: 0.3,
        gillPerk: 0,
      },
      add: { lift: 0.14 * jump, stretch: 0.06 * jump - 0.05 * crouch },
    };
  },
  // Risita: se sacude, encoge los hombros y cierra los ojos de gusto.
  giggle: (p) => ({
    set: {
      happy: 1,
      smile: 0.6,
      open: 0.15,
      armLRaise: 0.2,
      armRRaise: 0.2,
      armLReach: 0.15,
      armRReach: 0.15,
    },
    add: {
      tilt: 0.05 * wave(p, 4),
      stretch: -0.03 * Math.abs(wave(p, 4)),
      tailSway: 0.3 * wave(p, 3),
    },
  }),
};

/**
 * Aplica el gesto a `out` a `elapsed` segundos de haber empezado, con fuerza
 * `weight`. Antes de empezar y después de terminar no cambia nada.
 */
export function applyGesture(
  gesture: LunitoGesture,
  elapsed: number,
  weight: number,
  out: Rig,
): Rig {
  const p = elapsed / GESTURE_DURATION[gesture];
  if (p <= 0 || p >= 1 || weight <= 0) return out;
  const k = envelope(p) * weight;
  const { set = {}, add = {} } = SHAPES[gesture](p);
  mixRig(out, set, k);
  return addRig(out, add, k);
}
