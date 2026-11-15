// Ícono del estado en su círculo de color: ✓ Bien, triángulo Precaución,
// octágono Atención. Es decorativo: la palabra del estado siempre va al lado.
import type { CSSProperties } from "react";
import type { Status } from "@/domain/vitals";
import { cn } from "@/lib/utils";
import { STATUS_FILL, STATUS_ICON } from "./theme";

export function StatusMark({
  status,
  className,
  style,
}: {
  status: Status;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full text-white",
        className,
      )}
      style={{ background: STATUS_FILL[status], ...style }}
      data-status={status}
      aria-hidden="true"
    >
      <Icon strokeWidth={3} style={{ width: "62%", height: "62%" }} />
    </span>
  );
}
