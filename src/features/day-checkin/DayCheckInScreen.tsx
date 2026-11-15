import { Keyboard, Mic, Plus } from "lucide-react";
import { useEffect, useReducer, useState } from "react";
import { GREETING_MS, LISTEN_MAX_MS, nextPhase, PHASE_COPY } from "./phases";
import { TypeSheet } from "./TypeSheet";
import { useMicLevel } from "./useMicLevel";
import { VoiceWave } from "./VoiceWave";
import "./day-checkin.css";

type Props = { onDone: () => void };

/** Secuencia visual de la referencia 1. No graba, transcribe ni envía respuestas. */
export function DayCheckInScreen({ onDone }: Props) {
  const [phase, send] = useReducer(nextPhase, "saludo");
  const [typing, setTyping] = useState(false);
  const listening = phase === "escucha";
  const mic = useMicLevel(listening && !typing);
  const copy = PHASE_COPY[phase];
  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (typing || phase === "pregunta") return;
    const duration =
      phase === "saludo"
        ? GREETING_MS
        : phase === "escucha"
          ? LISTEN_MAX_MS
          : 0;
    const timer = setTimeout(() => {
      if (phase === "listo") onDone();
      else send(phase === "saludo" ? "tick" : "stop");
    }, duration);
    return () => clearTimeout(timer);
  }, [phase, typing, onDone]);

  return (
    <main className="day-checkin">
      <div className="day-checkin-content">
        <a className="day-emergency" href="/emergencia">
          <Plus aria-hidden="true" strokeWidth={3} />
          Emergencia
        </a>
        <section className="day-main" aria-label="Conversación con Lunito">
          <div className="day-pose">
            <img src={copy.pose} alt="Lunito" />
            {phase === "saludo" && (
              <svg
                className="day-wave-marks"
                viewBox="0 0 40 60"
                aria-hidden="true"
              >
                <path d="M22 8 Q8 30 22 52 M33 16 Q24 30 33 44" />
              </svg>
            )}
          </div>
          <h1>{copy.title}</h1>
          <div className="day-voice-control">
            {listening || phase === "listo" ? (
              <button
                className="day-wave-button"
                type="button"
                aria-label="Terminar de hablar"
                onClick={() => send("stop")}
              >
                <VoiceWave
                  getLevel={mic.getLevel}
                  reducedMotion={reducedMotion}
                />
              </button>
            ) : (
              <button
                className="day-mic-button"
                type="button"
                aria-label="Hablar con Lunito"
                onClick={() => send("tapMic")}
              >
                <Mic aria-hidden="true" strokeWidth={1.5} />
              </button>
            )}
          </div>
          <p className="day-caption" aria-live="polite">
            {copy.caption}
          </p>
          {listening && mic.source === "demo" && (
            <p className="day-mic-notice">
              Sin acceso al micrófono: onda de demostración.
            </p>
          )}
        </section>
        <button
          className="day-write-button"
          type="button"
          onClick={() => setTyping(true)}
        >
          <Keyboard aria-hidden="true" strokeWidth={1.75} />
          Escribir respuesta
        </button>
      </div>
      {typing && (
        <TypeSheet
          onCancel={() => setTyping(false)}
          onSubmit={() => {
            setTyping(false);
            send("submitText");
          }}
        />
      )}
    </main>
  );
}
