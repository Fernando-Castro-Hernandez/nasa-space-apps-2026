import type { ScreenPoint } from "@/features/lunito/LunitoScene";
import { STATUS_COLOR, STATUS_TOKEN } from "@/domain/status";
import type { Indicator } from "@/domain/vitals";

export type CalloutData = {
  label: string;
  value: string;
  unit: string;
  indicator: Indicator;
  /** Lado hacia el que sale la línea desde la parte del cuerpo. */
  side: "left" | "right";
};

type Props = CalloutData & {
  at: ScreenPoint;
  /** Línea corta y tarjeta chica cuando el canvas es angosto. */
  compact: boolean;
};

/** Un dato que sale de una parte de Lunito: punto, línea fina y la tarjeta. */
export function Callout({
  label,
  value,
  unit,
  indicator,
  side,
  at,
  compact,
}: Props) {
  const style = {
    "--status": STATUS_COLOR[indicator.status],
    left: at.x,
    top: at.y,
  } as React.CSSProperties;
  return (
    <div className={`callout callout-${side}`} style={style}>
      <span className="callout-dot" aria-hidden="true" />
      <span
        className={`callout-line ${compact ? "w-4" : "w-10"}`}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-auto flex flex-col rounded-xl border bg-card shadow-sm ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}
      >
        <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span
          className={`font-semibold leading-tight ${compact ? "text-lg" : "text-xl"}`}
        >
          {value}{" "}
          <small className="text-xs font-normal text-muted-foreground">
            {unit}
          </small>
        </span>
        {!compact && (
          <span
            className="max-w-36 text-xs font-semibold whitespace-normal"
            style={{ color: STATUS_TOKEN[indicator.status] }}
          >
            {indicator.reason}
          </span>
        )}
      </div>
    </div>
  );
}
