// Entrada de voz para cualquier pantalla: la bitácora del check-in, hablar con
// Lunito y dictar en una emergencia. Escucha hasta `maxSeconds` y entrega el
// texto en `onText`. Si algo falla deja un mensaje y la persona escribe.
import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "@/i18n";
import {
  detectEngine,
  startVoiceSession,
  type VoiceEngine,
  type VoiceSession,
} from "./session";
import { silenceDetector } from "./silence";

export type VoiceStatus = "idle" | "starting" | "listening" | "transcribing";

export type VoiceInput = {
  status: VoiceStatus;
  /** Segundos que lleva escuchando. */
  elapsed: number;
  /** Texto que va entendiendo mientras habla (vacío con Whisper). */
  live: string;
  /** null mientras se averigua; "none" si solo se puede escribir. */
  engine: VoiceEngine | null;
  error: string | null;
  /** Volumen del micrófono, de 0 a 1. Para animar sin volver a renderizar. */
  level: () => number;
  start: () => void;
  stop: () => void;
  /** Deja de escuchar sin transcribir: lo dicho se descarta. */
  cancel: () => void;
};

type Options = {
  maxSeconds: number;
  onText: (text: string) => void;
  /** Manos libres: termina solo tras un silencio, sin tocar nada. */
  autoStop?: boolean;
};

export function useVoiceInput({
  maxSeconds,
  onText,
  autoStop = false,
}: Options): VoiceInput {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [live, setLive] = useState("");
  const [engine, setEngine] = useState<VoiceEngine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const session = useRef<VoiceSession | null>(null);
  const busy = useRef(false);
  // Soltar el botón antes de que el micrófono esté listo también cuenta.
  const stopRequested = useRef(false);
  // Cada escucha lleva su número: lo que llega de una escucha cancelada (o de
  // una pantalla que ya se cerró) se descarta y su micrófono se suelta.
  const run = useRef(0);
  const deliver = useRef(onText);
  useEffect(() => {
    deliver.current = onText;
  });

  useEffect(() => {
    const mounted = { current: true };
    const runs = run;
    void detectEngine().then((e) => {
      if (mounted.current) setEngine(e);
    });
    return () => {
      mounted.current = false;
      runs.current++;
      session.current?.cancel();
      session.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    const current = session.current;
    if (!current) {
      stopRequested.current = true;
      return;
    }
    session.current = null;
    const id = run.current;
    setLive("");
    setStatus("transcribing");
    current
      .stop()
      .then((text) => {
        if (id !== run.current) return;
        if (text) deliver.current(text);
        else setError(t("voice.errors.nothingHeard"));
      })
      .catch(async () => {
        if (id !== run.current) return;
        setError(t("voice.errors.notUnderstood"));
        setEngine(await detectEngine());
      })
      .finally(() => {
        if (id !== run.current) return;
        busy.current = false;
        setStatus("idle");
      });
  }, []);

  const start = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    stopRequested.current = false;
    const id = ++run.current;
    setError(null);
    setElapsed(0);
    setLive("");
    setStatus("starting");
    void (async () => {
      try {
        const chosen = await detectEngine();
        if (id !== run.current) return;
        setEngine(chosen);
        if (chosen === "none") throw new Error("Sin motor de voz");
        const started = await startVoiceSession(chosen, stop);
        if (id !== run.current) {
          started.cancel();
          return;
        }
        session.current = started;
        setStatus("listening");
        if (stopRequested.current) stop();
      } catch {
        if (id !== run.current) return;
        busy.current = false;
        setStatus("idle");
        setError(t("voice.errors.noMic"));
      }
    })();
  }, [stop]);

  const cancel = useCallback(() => {
    run.current++;
    session.current?.cancel();
    session.current = null;
    busy.current = false;
    stopRequested.current = false;
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (status !== "listening") return;
    const startedAt = performance.now();
    const quiet = autoStop ? silenceDetector() : null;
    const id = window.setInterval(() => {
      const now = performance.now();
      const seconds = (now - startedAt) / 1000;
      setElapsed(seconds);
      setLive(session.current?.partial?.() ?? "");
      if (seconds >= maxSeconds || quiet?.(session.current?.level() ?? 0, now))
        stop();
    }, 200);
    return () => window.clearInterval(id);
  }, [status, maxSeconds, autoStop, stop]);

  const level = useCallback(() => session.current?.level() ?? 0, []);

  return { status, elapsed, live, engine, error, level, start, stop, cancel };
}
