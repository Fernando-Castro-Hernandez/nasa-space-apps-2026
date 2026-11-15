// "Tu evolución" (referencia 3): selector Semana / Mes y una gráfica por
// indicador. El valor de hoy sale de la lectura actual, así que cambia con ella.
import { useState } from "react";
import { Droplet, Heart, HeartPulse } from "lucide-react";
import { EVOLUTION, type EvolutionKey } from "@/data/dashboard";
import type { IndicatorView } from "@/features/lunito/dashboardData";
import { STATUS_VIEW } from "@/features/lunito/theme";
import { cn } from "@/lib/utils";
import { EvolutionChart } from "./EvolutionChart";
import { weekInfo } from "./chartMath";

type Mode = "week" | "month";

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];

const LOOK = {
  bpm: { icon: Heart, line: "var(--dash-line)" },
  hrv: { icon: HeartPulse, line: "var(--dash-ok)" },
  spo2: { icon: Droplet, line: "var(--dash-line)" },
} as const;

/** Semana en curso hasta hoy, con el valor de hoy tomado de la lectura. */
function weekValues(key: EvolutionKey, today: number, todayIndex: number) {
  return [...EVOLUTION[key].week.slice(0, todayIndex), today];
}

export function EvolutionPanel({
  items,
  image,
}: {
  items: IndicatorView[];
  /** Lunito pequeño de la vista de celular. */
  image: string;
}) {
  const [mode, setMode] = useState<Mode>("week");
  const [{ range, todayIndex }] = useState(() => weekInfo(new Date()));

  return (
    <section aria-labelledby="evolucion-titulo" className="flex flex-col gap-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="evolucion-titulo"
            className="text-3xl font-semibold"
            style={{ color: "var(--dash-ink)" }}
          >
            Tu evolución
          </h2>
          <p className="mt-1 text-base text-muted-foreground md:hidden">
            Tu bienestar a lo largo del tiempo
          </p>
        </div>
        <img src={image} alt="" className="size-20 md:hidden" />
      </header>

      <fieldset className="flex w-fit rounded-full border bg-card p-0.5">
        <legend className="sr-only">Periodo</legend>
        {(["week", "month"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              "min-h-11 min-w-28 rounded-full px-5 text-base font-medium transition-colors duration-300",
              mode === m ? "bg-accent text-primary" : "text-muted-foreground",
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
                ? weekValues(it.key, it.value, todayIndex)
                : EVOLUTION[it.key].month
            }
            slots={mode === "week" ? 7 : 4}
            labels={mode === "week" ? DAYS : WEEKS}
            domain={EVOLUTION[it.key].domain}
            line={LOOK[it.key].line}
            status={STATUS_VIEW[it.status].color}
            delay={i * 150}
          />
        ))}
      </div>

      <p className="pt-2 text-center text-base text-muted-foreground md:hidden">
        Cada día cuenta. Observa tus cambios.
      </p>
    </section>
  );
}
