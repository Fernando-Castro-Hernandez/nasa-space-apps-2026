import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, useRef, type ReactNode } from "react";
import { type PerspectiveCamera, Vector3 } from "three";
import { LunitoGlb } from "@/features/lunito/LunitoGlb";
import { LunitoPlaceholder } from "@/features/lunito/LunitoPlaceholder";
import type { Motion } from "@/features/lunito/motion";
import { hasWebGL } from "@/features/lunito/webgl";
import type { Status } from "@/domain/vitals";

export type Anchor = [number, number, number];
export type ScreenPoint = { x: number; y: number };

type Props = {
  motion: Motion;
  status: Status;
  /** Puntos del cuerpo de Lunito de donde salen los datos, según el ancho
   *  del canvas en píxeles. */
  anchorsFor: (width: number) => Anchor[];
  /** Recibe esos puntos en píxeles del canvas cada vez que se mueven. */
  onProject: (points: ScreenPoint[], width: number) => void;
  /** Mitad del ancho visible (en unidades) según el ancho del canvas, para
   *  que Lunito sea lo más grande posible y los datos sigan cabiendo. */
  halfWidthFor: (width: number) => number;
};

export function LunitoScene({
  motion,
  status,
  anchorsFor,
  onProject,
  halfWidthFor,
}: Props) {
  // Sin WebGL, three.js no puede crear el lienzo: mejor sin Lunito que sin
  // pantalla. (LunitoAvatar, en cambio, deja su imagen.)
  if (!hasWebGL()) return null;
  const model = <LunitoPlaceholder motion={motion} status={status} />;
  return (
    <Canvas
      camera={{ position: [0, 0.3, 5.2], fov: 32 }}
      dpr={[1, 2]}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
    >
      <FitCamera halfWidthFor={halfWidthFor} />
      <Projector anchorsFor={anchorsFor} onProject={onProject} />
      {/* Luz fija y cámara quieta: Lunito solo gira si el astronauta lo arrastra. */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight
        position={[-4, 1, -2]}
        intensity={0.4}
        color="#B9A6FF"
      />
      <Suspense fallback={model}>
        <ModelOrFallback fallback={model}>
          <LunitoGlb motion={motion} status={status} />
        </ModelOrFallback>
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}

/** El fov es vertical: aleja la cámara hasta que el ancho visible sea el que
 *  pide `halfWidthFor` para el ancho actual del canvas. */
function FitCamera({ halfWidthFor }: Pick<Props, "halfWidthFor">) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.viewport.aspect);
  const width = useThree((s) => s.size.width);
  useEffect(() => {
    const halfFov = (camera.fov / 2) * (Math.PI / 180);
    const z = halfWidthFor(width) / (Math.tan(halfFov) * aspect);
    camera.position.setZ(z);
    camera.updateProjectionMatrix();
  }, [camera, aspect, width, halfWidthFor]);
  return null;
}

const tmp = new Vector3();

/** Proyecta los anclajes 3D a píxeles. Solo avisa cuando algo se movió. */
function Projector({
  anchorsFor,
  onProject,
}: Pick<Props, "anchorsFor" | "onProject">) {
  const last = useRef<ScreenPoint[]>([]);
  useFrame(({ camera, size }) => {
    const points = anchorsFor(size.width).map(([x, y, z]) => {
      tmp.set(x, y, z).project(camera);
      return {
        x: ((tmp.x + 1) / 2) * size.width,
        y: ((1 - tmp.y) / 2) * size.height,
      };
    });
    const moved = points.some((p, i) => {
      const q = last.current[i];
      return !q || Math.abs(p.x - q.x) > 0.5 || Math.abs(p.y - q.y) > 0.5;
    });
    if (moved) {
      last.current = points;
      onProject(points, size.width);
    }
  });
  return null;
}

type BoundaryProps = { fallback: ReactNode; children: ReactNode };

/** Sin GLB (404 o malla rota) se usa el placeholder, sin romper la pantalla. */
class ModelOrFallback extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("No se pudo cargar lunito.glb; se usa el placeholder.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
