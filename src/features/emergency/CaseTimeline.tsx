// Registro del caso con hora: lo comparten la nave y la consola de Tierra.
// Cada frase se arma al mostrarla, en el idioma activo (`eventText`).
import { t } from "@/i18n";
import { type CaseEvent, eventText } from "./caseLogic";
import { formatTime, linkLabel } from "./link";

// Un punto de color por tipo de evento; la frase siempre dice qué fue.
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
  /** En la nave: anuncia cada registro nuevo a los lectores de pantalla. */
  live?: boolean;
};

export function CaseTimeline({ events, delayMinutes, now, live }: Props) {
  const ordered = events.toReversed();
  return (
    <ol
      className="em-log"
      aria-label={t("emergency.log.title")}
      aria-live={live ? "polite" : undefined}
      aria-relevant={live ? "additions" : undefined}
    >
      {ordered.map((e) => (
        <li key={e.id}>
          <time dateTime={new Date(e.at).toISOString()}>
            {formatTime(e.at)}
          </time>
          <span
            className={`em-log-dot ${KIND_STYLE[e.kind]}`}
            aria-hidden="true"
          />
          <span className="min-w-0">
            {eventText(e)}
            {delayMinutes !== undefined && now !== undefined && (
              <span className="em-log-arrival">
                {linkLabel(e.at, delayMinutes, now)}
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
