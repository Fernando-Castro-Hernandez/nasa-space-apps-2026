// Poses sostenidas de Lunito: qué hace cada parte mientras dura un momento de
// la app (saludar, preguntar, escuchar...). La expresión la deciden estas
// reglas fijas, nunca la IA (LUNITO-ARTE.md §10). No hay poses tristes ni
// enojadas: cuando la persona está mal, Lunito la cuida (SISTEMA.md §1).
// Función pura: no sabe de three.js.
import type { Status } from "@/domain/vitals";
import type { LunitoActivity } from "./lunitoVoice";
import { addRig, type Rig } from "./rig";

export const LUNITO_POSES = [
  "idle",
  "greeting",
  "asking",
  "listening",
  "thinking",
  "speaking",
  "celebrating",
  "caring",
] as const;
export type LunitoPose = (typeof LUNITO_POSES)[number];

// Valores en radianes, proporciones y formas de 0 a 1 (rig.ts). Las manos
// siempre suben adelantándose (Raise con Reach) para tapar el corte del brazo
// y no pasan de la mejilla, para no tapar los ojos; las branquias solo se
// recogen. Los ojos felices van completos o nada: a medias se ven con sueño.
// Los límites están en RIG_LIMITS.

/** Vida de fondo normal: se mece, ondea las branquias y respira. */
const ALIVE: Partial<Rig> = { energy: 1, tempo: 1, gillWave: 1 };

/** Objetivo de cada parte en cada pose (lo que no aparece queda en 0). */
export const POSE_TARGETS: Record<LunitoPose, Partial<Rig>> = {
  // Tranquilo, con su sonrisa cerrada, como en las imágenes.
  idle: { ...ALIVE, smile: 0.1, gillPerk: -0.02 },
  // Como la imagen de saludo: la mano de la izquierda arriba, junto a la
  // cara, y la cabeza apenas ladeada hacia el otro lado.
  greeting: {
    ...ALIVE,
    armLRaise: 0.55,
    armLReach: 0.26,
    tilt: 0.05,
    smile: 0.3,
    gillWave: 0.8,
  },
  // De frente, atento: ojos abiertos, se acerca un poco, manos al pecho.
  asking: {
    ...ALIVE,
    energy: 0.6,
    pitch: 0.04,
    wide: 0.35,
    smile: 0.15,
    armLRaise: 0.1,
    armRRaise: 0.1,
    armLReach: 0.1,
    armRReach: 0.1,
    gillWave: 0.4,
  },
  // Como la imagen de escucha: cabeza ladeada, una mano arriba, branquias
  // estiradas y quietas.
  listening: {
    ...ALIVE,
    energy: 0.5,
    tempo: 0.8,
    tilt: -0.13,
    turn: 0.05,
    armLRaise: 0.5,
    armLReach: 0.26,
    wide: 0.2,
    smile: 0.15,
    gillWave: 0.3,
  },
  // "Mmm": boca fruncida, mirada arriba a un lado y la mano a la barbilla.
  thinking: {
    ...ALIVE,
    energy: 0.5,
    tempo: 0.7,
    tilt: 0.06,
    turn: -0.14,
    pitch: -0.03,
    lookX: -0.7,
    lookY: 0.7,
    pucker: 0.75,
    armRRaise: 0.36,
    armRReach: 0.34,
    gillPerk: -0.03,
  },
  // Habla: la boca la mueve la voz; las manos acompañan (addPoseLoop).
  speaking: {
    ...ALIVE,
    energy: 0.8,
    tempo: 1.1,
    smile: 0.15,
    wide: 0.1,
    gillWave: 0.7,
  },
  // ¡Bien! Brazos arriba, ojos felices, boca abierta y saltitos.
  celebrating: {
    ...ALIVE,
    tempo: 1.5,
    armLRaise: 0.46,
    armRRaise: 0.46,
    armLReach: 0.3,
    armRReach: 0.3,
    happy: 1,
    smile: 0.7,
    open: 0.3,
    tailLift: 0.25,
  },
  // Precaución o Atención: Lunito cuida. Calma, se inclina hacia la persona,
  // sonrisa suave y ojos atentos. Nunca triste.
  caring: {
    ...ALIVE,
    energy: 0.4,
    tempo: 0.65,
    pitch: 0.05,
    tilt: 0.07,
    smile: 0.2,
    wide: 0.12,
    armLRaise: 0.06,
    armRRaise: 0.06,
    armLReach: 0.08,
    armRReach: 0.08,
    gillPerk: -0.04,
    gillWave: 0.6,
  },
};

