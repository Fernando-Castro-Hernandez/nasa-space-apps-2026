// Paso opcional del check-in: prueba de reacción tipo PVT. Espera aleatoria,
// señal, toque y tiempo. Cuenta desde que el dedo baja (pointerdown), no desde
// que se suelta: así el tiempo es el de la reacción.
import { useEffect, useRef, useState } from "react";
import { formatNumber, t } from "@/i18n";
import { LAPSE_MS, summarize, TRIALS, waitMs } from "./reaction";
import "./check-in.css";

type Phase = "idle" | "waiting" | "signal" | "early" | "done";

export function ReactionTest({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const shownAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const arm = () => {
    setPhase("waiting");
    timer.current = window.setTimeout(() => {
      shownAt.current = performance.now();
      setPhase("signal");
    }, waitMs(Math.random()));
  };

  const tap = () => {
    if (phase === "idle" || phase === "early") return arm();
    if (phase === "waiting") {
      window.clearTimeout(timer.current);
      return setPhase("early");
    }
    if (phase !== "signal") return;
    const next = [...times, Math.round(performance.now() - shownAt.current)];
    setTimes(next);
    if (next.length >= TRIALS) setPhase("done");
    else arm();
  };

  const summary = summarize(times);
  const label: Record<Phase, string> = {
    idle: t("checkin.reaction.idle"),
    waiting: t("checkin.reaction.waiting"),
    signal: t("checkin.reaction.signal"),
    early: t("checkin.reaction.early"),
    done: t("checkin.reaction.done"),
  };

  return (
    <div className="checkin-step">
      <button
        type="button"
        data-phase={phase}
        disabled={phase === "done"}
        onPointerDown={tap}
        // Con teclado (Enter o Espacio) el clic llega sin puntero.
        onClick={(event) => {
          if (event.detail === 0) tap();
        }}
        className="reaction-pad"
      >
        {label[phase]}
      </button>
      <p className="reaction-progress" aria-live="polite">
        <span>
          {t("checkin.reaction.attempt", {
            n: Math.min(times.length + 1, TRIALS),
            total: TRIALS,
          })}
        </span>
        {summary.count > 0 && (
          <span>
            {t("checkin.reaction.summary", {
              mean: formatNumber(summary.meanMs),
              lapse: LAPSE_MS,
              lapses: summary.lapses,
            })}
          </span>
        )}
      </p>
      {phase === "done" ? (
        <button type="button" className="checkin-primary" onClick={onNext}>
          {t("checkin.reaction.next")}
        </button>
      ) : (
        <>
          <p className="checkin-note">{t("checkin.reaction.note")}</p>
          <button type="button" className="checkin-skip" onClick={onNext}>
            {t("checkin.reaction.skip")}
          </button>
        </>
      )}
    </div>
  );
}
