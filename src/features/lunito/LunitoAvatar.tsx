// LunitoAvatar: Lunito 3D animado, listo para ponerlo donde hoy hay una
// imagen de Lunito. Es la pieza que usan las pantallas Marea.
//
// Se ve igual que las imágenes de day-checkin/assets (mismo encuadre
// cuadrado, fondo transparente para las manchas "Marea") y las usa de
// respaldo: la imagen se ve de inmediato y el 3D se funde encima cuando ya
// pintó su primer cuadro. Sin WebGL, si el modelo falla o si se pierde el
// contexto (y no vuelve), queda la imagen. three.js y el modelo se cargan
// aparte, la primera vez que Lunito entra en pantalla.
//
// Uso: una línea donde hoy está el <img>.
//
//   import saludo from "@/features/day-checkin/assets/lunito-saludo.webp";
//   <LunitoAvatar pose="greeting" fallbackSrc={saludo} label={t("…")} />
//
// Inicio del día (DayCheckInScreen): una pose por fase, dentro de .day-pose.
//
//   const POSE = { saludo: "greeting", pregunta: "asking",
//                  escucha: "listening", listo: "listening" } as const;
//   const lunito = useRef<LunitoAvatarHandle>(null);
//   <div className="day-pose">
//     <LunitoAvatar ref={lunito} pose={POSE[phase]} fallbackSrc={copy.pose}
//       label={t("…")} />
//   </div>
//   // Al terminar de escuchar, un "sí" antes de pasar a Inicio:
//   lunito.current?.play("nod");
//
// Héroe de Inicio (TodayPage): con la lectura real y el semáforo, en el
// lugar de <img className="today-lunito">. Sin `pose` reposa ("idle") en
// Bien y cuida ("caring") en Precaución o Atención.
//
//   <LunitoAvatar className="today-lunito" status={data.status}
//     reading={data.reading} baseline={DASHBOARD_BASELINE}
//     fallbackSrc={pregunta} label={t("…")} />
//
// Props:
// - pose: pose sostenida (poses.ts): idle, greeting, asking, listening,
//   thinking, speaking, celebrating, caring. Por defecto, la de reposo del
//   semáforo. Cambiarla hace una transición suave (0.6 s).
// - status: color de la pancita ("verde" por defecto).
// - reading + baseline: la pancita late con el pulso, el cuerpo respira según
//   la HRV y las branquias brillan con el oxígeno. Sin ellos respira calmado y
//   la pancita no late (no se inventa un pulso).
// - fallbackSrc: imagen de la misma pose (obligatoria).
// - label: nombre accesible, ya traducido.
// - onTap: si se da, Lunito es un botón (foco visible y teclado) que además
//   hace su gesto. Sin onTap, tocarlo solo le saca el gesto: es un adorno.
// - tapGesture: el gesto al tocarlo ("giggle" por defecto; null, ninguno).
// - followVoice: mientras Lunito piensa o habla (lunitoVoice.activity()),
//   cambia solo a "thinking" o "speaking"; saludar y festejar se sostienen
//   mientras habla. true por defecto. La boca sigue la voz siempre.
// - ref: { play(gesture) } dispara un gesto de una vez (gestures.ts): wave,
//   nod, cheer, giggle. Sin 3D o con movimiento reducido no hace nada.
// - className / style: tamaño y posición. Por defecto es cuadrado y ocupa el
//   ancho de su contenedor; con otra proporción, el cuadro de Lunito se
//   centra adentro, como `object-fit: contain`. Las clases propias (sin capa,
//   como today.css) ganan a su `relative`. El lienzo se sale un 10 % por lado
//   (framing.ts, BLEED) para que los saltos no se corten: el contenedor no
//   debe recortar (`overflow: hidden`) tan pegado.
//
// Con prefers-reduced-motion queda quieto en su pose y solo se redibuja
// cuando algo cambia. Fuera de pantalla o con la pestaña oculta no dibuja.
// No usarlo en /emergencia ni en /tierra: ahí no hay Lunito animado
// (SISTEMA.md §7.5).
import {
  lazy,
  Suspense,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type Ref,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import type { Baseline, Reading, Status } from "@/domain/vitals";
import { BLEED } from "./framing";
import type { LunitoGesture } from "./gestures";
import type { AvatarInbox } from "./LunitoAvatarCanvas";
import type { LunitoPose } from "./poses";
import { hasWebGL } from "./webgl";

const LunitoAvatarCanvas = lazy(() => import("./LunitoAvatarCanvas"));

export type LunitoAvatarHandle = {
  /** Dispara un gesto de una vez. Sin 3D o con movimiento reducido, nada. */
  play: (gesture: LunitoGesture) => void;
};

export type LunitoAvatarProps = {
  pose?: LunitoPose;
  status?: Status;
  reading?: Reading;
  baseline?: Baseline;
  fallbackSrc: string;
  label: string;
  onTap?: () => void;
  tapGesture?: LunitoGesture | null;
  followVoice?: boolean;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<LunitoAvatarHandle>;
};

/** Veces que se intenta volver a crear el 3D tras perder el contexto. */
const MAX_RETRIES = 2;

const reducedQuery = () =>
  typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

const useReducedMotion = () =>
  useSyncExternalStore(
    (onChange) => {
      const query = reducedQuery();
      query?.addEventListener("change", onChange);
      return () => query?.removeEventListener("change", onChange);
    },
    () => reducedQuery()?.matches ?? false,
    () => false,
  );

const usePageVisible = () =>
  useSyncExternalStore(
    (onChange) => {
      document.addEventListener("visibilitychange", onChange);
      return () => document.removeEventListener("visibilitychange", onChange);
    },
    () => !document.hidden,
    () => true,
  );

/** ¿Está en pantalla? Sin IntersectionObserver se asume que sí. */
function useInView(target: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  useEffect(() => {
    const element = target.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry?.isIntersecting ?? false),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);
  return inView;
}

const clamp = (v: number) => Math.min(1, Math.max(-1, v));

export function LunitoAvatar({
  pose,
  status = "verde",
  reading,
  baseline,
  fallbackSrc,
  label,
  onTap,
  tapGesture = "giggle",
  followVoice = true,
  className,
  style,
  ref,
}: LunitoAvatarProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const inbox = useRef<AvatarInbox>({ gestures: [], pointer: null });
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const inView = useInView(wrap);
  // El 3D se carga la primera vez que Lunito entra en pantalla y se queda.
  const [seen, setSeen] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (inView && !seen) setSeen(true);
  const live = seen && !failed && hasWebGL();
  const shown = live && ready;
  const moving = shown && !reduced;

  const play = (gesture: LunitoGesture) => {
    if (moving) inbox.current.gestures.push(gesture);
  };
  useImperativeHandle(ref, () => ({ play }));

  // Sin onTap, tocarlo solo le saca un gesto: es un adorno, no un control, y
  // por eso no es un botón (con onTap, el botón hace las dos cosas).
  useEffect(() => {
    const element = wrap.current;
    if (!moving || onTap || !tapGesture || !element) return;
    const tap = () => inbox.current.gestures.push(tapGesture);
    element.addEventListener("click", tap);
    return () => element.removeEventListener("click", tap);
  }, [moving, onTap, tapGesture]);

  // Lunito sigue al puntero del ratón por toda la pantalla, solo mientras se ve.
  useEffect(() => {
    if (!moving || !inView) return;
    const box = inbox.current;
    const move = (event: PointerEvent) => {
      const rect = wrap.current?.getBoundingClientRect();
      if (event.pointerType !== "mouse" || !rect) return;
      box.pointer = {
        x: clamp((event.clientX - rect.left - rect.width / 2) / rect.width),
        y: clamp((rect.top + rect.height / 2 - event.clientY) / rect.height),
      };
    };
    const leave = () => (box.pointer = null);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      leave();
    };
  }, [moving, inView]);

  const onLost = () => {
    setReady(false);
    if (attempt >= MAX_RETRIES) setFailed(true);
    // Un lienzo nuevo pide un contexto nuevo; mientras, se ve la imagen.
    else window.setTimeout(() => setAttempt((n) => n + 1), 600);
  };

  const fade: CSSProperties = {
    transition: reduced ? undefined : "opacity 450ms ease-out",
  };

  return (
    <div
      ref={wrap}
      className={cn("relative", className)}
      style={{ aspectRatio: "1 / 1", ...style }}
      role={onTap ? undefined : "img"}
      aria-label={onTap ? undefined : label}
    >
      <img
        src={fallbackSrc}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-contain select-none"
        style={{ ...fade, opacity: shown ? 0 : 1 }}
      />
      {live && (
        // El lienzo se sale un poco de la caja (BLEED) para que los saltos y
        // las branquias no se corten en el borde.
        <div
          className="pointer-events-none absolute"
          style={{ ...fade, inset: `${-BLEED * 100}%`, opacity: shown ? 1 : 0 }}
        >
          <Suspense fallback={null}>
            <LunitoAvatarCanvas
              key={attempt}
              pose={pose}
              status={status}
              reading={reading}
              baseline={baseline}
              followVoice={followVoice}
              still={reduced}
              paused={!inView || !pageVisible}
              inbox={inbox}
              onReady={() => setReady(true)}
              onLost={onLost}
              onError={() => setFailed(true)}
            />
          </Suspense>
        </div>
      )}
      {onTap && (
        <button
          type="button"
          aria-label={label}
          onClick={() => {
            if (tapGesture) play(tapGesture);
            onTap();
          }}
          className="absolute inset-[6%] rounded-[45%] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        />
      )}
    </div>
  );
}
