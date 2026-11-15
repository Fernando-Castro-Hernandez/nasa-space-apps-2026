// Prepara una copia de public/lunito.glb para animarla (contrato en
// LUNITO-ARTE.md §2). El GLB no trae esqueleto: cada parte gira alrededor de
// su origen. Aquí solo se agregan pivotes en tiempo de ejecución, sin tocar el
// archivo: el cuerpo se ladea desde los pies y las branquias de cada lado
// desde la cabeza.
import {
  Box3,
  BufferGeometry,
  Group,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
  Vector3,
} from "three";
import type { LunitoParts } from "./useLunitoMotion";

/** Material propio y limpio: el semáforo y el brillo no se contagian a otras
 *  partes ni a otra copia de Lunito en la misma pantalla. */
function ownMaterial(mesh: Mesh) {
  const material = (mesh.material as MeshStandardMaterial).clone();
  material.userData = {};
  mesh.material = material;
  return material;
}

/** Separación extra entre el párpado cerrado y el ojo (unidades del modelo). */
const LID_GAP = 0.004;

const fixedEyes = new WeakMap<BufferGeometry, BufferGeometry>();

/**
 * El párpado (eyeBlink, eyeHappy) es una copia del ojo plegada bajo su borde
 * de arriba (LUNITO-ARTE.md §4). El GLB trae las normales del párpado
 * plegado, así que cerrado se ve a manchas, y queda tan pegado al ojo que el
 * ojo se asoma a través. Aquí, solo en memoria: el párpado y su línea toman
 * las normales de la forma cerrada y se separan un poco más del ojo.
 */
function fixEyelids(eye: Mesh) {
  const source = eye.geometry;
  let geometry = fixedEyes.get(source);
  if (!geometry) {
    geometry = source.clone();
    const blink = eye.morphTargetDictionary?.eyeBlink;
    const moves = geometry.morphAttributes.position;
    if (blink !== undefined && moves?.[blink]) {
      const position = geometry.getAttribute("position");
      const normal = geometry.getAttribute("normal");
      const closed = new BufferGeometry();
      closed.setIndex(geometry.getIndex());
      const shut = position.clone();
      const move = moves[blink]!;
      for (let i = 0; i < shut.count; i++)
        shut.setXYZ(
          i,
          shut.getX(i) + move.getX(i),
          shut.getY(i) + move.getY(i),
          shut.getZ(i) + move.getZ(i),
        );
      closed.setAttribute("position", shut);
      closed.computeVertexNormals();
      const shutNormal = closed.getAttribute("normal");
      for (let i = 0; i < position.count; i++) {
        if (Math.hypot(move.getX(i), move.getY(i), move.getZ(i)) < 1e-5)
          continue;
        normal.setXYZ(
          i,
          shutNormal.getX(i),
          shutNormal.getY(i),
          shutNormal.getZ(i),
        );
        // Las formas que despliegan el párpado lo dejan un poco más afuera.
        for (const target of moves) {
          if (Math.hypot(target.getX(i), target.getY(i), target.getZ(i)) < 1e-5)
            continue;
          target.setXYZ(
            i,
            target.getX(i) + shutNormal.getX(i) * LID_GAP,
            target.getY(i) + shutNormal.getY(i) * LID_GAP,
            target.getZ(i) + shutNormal.getZ(i) * LID_GAP,
          );
        }
      }
      closed.dispose();
    }
    fixedEyes.set(source, geometry);
  }
  eye.geometry = geometry;
}

export type PreparedLunito = { root: Group; parts: LunitoParts };

/** Copia el modelo (puede haber varios Lunitos a la vez) y arma sus partes. */
export function prepareLunito(scene: Object3D): PreparedLunito {
  const model = scene.clone(true);
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.set(1, 1, 1);
  model.updateMatrixWorld(true);
  model.traverse((o) => {
    if ((o as Mesh).isMesh) ownMaterial(o as Mesh);
  });

  // El cuerpo entero se ladea, salta y respira desde el piso, entre los pies.
  const feet = new Box3().setFromObject(model).min.y;
  const root = new Group();
  const body = new Group();
  body.name = "body_pivot";
  body.position.y = feet;
  model.position.y = -feet;
  body.add(model);
  root.add(body);

  const mesh = (name: string) =>
    model.getObjectByName(name) as Mesh | undefined;

  // Las branquias de cada lado se mueven juntas, desde dentro de la cabeza:
  // al separarlas del modelo de Meshy cada una se llevó trozos de sus vecinas
  // y, si giran por separado, esos trozos se desprenden (se ve en /lunito).
  const gills = (["L", "R"] as const).flatMap((s) => {
    const fins = [1, 2, 3]
      .map((i) => mesh(`gill_${s}_${i}`))
      .filter((m) => m !== undefined);
    if (fins.length === 0) return [];
    const side = s === "L" ? -1 : 1;
    const box = new Box3();
    for (const fin of fins) box.expandByObject(fin);
    const center = box.getCenter(new Vector3());
    // Base: el borde de las branquias que entra en la cabeza.
    const base = new Vector3(
      side < 0 ? box.max.x : box.min.x,
      center.y,
      center.z,
    );
    const pivot = new Group();
    pivot.name = `gills_${s}_pivot`;
    pivot.position.copy(base);
    model.add(pivot);
    for (const fin of fins) {
      fin.position.sub(base);
      pivot.add(fin);
    }
    return [{ side, pivot, fins }];
  });

  const eyes = [mesh("eye_L"), mesh("eye_R")].filter((e) => e !== undefined);
  eyes.forEach(fixEyelids);

  // La boca tiene dos materiales (interior y lengua): son dos mallas con las
  // mismas shape keys bajo el nodo "mouth".
  const mouth: Mesh[] = [];
  model.getObjectByName("mouth")?.traverse((o) => {
    if ((o as Mesh).morphTargetInfluences) mouth.push(o as Mesh);
  });

  return {
    root,
    parts: {
      body,
      belly: mesh("belly") ?? null,
      gills,
      eyes,
      mouth,
      armL: mesh("arm_L") ?? null,
      armR: mesh("arm_R") ?? null,
      tail: mesh("tail") ?? null,
    },
  };
}
