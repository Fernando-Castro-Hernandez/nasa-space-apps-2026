// Anima las partes de Lunito en cada cuadro. Junta dos capas:
// - Datos (motion.ts): la pancita late con el pulso, el cuerpo respira con la
//   HRV y las branquias brillan con el oxígeno.
// - Expresión (animator.ts): pose, gestos, vida de fondo y puntero, como
//   canales del rig (rig.ts) que aquí se vuelven rotaciones y shape keys.
// Funciona igual con el placeholder y con el GLB: solo necesita las partes.
// Nada se pinta encima del modelo: la pancita cambia de matiz al color del
// semáforo (hueShift.ts) y late en brillo; las branquias se aclaran u
// oscurecen sobre su propia textura.
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  Color,
  MathUtils,
  type Euler,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
  type Vector3,
} from "three";
import {
  createLunitoAnimator,
  type AnimatorInput,
  type LunitoAnimator,
} from "@/features/lunito/animator";
import { statusTint } from "@/features/lunito/hueShift";
import { lunitoVoice, restMouth } from "@/features/lunito/lunitoVoice";
import type { Motion } from "@/features/lunito/motion";
import { resolvePose, restingPose } from "@/features/lunito/poses";
import { neutralRig, type Rig } from "@/features/lunito/rig";
import { VISEMES } from "@/features/lunito/visemes";
import { STATUS_COLOR } from "@/domain/status";
import type { Status } from "@/domain/vitals";

export type LunitoGills = {
  /** −1 a la izquierda de la pantalla (L), 1 a la derecha (R). */
  side: number;
  /** Las branquias del lado juntas, con el origen dentro de la cabeza. */
  pivot: Object3D;
  /** Cada branquia: brilla con el oxígeno y ondea apenas por su cuenta. */
  fins: Mesh[];
};

export type LunitoParts = {
  /** Cuerpo entero: se ladea, salta y respira desde los pies. */
  body: Object3D | null;
  belly: Mesh | null;
  gills: LunitoGills[];
  eyes: Object3D[];
  /** Mallas de la boca con sus shape keys (LUNITO-ARTE.md §3). */
  mouth: Mesh[];
  armL: Object3D | null;
  armR: Object3D | null;
  tail: Object3D | null;
};

/** Quién decide la expresión. Sin director, Lunito queda en su pose de
 *  reposo según el semáforo y sigue la voz. */
export type LunitoDirector = {
  animator: LunitoAnimator;
  /** Se lee en cada cuadro: pose pedida, puntero y movimiento reducido. */
  input: () => AnimatorInput & { followVoice: boolean };
};

/**
 * El brazo es un relieve pegado al torso: al despegarlo se le ve el corte de
 * atrás. Arrimarlo hacia adentro mientras se mueve lo tapa con el propio
 * cuerpo, así que se arrima en proporción a lo que sube (hasta TUCK rad).
 */
const TUCK = 0.1;
const tuck = (raise: number, reach: number) =>
  -TUCK * Math.min(1, (Math.max(0, raise) + Math.max(0, reach)) / 0.25);

/** Altura (desde los pies) del punto alrededor del cual se ladea la cabeza. */
const TILT_HEIGHT = 0.9;

/** Cuánto se corren los ojos al mirar a un lado (unidades del modelo). */
const LOOK = { x: 0.007, y: 0.005 };

/** Vaivén de las branquias: cuánto se estiran y encogen las de cada lado
 *  (proporción) y cuánto gira cada una (radianes). Al separarlas del modelo
 *  de Meshy cada branquia se llevó trozos de sus vecinas y la cabeza se quedó
 *  con su raíz: girarlas más que esto abre grietas (se ve en /lunito). */
const GILL_SWAY = { side: 0.045, fin: 0.012 };

/** Mueve una shape key hacia `target`; sin `dt`, la fija de una vez. No hace
 *  nada si la malla no la tiene. */
function morph(mesh: Mesh, key: string, target: number, speed = 0, dt = 0) {
  const index = mesh.morphTargetDictionary?.[key];
  const weights = mesh.morphTargetInfluences;
  if (index === undefined || !weights) return false;
  weights[index] =
    speed > 0 ? MathUtils.damp(weights[index] ?? 0, target, speed, dt) : target;
  return true;
}

/** Color de la pancita en cada estado (Bien es su cian natural). */
const TINT: Record<Status, Color> = {
  verde: new Color(STATUS_COLOR.verde),
  ambar: new Color(STATUS_COLOR.ambar),
  rojo: new Color(STATUS_COLOR.rojo),
};

/** Pulso corto y nítido, como un latido, no un seno. */
const beatCurve = (phase: number) => Math.exp(-((phase * 6) ** 2));

/** Transformación original de la parte: se anima relativo a ella. */
const base = (o: Object3D) =>
  (o.userData.base ??= {
    scale: o.scale.clone(),
    position: o.position.clone(),
    rotation: o.rotation.clone(),
  }) as { scale: Vector3; position: Vector3; rotation: Euler };

/** Color original del material (blanco si tiene textura): se escala sobre él. */
const baseColor = (m: MeshStandardMaterial) =>
  (m.userData.baseColor ??= m.color.clone()) as Color;

/** Rota `o` sumando (x, y, z) a su rotación original. */
function rotate(o: Object3D | null, x: number, y: number, z: number) {
  if (!o) return;
  const r = base(o).rotation;
  o.rotation.set(r.x + x, r.y + y, r.z + z);
}

