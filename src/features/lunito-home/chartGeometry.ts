export function chartGeometry(values: number[], domain: [number, number]) {
  const min = Math.min(domain[0], ...values);
  const max = Math.max(domain[1], ...values);
  const span = Math.max(1, max - min);
  const points = values.map((value, index) => ({
    x: 42 + (index * 418) / Math.max(1, values.length - 1),
    y: 235 - ((value - min) / span) * 210,
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
    area: `${line} L460,235 L42,235 Z`,
    ticks: [max, (min + max) / 2, min],
  };
}
