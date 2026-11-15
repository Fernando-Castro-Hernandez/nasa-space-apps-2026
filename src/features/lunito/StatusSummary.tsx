// Estado en una palabra con ícono, motivo (si no está Bien), leyenda de los tres
// estados y el enlace "Qué significa". El color siempre va con su palabra.
import {
  Check,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { Status } from "@/domain/vitals";
import { cn } from "@/lib/utils";
import { useReveal } from "./anim";
import { STATUS_NAME } from "./dashboardData";
import { StatusMeaning } from "./StatusMeaning";
import { STATUS_VIEW } from "./theme";

const ICON: Record<Status, LucideIcon> = {
  verde: Check,
  ambar: TriangleAlert,
  rojo: OctagonAlert,
};

const ORDER: Status[] = ["verde", "ambar", "rojo"];

export function StatusSummary({
  status,
  reason,
}: {
  status: Status;
  reason: string | null;
}) {
  const on = useReveal(900);
  const Icon = ICON[status];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 text-center transition-all duration-700 ease-out motion-reduce:transition-none",
        on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      <p
        className="flex items-center gap-3 text-4xl font-semibold"
        style={{ color: "var(--dash-ink)" }}
        aria-live="polite"
      >
        <span
          className="flex size-10 items-center justify-center rounded-full text-white"
          style={{ background: STATUS_VIEW[status].color }}
        >
          <Icon className="size-6" strokeWidth={3} aria-hidden="true" />
        </span>
        {STATUS_NAME[status]}
      </p>
      {reason && (
        <p className="max-w-xs text-base text-muted-foreground">{reason}</p>
      )}
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-base text-muted-foreground">
        {ORDER.map((s) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-2 transition-colors duration-500",
            )}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ background: STATUS_VIEW[s].color }}
              aria-hidden="true"
            />
            {STATUS_NAME[s]}
          </li>
        ))}
      </ul>
      <StatusMeaning />
    </div>
  );
}