export function useLunitoMotion(
  getParts: () => LunitoParts,
  motion: Motion,
  status: Status,
  director?: LunitoDirector,
) {
  const fallback = useRef<LunitoAnimator | null>(null);
  const rigRef = useRef<Rig>(neutralRig());
  const mouthPose = useRef(restMouth());

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const parts = getParts();
    const input = director?.input() ?? {
      pose: restingPose(status),
      pointer: null,
      still: motion.idle === 0,
      followVoice: true,
    };
    const animator =
      director?.animator ??
      (fallback.current ??= createLunitoAnimator(input.pose));
    const rig = animator.step(
      dt,
      {
        ...input,
        pose: resolvePose(
          input.pose,
          lunitoVoice.activity(),
          input.followVoice,
        ),
      },
      rigRef.current,
    );
    applyRig(
      parts,
      rig,
      animator.phase,
      t,
      dt,
      motion,
      status,
      mouthPose.current,
    );
  });
}

function applyRig(
  { body, belly, gills, eyes, mouth, armL, armR, tail }: LunitoParts,
  rig: Rig,
  phase: number,
  t: number,
  dt: number,
  motion: Motion,
  status: Status,
  mouthPose: ReturnType<typeof restMouth>,
) {
  if (body) {
    // Respira (dato: HRV) y se estira o encoge con la pose, sin perder volumen.
    const breath =
      motion.breathDepth * Math.sin((t / motion.breathPeriod) * Math.PI * 2);
    const b = base(body);
    const tall = 1 + rig.stretch + breath;
    const wide = 1 - rig.stretch / 2 - breath / 2;
    body.scale.set(b.scale.x * wide, b.scale.y * tall, b.scale.z * wide);
    body.position.x = b.position.x - TILT_HEIGHT * Math.sin(rig.tilt);
    body.position.y = b.position.y + rig.lift;
    rotate(body, rig.pitch, rig.turn, -(rig.lean + rig.tilt));
  }

  if (belly) {
    // Late (dato: pulso) creciendo un poco y brillando con cada latido.
    const beatPhase = (t % motion.beatInterval) / motion.beatInterval;
    const beat = beatCurve(beatPhase);
    belly.scale
      .copy(base(belly).scale)
      .multiplyScalar(1 + motion.beatAmplitude * beat);
    const m = belly.material as MeshStandardMaterial;
    // El semáforo cambia de color en un instante corto, sin saltos (de una
    // vez con movimiento reducido).
    const tint = statusTint(m, TINT[status].clone());
    const k = motion.idle > 0 ? 1 - Math.exp(-4 * dt) : 1;
    const on = status === "verde" ? 0 : 1;
    tint.amount.value += (on - tint.amount.value) * k;
    if (on)
      tint.color.value.lerp(TINT[status], tint.amount.value < 0.05 ? 1 : k);
    m.color
      .copy(baseColor(m))
      .multiplyScalar(1 + 0.35 * beat * (motion.beatAmplitude > 0 ? 1 : 0));
  }

  for (const { side, pivot, fins } of gills) {
    // Ondean como en el agua, cada lado desfasado. Solo se recogen desde la
    // cabeza (estirarlas abre su raíz): con atención quedan plenas y quietas.
    const sin = (offset: number) =>
      Math.sin((phase * 0.26 + offset) * Math.PI * 2);
    const sway = GILL_SWAY.side * rig.gillWave * (0.5 + 0.5 * sin(side * 0.12));
    const b = base(pivot).scale;
    pivot.scale.set(b.x * (1 + Math.min(0, rig.gillPerk) - sway), b.y, b.z);
    fins.forEach((fin, i) => {
      // Oxígeno: branquias plenas o apagadas sobre su propia textura.
      const m = fin.material as MeshStandardMaterial;
      m.color.copy(baseColor(m)).multiplyScalar(0.55 + 0.5 * motion.gillGlow);
      rotate(
        fin,
        0,
        0,
        side * GILL_SWAY.fin * rig.gillWave * sin(0.3 + i * 0.2),
      );
    });
  }

  // Brazos: el origen está en el hombro (LUNITO-ARTE.md §5).
  const openL = rig.armLOpen + tuck(rig.armLRaise, rig.armLReach);
  const openR = rig.armROpen + tuck(rig.armRRaise, rig.armRReach);
  rotate(armL, -rig.armLReach, -openL, rig.armLRaise);
  rotate(armR, -rig.armRReach, openR, -rig.armRRaise);
  rotate(tail, rig.tailLift, -rig.tailSway, 0);

  eyes.forEach((e) => {
    const p = base(e).position;
    e.position.set(p.x + rig.lookX * LOOK.x, p.y + rig.lookY * LOOK.y, p.z);
    // El modelo trae el párpado como shape key; el placeholder se aplasta.
    if (!morph(e as Mesh, "eyeBlink", rig.blink))
      e.scale.y = base(e).scale.y * (1 - 0.85 * Math.max(rig.blink, rig.happy));
    morph(e as Mesh, "eyeHappy", rig.happy);
    morph(e as Mesh, "eyeWide", rig.wide);
  });

  // La boca sigue lo que Lunito dice; la pose le suma la expresión.
  if (mouth.length > 0) {
    const voice = lunitoVoice.mouth(mouthPose);
    let talking = 0;
    for (const key of VISEMES) talking += voice.visemes[key];
    for (const mesh of mouth) {
      for (const key of VISEMES) {
        const extra =
          key === "viseme_aa" ? rig.open : key === "viseme_O" ? rig.oh : 0;
        morph(mesh, key, Math.max(voice.visemes[key], extra), 22, dt);
      }
      morph(mesh, "mouthSmile", rig.smile * (1 - Math.min(1, talking) * 0.5));
      morph(mesh, "mouthPucker", Math.max(rig.pucker, voice.pucker), 8, dt);
    }
  }
}
