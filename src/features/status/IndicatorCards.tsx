// Una tarjeta por indicador (HU-16): valor, estado en palabras, peligro RIDGE
// y miniatura de 7 días con la línea base punteada. I va primero (C9). Al
// tocar una tarjeta, la gráfica grande de abajo cambia a ese indicador.
import { HISTORY, type IndicatorKey } from "@/data/history";
import { STATUS_LABEL, STATUS_TOKEN } from "@/domain/status";
import type { Reading, Vitals } from "@/domain/vitals";
import { cn } from "@/lib/utils";
import { sparkline } from "./sparkline";

export const INDICATORS: {
  key: IndicatorKey;
  vital: "recovery" | "heart" | "oxygen";
  ridge: "I" | "G" | "E";
  /** Explicación simple, del glosario de SISTEMA.md. */
  explain: string;
}[] = [
  {
    key: "hrv",
    vital: "recovery",
    ridge: "I",
    explain:
      "La variabilidad cardiaca es cuánto varía el tiempo entre latidos. Alta indica relajación y recuperación; baja indica estrés o cansancio.",
  },
  {
    key: "bpm",
    vital: "heart",
    ridge: "G",
    explain: "Cuántas veces late tu corazón por minuto cuando estás en reposo.",
  },
  {
    key: "spo2",
    vital: "oxygen",
    ridge: "E",
    explain:
      "Es el porcentaje de oxigenación de tu sangre. Sirve más para ver tendencias que valores aislados.",
  },
];

type Props = {
  reading: Reading;
  vitals: Vitals;
  selected: IndicatorKey;
  onSelect: (key: IndicatorKey) => void;
};

export function IndicatorCards({ reading, vitals, selected, onSelect }: Props) {
  return (
    <ul className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {INDICATORS.map(({ key, vital, ridge }) => {
        const h = HISTORY[key];
        const status = vitals[vital].status;
        const { points, baselineY } = sparkline(
          h.days.map((d) => d.value),
          h.baseline,
        );
        return (
          <li key={key}>
            <button
              type="button"
              aria-pressed={key === selected}
              onClick={() => onSelect(key)}
              className={cn(
                "flex min-h-12 w-full flex-col gap-2 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent",
                key === selected && "ring-2 ring-primary",
              )}
            >
              <span className="flex items-center justify-between text-sm font-medium">
                {h.label}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold">
                  {ridge}
                </span>
              </span>
              <span className="text-2xl font-semibold">
                {reading[key]}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {h.unit}
                </span>
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: STATUS_TOKEN[status] }}
              >
                {STATUS_LABEL[status]}
              </span>
              <svg
                viewBox="0 0 96 32"
                className="h-8 w-full text-primary"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  x2="96"
                  y1={baselineY}
                  y2={baselineY}
                  stroke="currentColor"
                  strokeOpacity="0.4"
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
