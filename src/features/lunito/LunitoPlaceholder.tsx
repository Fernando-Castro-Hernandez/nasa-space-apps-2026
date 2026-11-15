// Lunito hecho con primitivas, con las mismas partes nombradas que debe traer
// el GLB de Meshy (body, belly, gill_L_1..3, gill_R_1..3, eye_L, eye_R).
// Sirve para construir y probar el dashboard mientras llega el modelo real.
import { useRef } from "react";
import type { Group, Mesh } from "three";
import type { Motion } from "@/features/lunito/motion";
import { useLunitoMotion } from "@/features/lunito/useLunitoMotion";
import type { Status } from "@/domain/vitals";

type Props = { motion: Motion; status: Status };

const GILL_ANGLES = [-0.5, 0, 0.5];

export function LunitoPlaceholder({ motion, status }: Props) {
  const body = useRef<Group>(null);
  const belly = useRef<Mesh>(null);
  const gills = useRef<Mesh[]>([]);
  const eyes = useRef<Mesh[]>([]);

  useLunitoMotion(
    () => ({
      body: body.current,
      belly: belly.current,
      gills: gills.current,
      eyes: eyes.current,
    }),
    motion,
    status,
  );

  return (
    <group ref={body} name="body" position={[0, -0.2, 0]}>
      <mesh position={[0, 0.3, 0]} scale={[1, 1.25, 0.95]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#9B8BE6" roughness={0.55} />
      </mesh>
      <mesh ref={belly} name="belly" position={[0, 0.05, 0.78]} scale={0.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#2FD6E0" roughness={0.35} />
      </mesh>
      {([-1, 1] as const).map((side) =>
        GILL_ANGLES.map((a, i) => (
          <mesh
            key={`${side}${i}`}
            ref={(m) => {
              if (m) gills.current[(side + 1) * 1.5 + i] = m;
            }}
            name={`gill_${side < 0 ? "L" : "R"}_${i + 1}`}
            position={[side * 0.95, 1.05 + i * 0.12, -0.1]}
            rotation={[0, 0, side * (0.9 + a)]}
          >
            <coneGeometry args={[0.14, 0.7, 12]} />
            <meshStandardMaterial color="#E7A6E0" roughness={0.5} />
          </mesh>
        )),
      )}
      {([-1, 1] as const).map((side) => (
        <mesh
          key={side}
          ref={(m) => {
            if (m) eyes.current[side < 0 ? 0 : 1] = m;
          }}
          name={side < 0 ? "eye_L" : "eye_R"}
          position={[side * 0.36, 0.95, 0.78]}
          scale={[0.18, 0.2, 0.1]}
        >
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color="#1D1750" roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
