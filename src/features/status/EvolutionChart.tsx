// Una gráfica de "Tu evolución" (referencia 3): área suave, eje de tres valores,
// último valor grande y un punto al final de la línea. Sin línea base (DISENO.md).
// Interactiva: una línea vertical sigue al puntero (o a las flechas del teclado),
// se ajusta al dato más cercano y un globo muestra el valor y el día.
import { useId, useState, type PointerEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { useCountUp, useReveal } from "@/features/lunito/anim";
import { cn } from "@/lib/utils";
import {
  domainFor,
  nearestIndex,
  plotPoints,
  smoothPath,
  ticks,
} from "./chartMath";

const W = 340;
const H = 150;
const PLOT = { x: 42, y: 10, w: 290, h: 100 };
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

type Props = {
  icon: LucideIcon;
  name: string;
  tech?: string;
  unit: string;
  values: number[];
  /** Cuántos puntos caben en el ancho: 7 días o 4 semanas. */
  slots: number;
  labels: string[];
  /** Nombre completo de cada punto para el globo ("Martes", "Semana 2"). */
  names: string[];
  domain: [number, number];
  /** Color de la línea: lila o cian. */
  line: string;
  /** Color del estado del indicador: valor y punto. */
  status: string;
  delay?: number;
  /** Se atenúa cuando el astronauta mira otro indicador. */
  dimmed?: boolean;
  /** Avisa qué indicador se está mirando (o null al salir). */
  onLook?: (looking: boolean) => void;
};

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

export function EvolutionChart(p: Props) {
  const id = useId();
  const on = useReveal(p.delay ?? 0);
  const [active, setActive] = useState<number | null>(null);
  const last = p.values[p.values.length - 1]!;
  const shown = useCountUp(last, {
    delay: (p.delay ?? 0) + 300,
    duration: 700,
  });
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
  const point = active === null ? null : pts[active]!;
  const Icon = p.icon;

  const look = (i: number | null) => {
    setActive(i);
    p.onLook?.(i !== null);
  };

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * PLOT.w;
    look(nearestIndex(x, pts.length, p.slots, PLOT.w));
  };

  return (
    <section
      className={cn(
        "flex flex-col gap-2 py-4 transition-opacity duration-200",
        p.dimmed && "opacity-45",
      )}
      aria-label={p.name}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className="size-7 text-primary md:hidden" aria-hidden="true" />
          <div className="leading-tight" style={{ color: "var(--dash-ink)" }}>
            <h3 className="text-lg font-semibold md:font-medium">
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
          <span className="text-3xl tabular-nums">{shown}</span>{" "}
          <span className="text-lg md:hidden">{p.unit}</span>
        </p>
      </header>

      <div className="relative rounded-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
        {/* Teclado y lector de pantalla: un deslizador nativo, oculto, recorre los días. */}
        <input
          type="range"
          className="sr-only"
          aria-label={`${p.name}: recorre los días con las flechas`}
          min={0}
          max={pts.length - 1}
          value={active ?? pts.length - 1}
          aria-valuetext={`${p.names[active ?? pts.length - 1]}: ${fmt(p.values[active ?? pts.length - 1]!)} ${p.unit}`}
          onChange={(e) => look(Number(e.target.value))}
          onFocus={() => look(pts.length - 1)}
          onBlur={() => look(null)}
        />
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
                  {fmt(t)}
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
              fontWeight={i === active ? 600 : 400}
              fill={
                i === active ? "var(--dash-ink)" : "var(--muted-foreground)"
              }
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
                transition: `opacity 700ms ease-out 300ms`,
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
              style={{ transition: `stroke-dashoffset 900ms ${EASE}` }}
            />

            {point && (
              <line
                x1={point.x}
                x2={point.x}
                y1={0}
                y2={PLOT.h}
                stroke="var(--dash-ink)"
                strokeOpacity={0.25}
                strokeDasharray="3 3"
              />
            )}

            <circle
              cx={end.x}
              cy={end.y}
              r={5}
              fill={p.status}
              style={{
                opacity: on && active === null ? 1 : 0,
                transform: on ? "scale(1)" : "scale(0.5)",
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: `opacity 200ms ease-out ${active === null ? 800 : 0}ms, transform 300ms ${EASE} 800ms`,
              }}
            />
            {point && (
              <circle
                cx={point.x}
                cy={point.y}
                r={5.5}
                fill={p.status}
                stroke="var(--card)"
                strokeWidth={2}
              />
            )}

            <rect
              x={-step / 2}
              y={-PLOT.y}
              width={PLOT.w + step}
              height={H}
              fill="transparent"
              onPointerMove={onMove}
              onPointerDown={onMove}
              onPointerLeave={() => look(null)}
            />
          </g>
        </svg>

        {point && active !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl bg-card px-3 py-1.5 text-center whitespace-nowrap shadow-[0_8px_24px_oklch(0.5_0.1_295/0.18)] ring-1 ring-foreground/5 transition-[left,top] duration-150 ease-out"
            style={{
              left: `${(Math.min(Math.max(PLOT.x + point.x, 70), W - 40) / W) * 100}%`,
              top: `calc(${((PLOT.y + point.y) / H) * 100}% - 10px)`,
            }}
          >
            <p className="text-base leading-tight font-semibold tabular-nums">
              {fmt(p.values[active]!)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {p.unit}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">{p.names[active]}</p>
          </div>
        )}
      </div>
    </section>
  );
}
