// Registro del caso con hora: lo comparten la nave y la consola de Tierra.
import type { CaseEvent } from "./caseLogic";
import { formatTime, linkLabel } from "./link";

const KIND_STYLE: Record<CaseEvent["kind"], string> = {
  open: "bg-status-alert",
  step: "bg-status-ok",
  note: "bg-primary",
  vitals: "bg-primary",
  ground: "bg-status-warn",
  close: "bg-muted-foreground",
};

type Props = {
  events: CaseEvent[];
  /** En Tierra: muestra si cada evento ya llegó o va en camino. */
  delayMinutes?: number;
  now?: number;
};

export function CaseTimeline({ events, delayMinutes, now }: Props) {
  const ordered = events.toReversed();
  return (
    <ol className="flex flex-col gap-3" aria-label="Registro del caso">
      {ordered.map((e) => (
        <li key={e.id} className="flex items-start gap-3 text-sm">
          <span className="w-12 shrink-0 font-mono text-muted-foreground tabular-nums">
            {formatTime(e.at)}
          </span>
          <span
            className={`mt-1.5 size-2 shrink-0 rounded-full ${KIND_STYLE[e.kind]}`}
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-col">
            <span>{e.text}</span>
            {delayMinutes !== undefined && now !== undefined && (
              <span className="text-xs text-muted-foreground">
                {linkLabel(e.at, delayMinutes, now)}
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
