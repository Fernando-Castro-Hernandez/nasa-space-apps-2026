// Asistente paso a paso del protocolo de dolor de cabeza (FUENTES.md §3).
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MISSION } from "@/data/crew";
import {
  assessHeadache,
  type HeadacheAnswers,
  RED_FLAGS,
  type SpaceContext,
} from "./headache";
import { HeadacheResult } from "./HeadacheResult";
import { Source, YesNo } from "./parts";

/** Feed de la nave simulado para la demo (SISTEMA.md §11). */
const CABIN: SpaceContext = {
  co2Avg7dMmHg: 2.1,
  co2Avg1hMmHg: 3.2,
  flightDay: MISSION.day,
  nauseaOrCongestion: false,
};

type Draft = Partial<Omit<HeadacheAnswers, "redFlags">> & {
  redFlags: (boolean | undefined)[];
};
const STEPS = ["Descarte", "Historial", "Medicamentos", "Resultado"] as const;

export function HeadacheAssistant({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>({
    redFlags: RED_FLAGS.map(() => undefined),
  });
  const set = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }));
  const anyRed = d.redFlags.some((f) => f === true);

  const done = [
    d.redFlags.every((f) => f !== undefined),
    d.fever !== undefined && d.worseningOrOver10Days !== undefined,
    d.chronicCondition !== undefined &&
      d.ulcerOrBleeding !== undefined &&
      d.ate !== undefined,
  ];
  const result = assessHeadache(
    {
      redFlags: d.redFlags.map(Boolean),
      analgesicDaysThisMonth: d.analgesicDaysThisMonth ?? 0,
      fever: d.fever ?? false,
      worseningOrOver10Days: d.worseningOrOver10Days ?? false,
      chronicCondition: d.chronicCondition ?? false,
      ulcerOrBleeding: d.ulcerOrBleeding ?? false,
      ate: d.ate ?? true,
      paracetamolTablets24h: d.paracetamolTablets24h ?? 0,
    },
    CABIN,
  );
  // Un "sí" en el descarte salta directo al resultado rojo.
  const next = () => setStep(anyRed ? 3 : step + 1);

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-wrap gap-2 text-xs" aria-label="Pasos">
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={i === step ? "step" : undefined}
            className={
              i === step
                ? "rounded-full bg-primary px-3 py-1 text-primary-foreground"
                : "rounded-full bg-muted px-3 py-1 text-muted-foreground"
            }
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            Si respondes sí a cualquiera, llama al cirujano de vuelo.{" "}
            <Source>SNNOOP10, Do et al., Neurology 2019</Source>
          </p>
          {RED_FLAGS.map((q, i) => (
            <YesNo
              key={q}
              question={q}
              value={d.redFlags[i]}
              onChange={(v) =>
                set({ redFlags: d.redFlags.map((f, j) => (j === i ? v : f)) })
              }
            />
          ))}
        </>
      )}

      {step === 1 && (
        <>
          <NumberField
            label="¿Cuántos días tomaste analgésicos este mes?"
            value={d.analgesicDaysThisMonth}
            max={31}
            onChange={(v) => set({ analgesicDaysThisMonth: v })}
          />
          <YesNo
            question="¿Tienes fiebre?"
            value={d.fever}
            onChange={(v) => set({ fever: v })}
          />
          <YesNo
            question="¿El dolor empeora o lleva más de 10 días?"
            value={d.worseningOrOver10Days}
            onChange={(v) => set({ worseningOrOver10Days: v })}
          />
        </>
      )}

      {step === 2 && (
        <>
          <NumberField
            label="¿Cuántas tabletas de paracetamol tomaste en las últimas 24 h?"
            value={d.paracetamolTablets24h}
            max={20}
            onChange={(v) => set({ paracetamolTablets24h: v })}
          />
          <YesNo
            question="¿Tienes enfermedad del hígado o del riñón, presión alta, enfermedad del corazón o asma?"
            value={d.chronicCondition}
            onChange={(v) => set({ chronicCondition: v })}
          />
          <YesNo
            question="¿Has tenido úlcera, sangrado del estómago o sangre en las heces?"
            value={d.ulcerOrBleeding}
            onChange={(v) => set({ ulcerOrBleeding: v })}
          />
          <YesNo
            question="¿Comiste?"
            value={d.ate}
            onChange={(v) => set({ ate: v })}
          />
          <Source>Etiquetas de paracetamol e ibuprofeno, DailyMed</Source>
        </>
      )}

      {step === 3 && <HeadacheResult r={result} />}

      <div className="flex flex-wrap justify-between gap-2">
        <Button
          variant="outline"
          className="h-11 px-4"
          onClick={step === 0 || step === 3 ? onExit : () => setStep(step - 1)}
        >
          {step === 0 || step === 3 ? "Volver a síntomas" : "Atrás"}
        </Button>
        {step < 3 && (
          <Button
            className="h-11 px-6"
            disabled={!done[step] && !anyRed}
            onClick={next}
          >
            {anyRed ? "Ver qué hacer" : "Siguiente"}
          </Button>
        )}
      </div>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number | undefined;
  max: number;
  onChange: (v: number) => void;
};

function NumberField({ label, value, max, onChange }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-2 rounded-xl border bg-card p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      {label}
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value ?? 0}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(0, Number(e.target.value) || 0)))
        }
        className="h-11 w-24"
      />
    </label>
  );
}