const wave = (t: number, hz: number) => Math.sin(t * hz * Math.PI * 2);

/**
 * Movimiento que se repite mientras dura la pose (saludar con la mano, saltar
 * de alegría, acompañar con las manos al hablar). Suma `k ·` el movimiento en
 * el instante `t` (segundos de vida de Lunito).
 */
export function addPoseLoop(
  pose: LunitoPose,
  t: number,
  k: number,
  out: Rig,
): Rig {
  if (k <= 0) return out;
  switch (pose) {
    case "greeting":
      // La mano va y viene en un arco corto, sin abrir el brazo.
      return addRig(
        out,
        {
          armLRaise: 0.12 * wave(t, 1.5),
          armLReach: 0.05 * wave(t + 0.15, 1.5),
          tilt: 0.012 * wave(t, 1.5),
        },
        k,
      );
    case "celebrating": {
      // Saltitos con los brazos arriba; se encoge justo antes de despegar.
      const up = wave(t, 1.2);
      const hop = Math.max(0, up);
      return addRig(
        out,
        {
          lift: 0.11 * hop * hop,
          stretch: 0.05 * hop - 0.04 * Math.max(0, -up),
          armLRaise: 0.12 * wave(t, 2.4),
          armRRaise: 0.12 * wave(t + 0.2, 2.4),
          tailSway: 0.35 * wave(t, 2.4),
        },
        k,
      );
    }
    case "speaking":
      // Manos que acompañan, sin ritmo fijo para que no parezca robot.
      return addRig(
        out,
        {
          armLRaise: 0.2 * Math.max(0, wave(t, 0.7) * wave(t, 0.31)),
          armLReach: 0.12 * Math.max(0, wave(t, 0.7) * wave(t, 0.31)),
          armRRaise: 0.2 * Math.max(0, wave(t + 0.9, 0.53) * wave(t, 0.23)),
          armRReach: 0.12 * Math.max(0, wave(t + 0.9, 0.53) * wave(t, 0.23)),
          pitch: 0.02 * wave(t, 1.1),
          lean: 0.02 * wave(t, 0.37),
        },
        k,
      );
    case "thinking":
      // Ladea la cabeza despacio de un lado al otro.
      return addRig(out, { tilt: 0.035 * wave(t, 0.25) }, k);
    case "listening":
      // Asiente apenas, como quien sigue lo que le cuentan.
      return addRig(
        out,
        { pitch: 0.02 * wave(t, 0.45), tilt: 0.015 * wave(t, 0.22) },
        k,
      );
    default:
      return out;
  }
}

/** Pose de reposo según el semáforo: con Precaución o Atención, Lunito cuida. */
export const restingPose = (status: Status): LunitoPose =>
  status === "verde" ? "idle" : "caring";

/** Poses que ya son un gesto: se sostienen mientras habla (saluda diciendo
 *  "hola", festeja diciendo "¡bien!"). La boca sigue la voz igual. */
const KEEP_WHILE_SPEAKING: readonly LunitoPose[] = ["greeting", "celebrating"];

/**
 * Pose que se ve: si Lunito está pensando una respuesta o hablando, eso manda
 * (a menos que la pantalla pida lo contrario con `followVoice`). La boca
 * sigue la voz siempre, sea cual sea la pose.
 */
export function resolvePose(
  pose: LunitoPose,
  activity: LunitoActivity,
  followVoice: boolean,
): LunitoPose {
  if (!followVoice || activity === "idle") return pose;
  if (activity === "speaking" && KEEP_WHILE_SPEAKING.includes(pose))
    return pose;
  return activity;
}
