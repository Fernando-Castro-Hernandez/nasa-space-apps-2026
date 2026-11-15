// Una gráfica de "Tu evolución" (referencia 3): área suave, eje de tres valores,
// último valor grande y un punto al final de la línea. Sin línea base (DISENO.md).
// La línea se dibuja de izquierda a derecha y el punto aparece al final.
import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { useCountUp, useReveal } from "@/features/lunito/anim";
import { domainFor, plotPoints, smoothPath, ticks } from "./chartMath";

const W = 340;
const H = 150;
const PLOT = { x: 42, y: 10, w: 290, h: 100 };

type Props = {
  icon: LucideIcon;
  name: string;
  tech?: string;
  unit: string;
  values: number[];
  /** Cuántos puntos caben en el ancho: 7 días o 4 semanas. */
  slots: number;
  labels: string[];
  domain: [number, number];
  /** Color de la línea: lila o cian. */
  line: string;
  /** Color del estado del indicador: valor y punto. */
  status: string;
  delay?: number;
};

export function EvolutionChart(p: Props) {
  const id = useId();
  const on = useReveal(p.delay ?? 0);
  const last = p.values[p.values.length - 1]!;
  const shown = useCountUp(last, { delay: (p.delay ?? 0) + 300 });
  const domain = domainFor(p.values, p.domain);
  const pts = plotPoints(p.values, domain, {
    w: PLOT.w,
    h: PLOT.h,
    slots: p.slots,
  });
  const path = smoothPath(pts);
  const end = pts[pts.length - 1]!;
  const area = `${path}L${end.x},${PLOT.h}L0,${PLOT.h}Z`;
  const step = PLOT.w / (p.slots - 1);
  const Icon = p.icon;

  return (
    <section className="flex flex-col gap-2 py-4" aria-label={p.name}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className="size-7 text-primary md:hidden" aria-hidden="true" />
          <div className="leading-tight" style={{ color: "var(--dash-ink)" }}>
            <h3 className="text-lg font-semibold md:text-lg md:font-medium">
              {p.name}
              <span className="hidden font-normal text-muted-foreground md:inline">
                {" "}
                · {p.unit}
              </span>
            </h3>
            {p.tech && (
              <p className="text-sm text-muted-foreground md:hidden">
                {p.tech}
              </p>
            )}
          </div>
        </div>
        <p className="font-semibold" style={{ color: p.status }}>
          <span className="text-3xl">{shown}</span>{" "}
          <span className="text-lg md:hidden">{p.unit}</span>
        </p>
      </header>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.line} stopOpacity={0.28} />
            <stop offset="100%" stopColor={p.line} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {ticks(domain).map((t, i) => {
          const y =
            PLOT.y +
            PLOT.h -
            ((t - domain[0]) / (domain[1] - domain[0])) * PLOT.h;
          return (
            <g key={t}>
              <line
                x1={PLOT.x}
                x2={PLOT.x + PLOT.w}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={i === 0 ? 1.2 : 1}
              />
              <text
                x={PLOT.x - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={12}
                fill="var(--muted-foreground)"
              >
                {Number.isInteger(t) ? t : t.toFixed(1)}
              </text>
            </g>
          );
        })}
        <line
          x1={PLOT.x}
          x2={PLOT.x}
          y1={PLOT.y}
          y2={PLOT.y + PLOT.h}
          stroke="var(--border)"
        />

        {p.labels.map((l, i) => (
          <text
            key={l}
            x={PLOT.x + i * step}
            y={H - 8}
            textAnchor="middle"
            fontSize={12}
            fill="var(--muted-foreground)"
          >
            {l}
          </text>
        ))}

        <g transform={`translate(${PLOT.x} ${PLOT.y})`}>
          <path
            d={area}
            fill={`url(#${id})`}
            style={{
              opacity: on ? 1 : 0,
              transition: "opacity 1000ms ease-out 500ms",
            }}
          />
          <path
            d={path}
            pathLength={1}
            fill="none"
            stroke={p.line}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeDasharray={1}
            strokeDashoffset={on ? 0 : 1}
            style={{ transition: "stroke-dashoffset 1300ms ease-out" }}
          />
          <circle
            cx={end.x}
            cy={end.y}
            r={5}
            fill={p.status}
            style={{
              opacity: on ? 1 : 0,
              transform: on ? "scale(1)" : "scale(0)",
              transformBox: "fill-box",
              transformOrigin: "center",
              transition:
                "opacity 300ms ease-out 1200ms, transform 500ms cubic-bezier(0.34,1.56,0.64,1) 1200ms",
            }}
          />
        </g>
      </svg>
    </section>
  );
}
