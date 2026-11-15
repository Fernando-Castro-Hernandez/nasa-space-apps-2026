// El "esqueleto" de Lunito en números: cada canal es un movimiento de una
// parte del modelo (LUNITO-ARTE.md §2). Las poses, los gestos y la vida de
// fondo escriben canales; `useLunitoMotion` los convierte en rotaciones y
// shape keys. Función pura: no sabe de three.js.
//
// Convenciones: ángulos en radianes, distancias en unidades del modelo (mide 2
// de alto) y formas de 0 a 1. L es −X, a la izquierda de la pantalla.

export const RIG_CHANNELS = [
  // Cuerpo entero, con el pivote entre los pies.
  /** Se inclina entero desde los pies: + lleva la cabeza a la derecha de la
   *  pantalla. */
  "lean",
  /** Ladea la cabeza: gira desde la pancita (el modelo no tiene cuello), así
   *  la cabeza casi no se corre y los pies se acomodan. + a la derecha. */
  "tilt",
  /** Se inclina: + hacia la cámara. */
  "pitch",
  /** Gira: + mira hacia la derecha de la pantalla. */
  "turn",
  /** Sube del piso (saltito). */
  "lift",
  /** + estira, − encoge; conserva el volumen. */
  "stretch",

  // Brazos. Los dos usan el mismo sentido: + sube la mano.
  /** Sube la mano por el costado, en el plano de la cara. */
  "armLRaise",
  "armRRaise",
  /** Lleva la mano hacia adelante y arriba, despegándola de la pancita. */
  "armLReach",
  "armRReach",
  /** Abre el brazo hacia afuera. */
  "armLOpen",
  "armROpen",

  /** Cola: + se mece hacia la derecha de la pantalla. */
  "tailSway",
  /** Cola: + la levanta. */
  "tailLift",

  /** Branquias: + se estiran hacia afuera (atención), − se recogen. Es una
   *  proporción: 0.1 = 10 % más largas. */
  "gillPerk",
  /** Amplitud con que ondean (multiplica la vida de fondo). */
  "gillWave",

  /** Ojos: shape keys (eyeBlink y eyeHappy no se suman). */
  "blink",
  "happy",
  "wide",
  /** Mirada: corre los ojos un poco (+ derecha, + arriba). */
  "lookX",
  "lookY",

  /** Boca: expresiones que se suman a lo que dice. */
  "smile",
  "pucker",
  /** Boca abierta de alegría (viseme_aa) y de "oh" (viseme_O). */
  "open",
  "oh",

  /** Vida de fondo: cuánto se mece (0 a 1) y a qué ritmo (1 = normal). */
  "energy",
  "tempo",
] as const;

export type RigChannel = (typeof RIG_CHANNELS)[number];
export type Rig = Record<RigChannel, number>;

/** Formas y factores: de 0 a 1. */
const UNIT: [number, number] = [0, 1];

/**
 * Hasta dónde llega cada canal. Los de las partes salen de mirar el modelo en
 * el banco del rig (/lunito): más allá se ve el corte del brazo (es un relieve
 * pegado al torso), el parche pintado debajo, las grietas en la raíz de las
 * branquias o el hueco detrás de los ojos.
 */
export const RIG_LIMITS: Partial<Record<RigChannel, [number, number]>> = {
  lean: [-0.2, 0.2],
  tilt: [-0.2, 0.2],
  pitch: [-0.12, 0.15],
  turn: [-0.4, 0.4],
  lift: [-0.03, 0.2],
  stretch: [-0.1, 0.1],
  // Subir la mano funciona si a la vez se adelanta (Reach): así el brazo
  // tapa su propio corte. Abrirlo hacia afuera lo deja ver enseguida.
  armLRaise: [-0.12, 1],
  armRRaise: [-0.12, 1],
  armLReach: [-0.08, 0.55],
  armRReach: [-0.08, 0.55],
  armLOpen: [-0.12, 0.06],
  armROpen: [-0.12, 0.06],
  // Las branquias solo se recogen: estirarlas abre su raíz.
  gillPerk: [-0.12, 0],
  lookX: [-1, 1],
  lookY: [-1, 1],
  blink: UNIT,
  happy: UNIT,
  wide: UNIT,
  smile: UNIT,
  pucker: UNIT,
  open: UNIT,
  oh: UNIT,
  gillWave: UNIT,
  energy: UNIT,
  tempo: [0.2, 2.5],
};

export const neutralRig = (): Rig =>
  Object.fromEntries(RIG_CHANNELS.map((c) => [c, 0])) as Rig;

export function copyRig(from: Rig, out: Rig): Rig {
  for (const c of RIG_CHANNELS) out[c] = from[c];
  return out;
}

/** `out += k · add`, solo con los canales que trae `add`. */
export function addRig(out: Rig, add: Partial<Rig>, k = 1): Rig {
  for (const key in add) {
    const c = key as RigChannel;
    out[c] += (add[c] ?? 0) * k;
  }
  return out;
}

/** Lleva los canales que trae `to` hacia sus valores, en proporción `k`
 *  (0 = no cambia, 1 = queda igual a `to`). */
export function mixRig(out: Rig, to: Partial<Rig>, k: number): Rig {
  for (const key in to) {
    const c = key as RigChannel;
    out[c] += ((to[c] ?? 0) - out[c]) * k;
  }
  return out;
}

/** Deja cada canal dentro de sus límites, y `blink` y `happy` sin sumarse
 *  (LUNITO-ARTE.md §4). */
export function settleRig(rig: Rig): Rig {
  for (const key in RIG_LIMITS) {
    const c = key as RigChannel;
    const [min, max] = RIG_LIMITS[c]!;
    rig[c] = Math.min(max, Math.max(min, rig[c]));
  }
  rig.blink = Math.min(rig.blink, 1 - rig.happy);
  return rig;
}
