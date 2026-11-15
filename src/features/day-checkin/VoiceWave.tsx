import { useEffect, useRef } from "react";
import { BAR_COUNT, barHeights } from "./waveform";

type Props = { getLevel: () => number; reducedMotion: boolean };
const STILL = barHeights(0.7, 0);

export function VoiceWave({ getLevel, reducedMotion }: Props) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const frame = useRef(0);
  useEffect(() => {
    if (reducedMotion) return;
    const start = performance.now();
    const draw = (now: number) => {
      barHeights(getLevel(), (now - start) / 1000).forEach((height, i) => {
        const bar = bars.current[i];
        if (bar) bar.style.transform = `scaleY(${height})`;
      });
      frame.current = requestAnimationFrame(draw);
    };
    frame.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame.current);
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
