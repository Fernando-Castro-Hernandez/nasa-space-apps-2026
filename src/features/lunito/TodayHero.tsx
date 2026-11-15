// "Así estás hoy" (referencia 2): Lunito al centro y tres burbujas que salen de
// él con una línea curva. Entra todo en secuencia: Lunito, burbujas, líneas.
// Las medidas salen de la referencia (heroLayout.ts), una por tablet y otra por celular.
import { useLayoutEffect, useRef, useState } from "react";
import { Droplet, Heart, HeartPulse, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp, useReveal } from "./anim";
import type { IndicatorView } from "./dashboardData";
import { layoutFor, type Layout } from "./heroLayout";
import { STATUS_VIEW } from "./theme";

const ICON: Record<IndicatorView["key"], LucideIcon> = {
  bpm: Heart,
  hrv: HeartPulse,
  spo2: Droplet,
};

/** Retraso de entrada de cada burbuja y su línea, en ms. */
const DELAY: Record<IndicatorView["key"], number> = {
  bpm: 250,
  hrv: 400,
  spo2: 550,
};

/** Ancho del contenedor, para elegir la medida de tablet o de celular. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setWidth(e!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

type BubbleProps = { item: IndicatorView; layout: Layout };

function Bubble({ item, layout }: BubbleProps) {
  const [W, H] = layout.size;
  const b = layout.bubbles[item.key];
  const t = layout.text;
  const delay = DELAY[item.key];
  const on = useReveal(delay);
  const value = useCountUp(item.value, { delay: delay + 200 });
  const Icon = ICON[item.key];

  return (
    <div
      className={cn(
        "absolute z-[2] flex flex-col items-center justify-center rounded-full border border-primary/10 bg-card text-center shadow-[0_12px_36px_oklch(0.6_0.12_295/0.16)] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
        on ? "scale-100 opacity-100" : "scale-50 opacity-0",
      )}
      style={{
        left: `${((b.cx - b.d / 2) / W) * 100}%`,
        top: `${((b.cy - b.d / 2) / H) * 100}%`,
        width: `${(b.d / W) * 100}%`,
        aspectRatio: "1",
        color: "var(--dash-ink)",
        fontSize: `${t.name}cqw`,
      }}
    >
      <Icon
        className="text-primary"
        strokeWidth={1.6}
        style={{ width: `${t.icon}cqw`, height: `${t.icon}cqw` }}
        aria-hidden="true"
      />
      <span className="mt-[0.8cqw] leading-[1.1] font-semibold">
        {item.name}
      </span>
      {item.tech && (
        <span className="leading-tight" style={{ fontSize: `${t.tech}cqw` }}>
          {item.tech}
        </span>
      )}
      <span
        className="mt-[0.6cqw] leading-none font-semibold"
        style={{ color: STATUS_VIEW[item.status].color }}
      >
        <span style={{ fontSize: `${t.value}cqw` }}>{value}</span>{" "}
        <span style={{ fontSize: `${t.unit}cqw` }}>{item.unit}</span>
      </span>
    </div>
  );
}

export function TodayHero({
  items,
  image,
}: {
  items: IndicatorView[];
  image: string;
}) {
  const [ref, width] = useWidth();
  const layout = layoutFor(width);
  const [W, H] = layout.size;
  const lunito = useReveal(0);
  const lines = useReveal(700);

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[560px] [container-type:inline-size]"
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      <svg
        className="absolute inset-0 z-[1] size-full"
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
      >
        {items.map((i) => {
          const l = layout.lines[i.key];
          const delay = DELAY[i.key];
          // El punto marca el origen (en la burbuja) salvo en oxígeno, que
          // termina sobre la pancita: ahí aparece al acabar de dibujar la línea.
          const dotAtEnd = i.key === "spo2";
          return (
            <g key={i.key}>
              <path
                d={l.path}
                pathLength={1}
                fill="none"
                stroke="var(--dash-line)"
                strokeOpacity={0.6}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeDasharray={1}
                strokeDashoffset={lines ? 0 : 1}
                style={{
                  transition: `stroke-dashoffset 1100ms ease-out ${delay}ms`,
                }}
              />
              <circle
                cx={l.dot[0]}
                cy={l.dot[1]}
                r={3.6}
                fill="var(--dash-line)"
                fillOpacity={0.75}
                style={{
                  opacity: lines ? 1 : 0,
                  transition: `opacity 400ms ease-out ${delay + (dotAtEnd ? 1000 : 300)}ms`,
                }}
              />
            </g>
          );
        })}
      </svg>

      <img
        src={image}
        alt=""
        className={cn(
          "absolute transition-all duration-1000 ease-out motion-reduce:transition-none",
          lunito
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0",
        )}
        style={{
          left: `${(layout.lunito.left / W) * 100}%`,
          top: `${(layout.lunito.top / H) * 100}%`,
          width: `${(layout.lunito.width / W) * 100}%`,
        }}
      />

      {items.map((i) => (
        <Bubble key={i.key} item={i} layout={layout} />
      ))}
    </div>
  );
}
