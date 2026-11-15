// "Tu evolución" (referencia 3): selector Semana / Mes y una gráfica por
// indicador. El valor de hoy sale de la lectura actual, así que cambia con ella.
import { useId, useState } from "react";
import { Droplet, Heart, HeartPulse } from "lucide-react";
import { EVOLUTION, type EvolutionKey } from "@/data/dashboard";
import type { Status } from "@/domain/vitals";
import type { IndicatorView } from "@/features/lunito/dashboardData";
import { STATUS_VIEW } from "@/features/lunito/theme";
import { cn } from "@/lib/utils";
import { EvolutionChart } from "./EvolutionChart";
import { weekRange } from "./chartMath";

type Mode = "week" | "month";

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const WEEK_NAMES = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];

const LOOK = {
  bpm: { icon: Heart, line: "var(--dash-line)" },
  hrv: { icon: HeartPulse, line: "var(--dash-ok)" },
  spo2: { icon: Droplet, line: "var(--dash-line)" },
} as const;

/** La semana completa (L a D); el último punto es la lectura actual. */
function weekValues(key: EvolutionKey, today: number) {
  return [...EVOLUTION[key].week.slice(0, 6), today];
}

export function EvolutionPanel({
  items,
  status,
  looking,
  onLook,
}: {
  items: IndicatorView[];
  /** Estado general, para el Lunito pequeño de la vista de celular. */
  status: Status;
  /** Indicador que se está mirando: las demás gráficas se atenúan. */
  looking: IndicatorView["key"] | null;
  onLook: (key: IndicatorView["key"] | null) => void;
}) {
  const [mode, setMode] = useState<Mode>("week");
  const titleId = useId();
  const [range] = useState(() => weekRange(new Date()));

  return (
    <section
      aria-labelledby={titleId}
      className="orbita-evolution flex flex-col gap-3"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2
            id={titleId}
            className="text-3xl font-semibold"
            style={{ color: "var(--dash-ink)" }}
          >
            Tu evolución
          </h2>
          <p className="mt-1 text-base text-muted-foreground md:hidden">
            Tu bienestar a lo largo del tiempo
          </p>
        </div>
        <img
          src={STATUS_VIEW[status].image}
          alt=""
          className="h-20 w-auto shrink-0 md:hidden"
        />
      </header>

      <fieldset className="relative grid w-56 grid-cols-2 rounded-full border bg-card p-0.5">
        <legend className="sr-only">Periodo</legend>
        {/* Píldora que se desliza bajo la opción elegida. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-accent transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
            mode === "month" && "translate-x-full",
          )}
        />
        {(["week", "month"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              "relative min-h-11 rounded-full text-base font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97]",
              mode === m ? "text-primary" : "text-muted-foreground",
            )}
          >
            {m === "week" ? "Semana" : "Mes"}
          </button>
        ))}
      </fieldset>
      <p className="text-base text-muted-foreground md:hidden">
        {mode === "week" ? range : "Últimas 4 semanas"}
      </p>

      <div className="divide-y">
        {items.map((it, i) => (
          <EvolutionChart
            key={`${mode}-${it.key}`}
            icon={LOOK[it.key].icon}
            name={it.name}
            tech={it.tech}
            unit={it.unit}
            values={
              mode === "week"
                ? weekValues(it.key, it.value)
                : EVOLUTION[it.key].month
            }
            slots={mode === "week" ? 7 : 4}
            labels={mode === "week" ? DAYS : WEEKS}
            names={mode === "week" ? DAY_NAMES : WEEK_NAMES}
            domain={EVOLUTION[it.key].domain}
            line={LOOK[it.key].line}
            status={STATUS_VIEW[it.status].color}
            delay={i * 150}
            dimmed={looking !== null && looking !== it.key}
            onLook={(l) => onLook(l ? it.key : null)}
          />
        ))}
      </div>

      <p className="pt-2 text-center text-base text-muted-foreground md:hidden">
        Cada día cuenta. Observa tus cambios.
      </p>
    </section>
  );
}
