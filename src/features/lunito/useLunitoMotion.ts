// Anima las partes de Lunito en cada frame. Funciona igual con el placeholder
// y con el GLB de Meshy: solo necesita las partes por nombre.
// Nada se pinta encima del modelo: la pancita gira su tono y late en brillo,
// las branquias se aclaran u oscurecen sobre su propia textura.
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type {
  Color,
  Euler,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";
import { hueShiftUniform } from "@/features/lunito/hueShift";
import type { Motion } from "@/features/lunito/motion";
import { BELLY_HUE_SHIFT } from "@/domain/status";
import type { Status } from "@/domain/vitals";

export type LunitoParts = {
  body: Object3D | null;
  belly: Mesh | null;
  gills: Mesh[];
  eyes: Object3D[];
};

const DEG = Math.PI / 180;

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

export function useLunitoMotion(
  getParts: () => LunitoParts,
  motion: Motion,
  status: Status,
) {
  const blinkAt = useRef(2);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const { body, belly, gills, eyes } = getParts();
    const idle = motion.idle;

    if (body) {
      // Respira (dato: HRV) y, en reposo, flota y se balancea suave.
      const breath = Math.sin((t / motion.breathPeriod) * Math.PI * 2);
      const b = base(body);
      body.scale.set(
        b.scale.x * (1 - motion.breathDepth * breath * 0.5),
        b.scale.y * (1 + motion.breathDepth * breath),
        b.scale.z * (1 - motion.breathDepth * breath * 0.5),
      );
      body.position.y = b.position.y + Math.sin(t * 0.8) * 0.05 * idle;
      body.rotation.y = b.rotation.y + Math.sin(t * 0.35) * 0.14 * idle;
      body.rotation.z = b.rotation.z + Math.sin(t * 0.6) * 0.03 * idle;
    }

    if (belly) {
      // Late (dato: pulso) creciendo un poco y brillando con cada latido.
      const phase = (t % motion.beatInterval) / motion.beatInterval;
      const beat = beatCurve(phase);
      belly.scale
        .copy(base(belly).scale)
        .multiplyScalar(1 + motion.beatAmplitude * beat);
      const m = belly.material as MeshStandardMaterial;
      hueShiftUniform(m).value = BELLY_HUE_SHIFT[status] * DEG;
      m.color
        .copy(baseColor(m))
        .multiplyScalar(1 + 0.35 * beat * (motion.beatAmplitude > 0 ? 1 : 0));
    }

    gills.forEach((g, i) => {
      // Oxígeno: branquias plenas o apagadas sobre su propia textura.
      const m = g.material as MeshStandardMaterial;
      m.color.copy(baseColor(m)).multiplyScalar(0.55 + 0.5 * motion.gillGlow);
      // Ondean como en el agua, cada una desfasada.
      g.rotation.z =
        base(g).rotation.z + Math.sin(t * 1.6 + i * 0.9) * 0.08 * idle;
    });

    // Parpadeo cada 3 a 5 s. Solo vínculo, no es un dato.
    if (t > blinkAt.current) {
      blinkAt.current = t + 3 + Math.random() * 2;
    }
    const closing = blinkAt.current - t < 0.12;
    eyes.forEach((e) => (e.scale.y = base(e).scale.y * (closing ? 0.15 : 1)));
  });
}
