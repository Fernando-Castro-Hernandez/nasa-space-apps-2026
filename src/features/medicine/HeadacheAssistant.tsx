// Asistente paso a paso del protocolo de dolor de cabeza (FUENTES.md §3).
// Pensado para usarse flotando: respuestas grandes, se ve cuánto falta y los
// números se eligen con − y +, sin teclado.
import { useRef, useState } from "react";
import { NumberStepper } from "@/components/ui/number-stepper";
import { MISSION } from "@/data/crew";
import { useCo2State } from "@/features/demo/demoStore";
import { t } from "@/i18n";
import {
  anyRedFlag,
  draftAnswers,
  emptyDraft,
  nextStep,
  QUESTION_STEPS,
  RESULT_STEP,
  stepProgress,
  type Draft,
} from "./assistant";
import {
  assessHeadache,
  cabinContext,
  RED_FLAGS,
  redFlagQuestion,
} from "./headache";
import { HeadacheResult } from "./HeadacheResult";
import { Source, YesNo } from "./parts";

export function HeadacheAssistant({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(emptyDraft);
  const top = useRef<HTMLDivElement>(null);
  const cabin = cabinContext(useCo2State(), MISSION.day);
  const set = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }));
  const red = anyRedFlag(d);
  const progress = stepProgress(d, step);
  const onResult = step === RESULT_STEP;

  // Cada paso empieza arriba: tras "Siguiente", la primera pregunta queda a
  // la vista aunque se hubiera bajado para responder. Se desplaza antes de
  // pintar el paso nuevo, cuando la línea de pasos todavía está en su lugar
  // (en el resultado ya no se dibuja).
  const goTo = (next: number) => {
    setStep(next);
    // jsdom no implementa scrollIntoView: en las pruebas no hace nada.
    top.current?.scrollIntoView?.({ block: "nearest" });
  };

  return (
    <div className="medicine-assistant">
      {!onResult && (
        <div className="medicine-steps" ref={top}>
          <p>
            {t("medicine.headache.stepOf", {
              step: step + 1,
              total: QUESTION_STEPS.length,
              name: t(`medicine.headache.steps.${QUESTION_STEPS[step]!}`),
            })}
          </p>
          <ol aria-hidden="true">
            {QUESTION_STEPS.map((name, i) => (
              <li
                key={name}
                data-state={i < step ? "done" : i === step ? "now" : "next"}
              />
            ))}
          </ol>
        </div>
      )}

      {step === 0 && (
        <>
          <p className="medicine-lead">
            {t("medicine.headache.screeningIntro")}{" "}
            <Source>SNNOOP10, Do et al., Neurology 2019</Source>
          </p>
          {RED_FLAGS.map((flag, i) => (
            <YesNo
              key={flag}
              question={redFlagQuestion(flag)}
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
          <NumberQuestion
            label={t("medicine.headache.analgesicDays")}
            unit={t("medicine.headache.days")}
            value={d.analgesicDaysThisMonth ?? 0}
            max={31}
            onChange={(v) => set({ analgesicDaysThisMonth: v })}
          />
          <YesNo
            question={t("medicine.headache.fever")}
            value={d.fever}
            onChange={(v) => set({ fever: v })}
          />
          <YesNo
            question={t("medicine.headache.worsening")}
            value={d.worseningOrOver10Days}
            onChange={(v) => set({ worseningOrOver10Days: v })}
          />
        </>
      )}

      {step === 2 && (
        <>
          <NumberQuestion
            label={t("medicine.headache.paracetamolTablets")}
            unit={t("medicine.headache.tablets")}
            value={d.paracetamolTablets24h ?? 0}
            max={20}
            onChange={(v) => set({ paracetamolTablets24h: v })}
          />
          <YesNo
            question={t("medicine.headache.chronic")}
            value={d.chronicCondition}
            onChange={(v) => set({ chronicCondition: v })}
          />
          <YesNo
            question={t("medicine.headache.ulcer")}
            value={d.ulcerOrBleeding}
            onChange={(v) => set({ ulcerOrBleeding: v })}
          />
          <YesNo
            question={t("medicine.headache.ate")}
            value={d.ate}
            onChange={(v) => set({ ate: v })}
          />
          <Source>{t("medicine.headache.labelsSource")}</Source>
        </>
      )}

      {onResult && (
        <HeadacheResult r={assessHeadache(draftAnswers(d), cabin)} />
      )}

      <div className="medicine-nav">
        <button
          type="button"
          className="medicine-secondary medicine-back"
          onClick={step === 0 || onResult ? onExit : () => goTo(step - 1)}
        >
          {step === 0 || onResult
            ? t("medicine.headache.backToSymptoms")
            : t("medicine.headache.back")}
        </button>
        {!onResult && (
          <>
            {/* Cuánto falta para que "Siguiente" funcione, junto a él. */}
            <p className="medicine-count" aria-live="polite">
              {!red &&
                t("medicine.headache.answered", {
                  count: progress.answered,
                  total: progress.total,
                })}
            </p>
            <button
              type="button"
              className="medicine-primary medicine-next"
              data-next
              disabled={!progress.done && !red}
              onClick={() => goTo(nextStep(d, step))}
            >
              {red
                ? t("medicine.headache.seeWhatToDo")
                : t("medicine.headache.next")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

type NumberQuestionProps = {
  label: string;
  unit: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
};

function NumberQuestion({
  label,
  unit,
  value,
  max,
  onChange,
}: NumberQuestionProps) {
  return (
    <div className="medicine-question">
      <p aria-hidden="true">{label}</p>
      <NumberStepper
        value={value}
        onChange={onChange}
        min={0}
        max={max}
        label={label}
        unit={unit}
      />
    </div>
  );
}
