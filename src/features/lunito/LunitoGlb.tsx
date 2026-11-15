// Carga el Lunito real (public/lunito.glb), generado desde el modelo de Meshy
// y separado en partes con nombre: body, belly, gill_L_1..3, gill_R_1..3,
// eye_L, eye_R. Cada parte tiene su origen en su centro para animarla.
import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Mesh, MeshStandardMaterial } from "three";
import type { Motion } from "@/features/lunito/motion";
import {
  type LunitoParts,
  useLunitoMotion,
} from "@/features/lunito/useLunitoMotion";
import type { Status } from "@/domain/vitals";

export const LUNITO_MODEL_URL = "/lunito.glb";

/** El modelo mide 2 unidades de alto; se escala para llenar la escena. */
export const GLB_SCALE = 1.35;
export const GLB_OFFSET_Y = -0.1;

type Props = { motion: Motion; status: Status };

export function LunitoGlb({ motion, status }: Props) {
  const { scene } = useGLTF(LUNITO_MODEL_URL);

  const parts = useMemo<LunitoParts>(() => {
    const mesh = (name: string) => {
      const m = scene.getObjectByName(name) as Mesh | null;
      // Material propio por parte: el semáforo y el brillo no deben
      // contagiarse al resto del cuerpo.
      if (m) m.material = (m.material as MeshStandardMaterial).clone();
      return m;
    };
    const many = (names: string[]) =>
      names.map(mesh).filter((m): m is Mesh => m !== null);
    // La pancita conserva su textura; el semáforo gira su tono (hueShift.ts).
    const belly = mesh("belly");
    return {
      // La respiración mueve el modelo entero; las partes tienen origen propio.
      body: scene,
      belly,
      gills: many(
        ["L", "R"].flatMap((s) => [1, 2, 3].map((i) => `gill_${s}_${i}`)),
      ),
      eyes: many(["eye_L", "eye_R"]),
    };
  }, [scene]);

  useLunitoMotion(() => parts, motion, status);

  return (
    <primitive
      object={scene}
      scale={GLB_SCALE}
      position={[0, GLB_OFFSET_Y, 0]}
    />
  );
}
