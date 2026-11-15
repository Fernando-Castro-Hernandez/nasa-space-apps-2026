import { useState } from "react";
import type { DashboardMetric } from "@/data/lunitoDashboard";
import { chartGeometry } from "./chartGeometry";
import { Marea } from "./Marea";

export function MetricChart({
  metric,
  period,
}: {
  metric: DashboardMetric;
  period: "week" | "month";
}) {
  const values = metric[period];
  const [selected, setSelected] = useState<number | null>(null);
  const { points, line, area, ticks } = chartGeometry(values, metric.domain);
  const labels =
    period === "week"
      ? ["L", "M", "X", "J", "V", "S", "D"]
      : values.map((_, i) => `S${i + 1}`);
  return (
    <figure
      className="metric-chart"
      aria-label={`${metric.label}, ${period === "week" ? "semana" : "mes"}: ${values.join(", ")} ${metric.unit}`}
    >
      <Marea variant="chart" />
      <svg viewBox="0 0 480 280">
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              style={{
                stopColor: "var(--reference-lavender-300)",
                stopOpacity: 0.9,
              }}
            />
            <stop
              offset="1"
              style={{
                stopColor: "var(--reference-lavender-50)",
                stopOpacity: 0.9,
              }}
            />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#chart-fill)" />
        <path
          d="M22 25V235H480"
          fill="none"
          style={{ stroke: "var(--reference-ink-soft)" }}
          strokeWidth="1"
        />
        {ticks.map((tick, index) => (
          <text
            key={tick}
            x="10"
            y={31 + index * 105}
            textAnchor="end"
            className="chart-axis"
          >
            {Number(tick.toFixed(1))}
          </text>
        ))}
        <path
          d={line}
          fill="none"
          style={{ stroke: "var(--reference-violet)" }}
          strokeWidth="3.5"
        />
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={index === points.length - 1 ? 9 : 7}
              style={{
                fill:
                  index === points.length - 1
                    ? "var(--reference-violet)"
                    : "var(--reference-surface)",
                stroke: "var(--reference-violet)",
              }}
              strokeWidth="2"
            />
            <text
              x={point.x}
              y="264"
              textAnchor="middle"
              className="chart-axis"
            >
              {labels[index]}
            </text>
            <foreignObject
              x={point.x - 17}
              y={point.y - 17}
              width="34"
              height="34"
            >
              <button
                type="button"
                aria-label={`${labels[index]}: ${point.value} ${metric.unit}`}
                onClick={() => setSelected(index)}
                onFocus={() => setSelected(index)}
                onMouseEnter={() => setSelected(index)}
                style={{
                  width: "100%",
                  height: "100%",
                  padding: 0,
                  border: 0,
                  appearance: "none",
                  borderRadius: "50%",
                  background: "transparent",
                }}
              />
            </foreignObject>
          </g>
        ))}
        {/* One value label at a time: the latest reading, or the point the user points at. */}
        {[selected ?? points.length - 1].map((index) => {
          const point = points[index]!;
          return (
            <g
              key={index}
              transform={`translate(${point.x},${point.y - 43})`}
              aria-hidden="true"
            >
              <rect
                x="-26"
                y="-14"
                width="52"
                height="31"
                rx="15"
                style={{ fill: "var(--reference-violet-soft)" }}
              />
              <path
                d="M-6 15L0 23L6 15"
                style={{ fill: "var(--reference-violet-soft)" }}
              />
              <text
                textAnchor="middle"
                y="9"
                style={{ fill: "var(--reference-surface)" }}
                fontSize="22"
                fontWeight="800"
              >
                {point.value}
              </text>
            </g>
          );
        })}
      </svg>
      {selected !== null && (
        <span className="sr-only" aria-live="polite">
          {values[selected]} {metric.unit}
        </span>
      )}
    </figure>
  );
}
