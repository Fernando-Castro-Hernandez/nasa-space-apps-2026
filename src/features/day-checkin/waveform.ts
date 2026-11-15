export const BAR_COUNT = 15;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Barras con la silueta central de la referencia, sensibles al volumen. */
export function barHeights(level: number, t: number) {
  const center = (BAR_COUNT - 1) / 2;
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const d = Math.abs(i - center) / center;
    const envelope = 0.2 + 0.8 * Math.cos((d * Math.PI) / 2);
    const ripple = 0.72 + 0.28 * Math.sin(t * 7.5 - d * 4.2);
    return Math.max(0.12, envelope * (0.22 + 0.78 * clamp01(level) * ripple));
  });
}

export function simulatedLevel(t: number) {
  return (
    Math.abs(Math.sin(t * 1.3)) *
    (0.55 + 0.45 * Math.abs(Math.sin(t * 6.1 + 0.8)))
  );
}

export function rmsLevel(samples: ArrayLike<number>) {
  if (!samples.length) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i]! ** 2;
  return clamp01(Math.sqrt(sum / samples.length) * 6);
}
