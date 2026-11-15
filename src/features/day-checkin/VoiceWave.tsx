// Onda de la referencia 04 mientras Lunito escucha. Sigue el volumen de la
// misma sesión de voz que graba (no abre un segundo micrófono: en Android dos
// capturas a la vez se pelean). Se anima sin volver a renderizar.
import { useEffect, useRef } from "react";
import { BAR_COUNT, barHeights } from "./waveform";

type Props = { getLevel: () => number; reducedMotion: boolean };
const STILL = barHeights(0.7, 0);

export function VoiceWave({ getLevel, reducedMotion }: Props) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    if (reducedMotion) return;
    const start = performance.now();
    const frame = { id: 0, level: 0 };
    const draw = (now: number) => {
      // Suaviza el volumen para que la onda no tiemble.
      frame.level += (getLevel() - frame.level) * 0.35;
      barHeights(frame.level, (now - start) / 1000).forEach((height, i) => {
        const bar = bars.current[i];
        if (bar) bar.style.transform = `scaleY(${height})`;
      });
      frame.id = requestAnimationFrame(draw);
    };
    frame.id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame.id);
  }, [getLevel, reducedMotion]);
  return (
    <span className="day-voice-wave" aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          ref={(element) => {
            bars.current[i] = element;
          }}
          style={{ transform: `scaleY(${STILL[i]})` }}
        />
      ))}
    </span>
  );
}
