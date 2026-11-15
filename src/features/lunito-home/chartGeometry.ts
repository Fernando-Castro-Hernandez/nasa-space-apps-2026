// Geometría de la gráfica de un indicador en un lienzo de 480 × 280: el eje
// vertical abarca el rango base, las lecturas y, si se da, la línea base.
// `slots` es cuántos puntos caben a lo ancho: si hay menos lecturas (hoy no
// se midió), la línea termina antes y el último lugar queda vacío.
export function chartGeometry(
  values: number[],
  domain: [number, number],
  baseline?: number,
  slots = values.length,
) {
  const extra = baseline === undefined ? [] : [baseline];
  const min = Math.min(domain[0], ...values, ...extra);
  const max = Math.max(domain[1], ...values, ...extra);
  const span = Math.max(1, max - min);
  const y = (value: number) => 235 - ((value - min) / span) * 210;
  const step = 418 / Math.max(1, slots - 1);
  const points = values.map((value, index) => ({
    x: 42 + index * step,
    y: y(value),
    value,
  }));
  const line = points
    .map((point, index) => {
      if (!index) return `M${point.x},${point.y}`;
      const previous = points[index - 1]!;
      const middle = (previous.x + point.x) / 2;
      return `C${middle},${previous.y} ${middle},${point.y} ${point.x},${point.y}`;
    })
    .join(" ");
  return {
    points,
    line,
    // El relleno baja desde el último punto, no desde el borde derecho.
    area: `${line} L${points.at(-1)?.x ?? 460},235 L42,235 Z`,
    ticks: [max, (min + max) / 2, min],
    /** Ancho de la columna de cada punto: el área que se puede tocar. */
    column: slots > 1 ? step : 418,
    baselineY: baseline === undefined ? null : y(baseline),
  };
}
