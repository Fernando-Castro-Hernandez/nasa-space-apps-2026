// Un número que se elige con − y +, sin teclado. Flotando y con una mano
// ocupada, escribir es lento y propenso a errores: dos botones grandes no.
import { Minus, Plus } from "lucide-react";
import { formatNumber, t } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  /** null: todavía no se elige nada. */
  value: number | null;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Valor con el que empieza al tocar − o + cuando aún no hay ninguno. */
  start?: number;
  /** Qué se está eligiendo ("Horas de sueño"): nombre accesible del grupo. */
  label: string;
  /** Unidad que acompaña al número ("h"). */
  unit?: string;
  disabled?: boolean;
  className?: string;
};

const button =
  "flex size-12 shrink-0 items-center justify-center rounded-full border bg-card text-foreground transition-transform active:scale-95 hover:border-primary disabled:opacity-40 disabled:active:scale-100";

/** Siguiente valor al tocar − (-1) o + (+1), dentro de los límites. */
export function stepValue(
  value: number | null,
  direction: 1 | -1,
  {
    min,
    max,
    step = 1,
    start = min,
  }: Pick<Props, "min" | "max" | "step" | "start">,
): number {
  if (value === null) return Math.min(max, Math.max(min, start));
  // Se redondea al paso para no acumular errores de punto flotante.
  const next = Math.round((value + direction * step) / step) * step;
  return Math.min(max, Math.max(min, next));
}

export function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  start,
  label,
  unit,
  disabled,
  className,
}: Props) {
  const limits = { min, max, step, start };
  return (
    <fieldset
      aria-label={label}
      className={cn(
        "m-0 inline-flex min-w-0 items-center gap-2 border-0 p-0",
        className,
      )}
    >
      <button
        type="button"
        className={button}
        disabled={disabled || (value !== null && value <= min)}
        aria-label={t("common.stepper.decrease", { label })}
        onClick={() => onChange(stepValue(value, -1, limits))}
      >
        <Minus className="size-5" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        className="min-w-16 text-center text-lg font-bold tabular-nums"
      >
        {value === null ? "–" : formatNumber(value)}
        {unit && value !== null && (
          <span className="ml-1 text-[15px] font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </output>
      <button
        type="button"
        className={button}
        disabled={disabled || (value !== null && value >= max)}
        aria-label={t("common.stepper.increase", { label })}
        onClick={() => onChange(stepValue(value, 1, limits))}
      >
        <Plus className="size-5" aria-hidden="true" />
      </button>
    </fieldset>
  );
}
