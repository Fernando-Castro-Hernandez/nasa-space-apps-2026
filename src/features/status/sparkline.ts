// Geometría de la miniatura de 7 días (HU-16): la línea de valores y la línea
// base punteada comparten escala para que se lea cuánto te alejas de tu normal.
const PAD = 2;

export function sparkline(
  values: number[],
  baseline: number,
  width = 96,
  height = 32,
) {
  const all = [...values, baseline];
  const min = Math.min(...all);
  const span = Math.max(...all) - min || 1;
  const y = (v: number) => PAD + (1 - (v - min) / span) * (height - 2 * PAD);
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return {
    points: values.map((v, i) => `${i * step},${y(v)}`).join(" "),
    baselineY: y(baseline),
  };
}
