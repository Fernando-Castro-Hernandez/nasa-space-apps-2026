// El "director" de Lunito: junta en cada cuadro la pose (con transición
// suave al cambiarla), los gestos de una vez, la vida de fondo (mecerse,
// parpadear, mover la cola) y el puntero. Devuelve los canales del rig.
// Sin three.js ni React: se prueba con un reloj falso.
import { applyGesture, GESTURE_DURATION, type LunitoGesture } from "./gestures";
import {
  addPoseLoop,
  LUNITO_POSES,
  POSE_TARGETS,
  type LunitoPose,
} from "./poses";
import { addRig, neutralRig, settleRig, type Rig } from "./rig";

export type AnimatorInput = {
  pose: LunitoPose;
  /** Puntero sobre Lunito, de −1 a 1 desde el centro (y + arriba); null si
   *  no hay. */
  pointer: { x: number; y: number } | null;
  /** Pose quieta, sin vida de fondo, gestos ni transiciones
   *  (prefers-reduced-motion). */
  still: boolean;
};

export type LunitoAnimator = {
  /** Dispara un gesto; si ya hay otro, el anterior se desvanece. */
  play(gesture: LunitoGesture): void;
  /** Avanza `dt` segundos y escribe los canales en `out`. */
  step(dt: number, input: AnimatorInput, out: Rig): Rig;
  /** Reloj de la vida de fondo (sigue el ritmo de la pose). */
  readonly phase: number;
};

/** Segundos que tarda en pasar de una pose a otra. */
export const POSE_BLEND = 0.6;
/** Segundos que tarda un gesto interrumpido en desvanecerse. */
export const GESTURE_FADE = 0.25;
/** Un cuadro muy largo (pestaña dormida) no debe hacer saltar nada. */
const MAX_DT = 0.1;

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/** Cerrar rápido, sostener un instante y abrir más despacio. */
export function blinkCurve(s: number): number {
  if (s < 0 || s > 0.24) return 0;
  if (s < 0.07) return s / 0.07;
  if (s < 0.11) return 1;
  return 1 - (s - 0.11) / 0.13;
}

type Playing = { gesture: LunitoGesture; start: number; fadeAt?: number };

export function createLunitoAnimator(
  initial: LunitoPose,
  random: () => number = Math.random,
): LunitoAnimator {
  let t = 0;
  let phase = 0;
  let target = initial;
  let progress = 1;
  const weights = Object.fromEntries(
    LUNITO_POSES.map((p) => [p, p === initial ? 1 : 0]),
  ) as Record<LunitoPose, number>;
  const from = { ...weights };
  let playing: Playing[] = [];
  let nextBlink = 1.5 + random() * 2;
  const blinks: number[] = [];
  const pointer = { x: 0, y: 0 };

  const blink = (at: number) => blinks.push(at);

  function blendPoses(dt: number, input: AnimatorInput, out: Rig) {
    if (input.pose !== target) {
      Object.assign(from, weights);
      target = input.pose;
      progress = 0;
      // Cambiar de pose con un parpadeo se ve natural.
      if (!input.still) blink(t);
    }
    progress = input.still ? 1 : Math.min(1, progress + dt / POSE_BLEND);
    const k = smooth(progress);
    for (const p of LUNITO_POSES) {
      weights[p] = from[p] * (1 - k) + (p === target ? k : 0);
      if (weights[p] < 1e-4) continue;
      addRig(out, POSE_TARGETS[p], weights[p]);
      if (!input.still) addPoseLoop(p, t, weights[p], out);
    }
  }

  const s = (hz: number, offset = 0) =>
    Math.sin((phase * hz + offset) * Math.PI * 2);

  /** Mecerse, flotar y mover la cola, según la energía de la pose. */
  function addLife(out: Rig) {
    addRig(
      out,
      {
        lift: 0.02 * s(0.13),
        turn: 0.09 * s(0.055),
        lean: 0.025 * s(0.095, 0.3),
        tailSway: 0.25 * s(0.18),
        tailLift: 0.05 * s(0.09, 0.5),
        armLRaise: 0.045 * s(0.13, 0.1),
        armRRaise: 0.045 * s(0.13, 0.35),
      },
      out.energy,
    );
  }

  function addBlinks(out: Rig) {
    if (t >= nextBlink) {
      blink(t);
      // A veces dos seguidos, como cualquiera.
      if (random() < 0.2) blink(t + 0.3);
      nextBlink = t + 2.6 + random() * 3;
    }
    for (const at of blinks)
      out.blink = Math.max(out.blink, blinkCurve(t - at));
    while (blinks.length > 0 && t - blinks[0]! > 0.3) blinks.shift();
  }

  function addGestures(out: Rig) {
    playing = playing.filter(
      (g) =>
        t - g.start < GESTURE_DURATION[g.gesture] &&
        (g.fadeAt === undefined || t - g.fadeAt < GESTURE_FADE),
    );
    for (const g of playing) {
      const fade =
        g.fadeAt === undefined ? 1 : 1 - smooth((t - g.fadeAt) / GESTURE_FADE);
      applyGesture(g.gesture, t - g.start, fade, out);
    }
  }

  /** Gira un poco hacia donde está el puntero y lo sigue con la mirada. */
  function addPointer(dt: number, goal: AnimatorInput["pointer"], out: Rig) {
    const k = 1 - Math.exp(-5 * dt);
    pointer.x += ((goal?.x ?? 0) - pointer.x) * k;
    pointer.y += ((goal?.y ?? 0) - pointer.y) * k;
    addRig(out, {
      turn: 0.2 * pointer.x,
      lean: 0.03 * pointer.x,
      pitch: -0.05 * pointer.y,
      lookX: 0.6 * pointer.x,
      lookY: 0.5 * pointer.y,
    });
  }

  return {
    get phase() {
      return phase;
    },
    play(gesture) {
      // Repetir el mismo gesto mientras empieza no lo reinicia.
      const same = playing.find(
        (g) => g.gesture === gesture && g.fadeAt === undefined,
      );
      if (same && t - same.start < GESTURE_DURATION[gesture] / 2) return;
      for (const g of playing) g.fadeAt ??= t;
      playing.push({ gesture, start: t });
    },
    step(rawDt, input, out) {
      const dt = Math.min(Math.max(rawDt, 0), MAX_DT);
      t += dt;
      Object.assign(out, neutralRig());
      blendPoses(dt, input, out);
      if (input.still) {
        playing = [];
        return settleRig(out);
      }
      phase += dt * Math.max(0.2, out.tempo);
      addLife(out);
      addBlinks(out);
      addGestures(out);
      addPointer(dt, input.pointer, out);
      return settleRig(out);
    },
  };
}
