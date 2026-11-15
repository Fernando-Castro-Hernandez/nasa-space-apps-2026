// "Así estás hoy" (referencia 2): Lunito al centro y tres burbujas que salen de
// él con una línea curva. Entra todo en secuencia: Lunito, burbujas, líneas.
import { Droplet, Heart, HeartPulse, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndicatorView } from "./dashboardData";
import { useCountUp, useReveal } from "./anim";
import { STATUS_VIEW } from "./theme";

type Spot = {
  icon: LucideIcon;
  /** Centro de la burbuja, en el espacio 100 × 110 del contenedor. */
  at: { x: number; y: number };
  /** Línea curva que va de la burbuja al cuerpo de Lunito. */
  line: string;
  /** Dónde termina la línea: brazo izquierdo, mano derecha y pancita. */
  end: { x: number; y: number };
  delay: number;
};

const SPOTS: Record<IndicatorView["key"], Spot> = {
  bpm: {
    icon: Heart,
    at: { x: 17, y: 19 },
    line: "M12,34 C2,50 10,64 33,58",
    end: { x: 33, y: 58 },
    delay: 250,
  },
  hrv: {
    icon: HeartPulse,
    at: { x: 83, y: 19 },
    line: "M88,34 C99,50 91,63 67,57",
    end: { x: 67, y: 57 },
    delay: 400,
  },
  spo2: {
    icon: Droplet,
    at: { x: 82, y: 70 },
    line: "M68,71 C62,71 60,67 56,62",
    end: { x: 56, y: 62 },
    delay: 550,
  },
};

function Bubble({ item }: { item: IndicatorView }) {
  const spot = SPOTS[item.key];
  const on = useReveal(spot.delay);
  const value = useCountUp(item.value, { delay: spot.delay + 200 });
  const Icon = spot.icon;

  return (
    <div
      className={cn(
        "absolute flex aspect-square w-[31%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-card text-center shadow-[0_10px_34px_oklch(0.6_0.12_295/0.2)] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
        on ? "scale-100 opacity-100" : "scale-50 opacity-0",
      )}
      style={{
        left: `${spot.at.x}%`,
        top: `${spot.at.y / 1.1}%`,
        color: "var(--dash-ink)",
        fontSize: "3.6cqw",
      }}
    >
      <Icon
        className="text-primary"
        style={{ width: "7cqw", height: "7cqw" }}
        aria-hidden="true"
      />
      <span className="mt-[0.6cqw] leading-tight font-medium">{item.name}</span>
      {item.tech && (
        <span className="leading-tight" style={{ fontSize: "3cqw" }}>
          {item.tech}
        </span>
      )}
      <span
        className="font-semibold"
        style={{ color: STATUS_VIEW[item.status].color }}
      >
        <span style={{ fontSize: "8.4cqw" }}>{value}</span>{" "}
        <span style={{ fontSize: "4cqw" }}>{item.unit}</span>
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
  const lunito = useReveal(0);
  const lines = useReveal(700);

  return (
    <div className="relative mx-auto aspect-[10/11] w-full max-w-md [container-type:inline-size]">
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 110"
        aria-hidden="true"
      >
        {items.map((i) => {
          const s = SPOTS[i.key];
          return (
            <g key={i.key}>
              <path
                d={s.line}
                pathLength={1}
                fill="none"
                stroke="var(--dash-line)"
                strokeOpacity={0.55}
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeDasharray={1}
                strokeDashoffset={lines ? 0 : 1}
                style={{
                  transition: `stroke-dashoffset 1100ms ease-out ${s.delay}ms`,
                }}
              />
              <circle
                cx={s.end.x}
                cy={s.end.y}
                r={1.3}
                fill="var(--dash-line)"
                style={{
                  opacity: lines ? 1 : 0,
                  transition: `opacity 400ms ease-out ${s.delay + 900}ms`,
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
          "absolute w-[58%] drop-shadow-[0_18px_22px_oklch(0.55_0.15_295/0.25)] transition-all duration-1000 ease-out motion-reduce:transition-none",
          lunito
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0",
        )}
        style={{ left: "21%", top: `${24 / 1.1}%` }}
      />

      {items.map((i) => (
        <Bubble key={i.key} item={i} />
      ))}
    </div>
  );
}
