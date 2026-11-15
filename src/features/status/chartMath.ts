// Geometría de las gráficas de "Tu evolución": curva suave que no se pasa de
// los datos, ejes de tres valores y el rango de la semana en curso.

export type Pt = { x: number; y: number };

const r = (n: number) => Math.round(n * 100) / 100;

/** Curva cúbica monótona (Fritsch-Carlson): suave y sin picos inventados. */
export function smoothPath(pts: Pt[]): string {
  const first = pts[0];
  if (!first) return "";
  if (pts.length === 1) return `M${r(first.x)},${r(first.y)}`;
  const n = pts.length;
  const dx = Array.from({ length: n - 1 }, (_, i) => pts[i + 1]!.x - pts[i]!.x);
  const m = dx.map((d, i) => (pts[i + 1]!.y - pts[i]!.y) / d);
  const t = pts.map((_, i) => {
    if (i === 0) return m[0]!;
    if (i === n - 1) return m[n - 2]!;
    return m[i - 1]! * m[i]! <= 0 ? 0 : (m[i - 1]! + m[i]!) / 2;
  });
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i]! / m[i]!;
    const b = t[i + 1]! / m[i]!;
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      t[i] = tau * a * m[i]!;
      t[i + 1] = tau * b * m[i]!;
    }
  }
  let d = `M${r(first.x)},${r(first.y)}`;
  for (let i = 0; i < n - 1; i++) {
    const p = pts[i]!;
    const q = pts[i + 1]!;
    const h = dx[i]! / 3;
    d += `C${r(p.x + h)},${r(p.y + t[i]! * h)} ${r(q.x - h)},${r(q.y - t[i + 1]! * h)} ${r(q.x)},${r(q.y)}`;
  }
  return d;
}

/** Eje: el rango base, ampliado si algún valor se sale de él. */
export function domainFor(
  values: number[],
  base: [number, number],
): [number, number] {
  return [
    Math.min(base[0], Math.floor(Math.min(...values))),
    Math.max(base[1], Math.ceil(Math.max(...values))),
  ];
}

/** Tres valores del eje: mínimo, medio y máximo. */
export const ticks = ([lo, hi]: [number, number]) => [lo, (lo + hi) / 2, hi];

type Box = { w: number; h: number; slots: number };

/** Puntos en pantalla; `slots` reserva el ancho de toda la semana aunque falten días. */
export function plotPoints(
  values: number[],
  [lo, hi]: [number, number],
  { w, h, slots }: Box,
): Pt[] {
  const step = slots > 1 ? w / (slots - 1) : 0;
  return values.map((v, i) => ({
    x: i * step,
    y: h - ((v - lo) / (hi - lo)) * h,
  }));
}

const month = (d: Date) =>
  new Intl.DateTimeFormat("es", { month: "long" }).format(d);

/** Semana en curso de lunes a domingo: "9–15 de noviembre". */
export function weekRange(now: Date) {
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()}–${end.getDate()} de ${month(end)}`
    : `${start.getDate()} de ${month(start)} – ${end.getDate()} de ${month(end)}`;
}
