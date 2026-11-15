// Check-in (SISTEMA.md §9.2): voz y sensor, prueba de reacción y resultado.
import { useState } from "react";
import { FieldChips } from "./FieldChips";
import { ReactionTest } from "./ReactionTest";
import { ResultCard } from "./ResultCard";
import { SensorCard } from "./SensorCard";
import { VoiceCard } from "./VoiceCard";

const STEPS = ["Voz y sensor", "Prueba de reacción", "Resultado"];

export function CheckInScreen() {
  const [step, setStep] = useState(0);
  const [voiceDone, setVoiceDone] = useState(false);
  const [sensorOn, setSensorOn] = useState(false);
  const [reactionDone, setReactionDone] = useState(false);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4 md:p-6">
      <ol className="grid grid-cols-3 gap-2" aria-label="Pasos del check-in">
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={i === step ? "step" : undefined}
            className={`rounded-full px-3 py-2 text-center text-xs font-medium md:text-sm ${
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                  ? "bg-accent text-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <>
          <p className="self-start rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-base shadow-sm ring-1 ring-foreground/10">
            <strong className="text-primary">Lunito:</strong> Cuéntame cómo
            dormiste y cómo te sientes.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <VoiceCard
              onDone={() => {
                setVoiceDone(true);
                setSensorOn(true);
              }}
            />
            <div className="flex flex-col gap-3">
              <SensorCard running={sensorOn} />
              {!sensorOn && (
                <button
                  type="button"
                  onClick={() => setSensorOn(true)}
                  className="h-11 rounded-full border text-sm font-medium hover:border-primary"
                >
                  Empezar lectura del sensor
                </button>
              )}
            </div>
          </div>
          {voiceDone && <FieldChips />}
          <button
            type="button"
            disabled={!voiceDone}
            onClick={() => setStep(1)}
            className="h-14 rounded-full bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/85 disabled:opacity-40"
          >
            Seguir a la prueba de reacción
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <p className="text-base text-muted-foreground">
            Toca la caja en cuanto cambie de color. Mide tu fatiga, no tu
            habilidad.
          </p>
          <ReactionTest onDone={() => setReactionDone(true)} />
          <button
            type="button"
            disabled={!reactionDone}
            onClick={() => setStep(2)}
            className="h-14 rounded-full bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/85 disabled:opacity-40"
          >
            Ver mi resultado
          </button>
        </>
      )}

      {step === 2 && <ResultCard />}
    </div>
  );
}
