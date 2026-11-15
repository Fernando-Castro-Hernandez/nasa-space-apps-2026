// Campos de la bitácora (HU-09), todos corregibles: la IA solo ordena lo que
// dijiste y tú confirmas. Ánimo y estrés son obligatorios. Pensado para usarse
// flotando: todo se elige con toques de 48 px y sin teclado, y las escalas
// muestran siempre sus extremos (en ánimo 5 es "muy bueno"; en estrés, "mucho").
import type { ReactNode } from "react";
import {
  SLEEP_QUALITIES,
  SYMPTOMS,
  type CheckInFields,
  type Symptom,
} from "@/api/contract";
import { SYMPTOM_LABEL } from "@/api/symptomLabels";
import { NumberStepper } from "@/components/ui/number-stepper";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

const MOOD_LEVELS = ["veryLow", "low", "okay", "good", "veryGood"] as const;
const STRESS_LEVELS = ["none", "little", "some", "quiteABit", "aLot"] as const;

type Props = {
  fields: CheckInFields;
  onChange: (fields: CheckInFields) => void;
  disabled?: boolean;
};

const chip = (on: boolean) =>
  cn(
    "min-h-12 rounded-full border-[1.5px] px-4 text-[15px] font-bold transition-[background-color,border-color,transform] duration-150 active:scale-[0.96] disabled:opacity-50",
    on
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-foreground",
  );

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="mb-2 p-0 text-base font-extrabold text-foreground">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function Scale({
  name,
  words,
  value,
  onChange,
  disabled,
}: {
  name: string;
  words: string[];
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <Group
      legend={
        value === null
          ? t("voiceUi.fields.pending", { name })
          : t("voiceUi.fields.selected", { name, word: words[value - 1]! })
      }
    >
      <div className="flex justify-between gap-2">
        {words.map((word, i) => (
          <button
            key={word}
            type="button"
            disabled={disabled}
            aria-pressed={value === i + 1}
            aria-label={t("voiceUi.fields.scaleOption", {
              name,
              value: i + 1,
              word,
            })}
            onClick={() => onChange(i + 1)}
            className={cn(chip(value === i + 1), "size-12 shrink-0 px-0")}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {/* Los extremos, siempre a la vista: la escala se entiende antes de tocar. */}
      <div
        aria-hidden="true"
        className="flex justify-between gap-3 text-[15px] text-muted-foreground"
      >
        <span>{words[0]}</span>
        <span className="text-right">{words[words.length - 1]}</span>
      </div>
    </Group>
  );
}

export function FieldsEditor({ fields, onChange, disabled }: Props) {
  const set = (patch: Partial<CheckInFields>) =>
    onChange({ ...fields, ...patch });

  const toggleSymptom = (symptom: Symptom) =>
    set({
      symptoms: SYMPTOMS.filter((s) =>
        s === symptom
          ? !fields.symptoms.includes(s)
          : fields.symptoms.includes(s),
      ),
    });

  const mood = t("voiceUi.fields.mood");
  const stress = t("voiceUi.fields.stress");
  const sleepHours = t("voiceUi.fields.sleepHours");

  return (
    <div className="flex flex-col gap-6">
      <Group legend={t("voiceUi.fields.sleep")}>
        <NumberStepper
          value={fields.sleepHours}
          onChange={(hours) => set({ sleepHours: hours })}
          min={0}
          max={24}
          step={0.5}
          start={7}
          label={sleepHours}
          unit={t("common.units.hours")}
          disabled={disabled}
        />
        <div className="flex flex-wrap gap-2">
          {SLEEP_QUALITIES.map((quality) => {
            const name = t(`voiceUi.fields.qualities.${quality}`);
            return (
              <button
                key={quality}
                type="button"
                disabled={disabled}
                aria-pressed={fields.sleepQuality === quality}
                aria-label={t("voiceUi.fields.sleepQuality", {
                  quality: name,
                })}
                onClick={() =>
                  set({
                    sleepQuality:
                      fields.sleepQuality === quality ? null : quality,
                  })
                }
                className={chip(fields.sleepQuality === quality)}
              >
                {name}
              </button>
            );
          })}
        </div>
      </Group>

      <Scale
        name={mood}
        words={MOOD_LEVELS.map((level) =>
          t(`voiceUi.fields.moodLevels.${level}`),
        )}
        value={fields.mood}
        onChange={(value) => set({ mood: value })}
        disabled={disabled}
      />
      <Scale
        name={stress}
        words={STRESS_LEVELS.map((level) =>
          t(`voiceUi.fields.stressLevels.${level}`),
        )}
        value={fields.stress}
        onChange={(value) => set({ stress: value })}
        disabled={disabled}
      />

      <Group legend={t("voiceUi.fields.symptoms")}>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((symptom) => (
            <button
              key={symptom}
              type="button"
              disabled={disabled}
              aria-pressed={fields.symptoms.includes(symptom)}
              onClick={() => toggleSymptom(symptom)}
              className={chip(fields.symptoms.includes(symptom))}
            >
              {SYMPTOM_LABEL[symptom]}
            </button>
          ))}
        </div>
      </Group>
    </div>
  );
}
