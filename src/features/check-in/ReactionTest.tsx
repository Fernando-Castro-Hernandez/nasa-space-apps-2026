// Prueba de reacción interactiva: espera aleatoria, señal, toque, tiempo.
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LAPSE_MS, summarize, TRIALS, waitMs } from "./reaction";

type Phase = "idle" | "waiting" | "signal" | "early" | "done";

export function ReactionTest({ onDone }: { onDone: () => void }) {
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
    if (next.length >= TRIALS) {
      setPhase("done");
      onDone();
    } else arm();
  };

  const s = summarize(times);
  const label: Record<Phase, string> = {
    idle: "Toca para empezar",
    waiting: "Espera la señal…",
    signal: "¡Toca ya!",
    early: "Muy pronto. Toca para reintentar",
    done: "Prueba terminada",
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <button
          type="button"
          onClick={tap}
          disabled={phase === "done"}
          className={`flex h-56 w-full items-center justify-center rounded-2xl text-2xl font-semibold transition-colors ${
            phase === "signal"
              ? "bg-primary text-primary-foreground"
              : phase === "early"
                ? "bg-status-warn/15 text-status-warn"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {label[phase]}
        </button>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <span>
            Intento {Math.min(times.length + 1, TRIALS)} de {TRIALS}
          </span>
          {s.count > 0 && (
            <span>
              Promedio <strong>{s.meanMs} ms</strong> · lapsos (más de{" "}
              {LAPSE_MS} ms): <strong>{s.lapses}</strong>
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Versión de demo de 5 intentos. La versión validada dura 3 minutos
          (Basner 2011). Comparar con tu normal: pendiente de validar.
        </p>
      </CardContent>
    </Card>
  );
}
