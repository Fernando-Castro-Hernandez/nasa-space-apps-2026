// Gráfica de un indicador: semana (lunes a domingo) o mes (4 semanas). Una sola
// etiqueta de valor: la última lectura, o el día que se toca. Cada día se puede
// tocar en toda su columna. Con `baseline`, una línea punteada marca la línea
// base (Mi estado; en Inicio no va, DISENO.md).
import { useState } from "react";
import type { DashboardMetric } from "@/data/lunitoDashboard";
import { metricText } from "@/features/lunito/metricFormat";
import { formatNumber, t, type MessageKey } from "@/i18n";
import { chartGeometry } from "./chartGeometry";
import { Marea } from "./Marea";

const WEEKDAYS: MessageKey[] = [
  "common.weekdays.mon",
  "common.weekdays.tue",
  "common.weekdays.wed",
  "common.weekdays.thu",
  "common.weekdays.fri",
  "common.weekdays.sat",
  "common.weekdays.sun",
];

export function MetricChart({
  metric,
  period,
  baseline,
}: {
  metric: DashboardMetric;
  period: "week" | "month";
  baseline?: number;
}) {
  const values = metric[period];
  const [selected, setSelected] = useState<number | null>(null);
  const { points, line, area, ticks, column, baselineY } = chartGeometry(
    values,
    metric.domain,
    baseline,
  );
  const labels =
    period === "week"
      ? WEEKDAYS.map((key) => t(key))
      : values.map((_, i) => t("common.weekShort", { n: i + 1 }));
  const show = (value: number) => metricText(metric.key, value, metric.unit);
  const shown = points[selected ?? points.length - 1]!;
  return (
    <figure
      className="metric-chart"
      aria-label={t("home.data.chart", {
        metric: metric.label,
        period:
          period === "week"
            ? t("home.data.chartWeek")
            : t("home.data.chartMonth"),
        values: values.map((value) => formatNumber(value)).join(", "),
        unit: metric.unit,
      })}
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
        <path d={area} fill="url(#chart-fill)" className="chart-area" />
        <path
          d="M22 25V235H480"
          fill="none"
          style={{ stroke: "var(--reference-ink-soft)" }}
          strokeWidth="1"
        />
        {ticks.map((tick, index) => (
          <text
            key={index}
            x="10"
            y={31 + index * 105}
            textAnchor="end"
            className="chart-axis"
          >
            {formatNumber(tick, { maximumFractionDigits: 1 })}
          </text>
        ))}
        {baselineY !== null && (
          <path
            d={`M22 ${baselineY}H480`}
            className="chart-baseline"
            strokeDasharray="8 7"
          />
        )}
        <path
          d={line}
          fill="none"
          pathLength={1}
          className="chart-line"
          style={{ stroke: "var(--reference-violet)" }}
          strokeWidth="3.5"
        />
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={index === points.length - 1 ? 9 : 7}
              className="chart-point"
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
            {/* Toda la columna del día responde al toque, no solo el punto. */}
            <foreignObject
              x={point.x - column / 2}
              y="0"
              width={column}
              height="250"
            >
              <button
                type="button"
                className="chart-hit"
                aria-label={t("home.data.point", {
                  day: labels[index]!,
                  value: show(point.value),
                })}
                onClick={() => setSelected(index)}
                onFocus={() => setSelected(index)}
                onMouseEnter={() => setSelected(index)}
              />
            </foreignObject>
          </g>
        ))}
        {/* One value label at a time: the latest reading, or the point the user points at. */}
        <g
          className="chart-label"
          style={{
            transform: `translate(${shown.x}px, ${shown.y - 43}px)`,
          }}
          aria-hidden="true"
        >
          <rect
            x="-30"
            y="-14"
            width="60"
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
            {formatNumber(shown.value)}
          </text>
        </g>
      </svg>
      {selected !== null && (
        <span className="sr-only" aria-live="polite">
          {show(values[selected]!)}
        </span>
      )}
    </figure>
  );
}
