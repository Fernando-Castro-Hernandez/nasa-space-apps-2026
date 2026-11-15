// La parte 3D de LunitoAvatar. Va en su propio chunk (se carga con `lazy`):
// three.js y el modelo no entran al arranque de la app.
import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  CanvasTexture,
  NeutralToneMapping,
  PMREMGenerator,
  type PerspectiveCamera,
  type WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createLunitoAnimator } from "./animator";
import type { LunitoGesture } from "./gestures";
import { BLEED, CAMERA, placeCamera } from "./framing";
import { LUNITO_MODEL_URL, LunitoGlb } from "./LunitoGlb";
import { calmMotion, motionFor } from "./motion";
import { restingPose, type LunitoPose } from "./poses";
import type { LunitoDirector } from "./useLunitoMotion";
import { useLunitoActivity } from "./lunitoVoice";
import type { Baseline, Reading, Status } from "@/domain/vitals";

useGLTF.preload(LUNITO_MODEL_URL);

/** Lo que el contenedor (LunitoAvatar) le pasa al 3D sin volver a renderizar:
 *  gestos pendientes y puntero. */
export type AvatarInbox = {
  gestures: LunitoGesture[];
  pointer: { x: number; y: number } | null;
};

export type AvatarCanvasProps = {
  /** Sin pose: la de reposo según el semáforo. */
  pose?: LunitoPose;
  status: Status;
  reading?: Reading;
  baseline?: Baseline;
  followVoice: boolean;
  /** prefers-reduced-motion: pose quieta, se dibuja solo cuando cambia. */
  still: boolean;
  /** Fuera de la vista o con la pestaña oculta: no se dibuja. */
  paused: boolean;
  inbox: RefObject<AvatarInbox>;
  /** El modelo ya pintó su primer cuadro. */
  onReady: () => void;
  /** Se perdió el contexto de WebGL. */
  onLost: () => void;
  /** No se pudo cargar o armar el modelo. */
  onError: () => void;
};

/** Alto de la pantalla del celular no paga más de 2 píxeles por punto. */
const MAX_DPR = 2;

export default function LunitoAvatarCanvas(props: AvatarCanvasProps) {
  const { paused, still, onLost, onError } = props;
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, MAX_DPR]}
      frameloop={paused ? "never" : still ? "demand" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ fov: CAMERA.fov }}
      onCreated={({ gl }) => {
        prepareRenderer(gl);
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          // Sin esto el navegador no lo devuelve nunca.
          event.preventDefault();
          onLost();
        });
      }}
    >
      <Framing />
      <Lights />
      <ModelBoundary onError={onError}>
        <Suspense fallback={null}>
          <Avatar {...props} />
        </Suspense>
      </ModelBoundary>
    </Canvas>
  );
}

function Avatar({
  pose: requested,
  status,
  reading,
  baseline,
  followVoice,
  still,
  inbox,
  onReady,
}: AvatarCanvasProps) {
  const pose = requested ?? restingPose(status);
  const motion = useMemo(
    () =>
      reading && baseline
        ? motionFor(reading, baseline, { mode: "rest", reducedMotion: still })
        : calmMotion(still),
    [reading, baseline, still],
  );

  // La pose de la primera vez entra sin transición: coincide con la imagen.
  const [animator] = useState(() => createLunitoAnimator(pose));
  const latest = useRef({ pose, still, followVoice });
  useLayoutEffect(() => {
    latest.current = { pose, still, followVoice };
  });
  const director = useMemo<LunitoDirector>(
    () => ({
      animator,
      input: () => {
        const { gestures, pointer } = inbox.current;
        for (const gesture of gestures.splice(0)) animator.play(gesture);
        return { ...latest.current, pointer };
      },
    }),
    [animator, inbox],
  );

  // Con movimiento reducido solo se dibuja cuando algo cambia: cualquier
  // cambio de props, o que Lunito empiece a pensar o a hablar.
  const invalidate = useThree((s) => s.invalidate);
  useLunitoActivity();
  useEffect(() => {
    invalidate();
  });

  // Avisa después del primer cuadro dibujado con el modelo.
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 2) onReady();
    if (frames.current < 2) invalidate();
  });

  return (
    <>
      <LunitoGlb
        motion={motion}
        status={status}
        director={director}
        scale={1}
        offsetY={0}
      />
      <ContactShadow />
    </>
  );
}

/** Colores como en las ilustraciones (sin el lavado de ACES) y fondo
 *  transparente, para dibujarse sobre las manchas "Marea". */
export function prepareRenderer(gl: WebGLRenderer) {
  gl.toneMapping = NeutralToneMapping;
  gl.setClearColor(0x000000, 0);
}

/** Encuadra el mismo cuadrado que las imágenes, como `object-fit: contain`.
 *  `bleed`: cuánto se sale el lienzo de la caja por lado (framing.ts). */
export function Framing({ bleed = BLEED }: { bleed?: number }) {
  const get = useThree((s) => s.get);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    const camera = get().camera as PerspectiveCamera;
    const { position, target, near, far } = placeCamera(aspect, bleed);
    camera.position.set(...position);
    camera.lookAt(...target);
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
  }, [get, aspect, bleed]);
  return null;
}

/** Luz de estudio suave, como en las ilustraciones: un ambiente generado en
 *  el momento (sin descargar nada) más una luz principal arriba al frente. */
export function Lights() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.9;
    room.dispose();
    pmrem.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [get]);
  return (
    <>
      <directionalLight position={[1.5, 3, 4]} intensity={1.6} />
      <directionalLight
        position={[-3, 1.5, -2]}
        intensity={0.5}
        color="#B9A6FF"
      />
    </>
  );
}

/** Altura de las plantas de los pies en el modelo (public/lunito.glb). */
const FEET_Y = -0.947;

/** Sombra suave bajo los pies, como la de las imágenes. */
export function ContactShadow() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const g = canvas.getContext("2d")!;
    const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(60, 40, 110, 0.32)");
    gradient.addColorStop(1, "rgba(60, 40, 110, 0)");
    g.fillStyle = gradient;
    g.fillRect(0, 0, 64, 64);
    return new CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh
      position={[0, FEET_Y + 0.005, 0.05]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1.25, 0.45, 1]}
      renderOrder={-1}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

type BoundaryProps = { onError: () => void; children: ReactNode };

/** Sin GLB (404 o malla rota) el avatar se queda con su imagen. */
class ModelBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
