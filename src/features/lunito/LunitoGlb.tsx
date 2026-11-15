// Carga el Lunito real (public/lunito.glb) y lo anima por código: 14 partes
// con nombre, cada una con su origen propio (contrato en LUNITO-ARTE.md §2).
// Cada instancia trabaja sobre su propia copia (lunitoModel.ts).
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import type { Mesh, Material } from "three";
import { prepareLunito } from "@/features/lunito/lunitoModel";
import type { Motion } from "@/features/lunito/motion";
import {
  type LunitoDirector,
  useLunitoMotion,
} from "@/features/lunito/useLunitoMotion";
import type { Status } from "@/domain/vitals";

export const LUNITO_MODEL_URL = "/lunito.glb";

/** El modelo mide 2 unidades de alto; se escala para llenar la escena. */
export const GLB_SCALE = 1.35;
export const GLB_OFFSET_Y = -0.1;

type Props = {
  motion: Motion;
  status: Status;
  /** Pose, gestos y puntero; sin él, Lunito reposa según el semáforo. */
  director?: LunitoDirector;
  scale?: number;
  offsetY?: number;
};

export function LunitoGlb({
  motion,
  status,
  director,
  scale = GLB_SCALE,
  offsetY = GLB_OFFSET_Y,
}: Props) {
  const { scene } = useGLTF(LUNITO_MODEL_URL);
  const { root, parts } = useMemo(() => prepareLunito(scene), [scene]);

  // Los materiales son copias de esta instancia: se liberan al desmontar.
  useEffect(
    () => () =>
      root.traverse((o) => {
        if ((o as Mesh).isMesh) ((o as Mesh).material as Material).dispose();
      }),
    [root],
  );

  useLunitoMotion(() => parts, motion, status, director);

  return <primitive object={root} scale={scale} position={[0, offsetY, 0]} />;
}
