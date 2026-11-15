// Animaciones del dashboard sin dependencias: cada elemento entra con una
// transición CSS cuando `useReveal` se activa, y los números cuentan hasta su
// valor. Con movimiento reducido todo aparece de inmediato.
import { useEffect, useState } from "react";

export const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** false al montar y true tras `delay` ms: dispara la transición de entrada. */
export function useReveal(delay = 0) {
  const [on, setOn] = useState(prefersReducedMotion);
  useEffect(() => {
    if (on) return;
    const id = window.setTimeout(() => setOn(true), delay + 16);
    return () => window.clearTimeout(id);
  }, [on, delay]);
  return on;
}

/** Número que sube (o baja) suavemente hasta `target`, desde el valor anterior. */
export function useCountUp(target: number, { delay = 0, duration = 900 } = {}) {
  const [value, setValue] = useState(() =>
    prefersReducedMotion() ? target : 0,
  );
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    let frame = 0;
    const from = value;
    const timer = window.setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - (1 - p) ** 3;
        setValue(from + (target - from) * eased);
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
    // `value` solo se lee como punto de partida; no debe reiniciar la animación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, delay, duration]);
  return Math.round(value);
}
