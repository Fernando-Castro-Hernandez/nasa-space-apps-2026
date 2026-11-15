// Lo que la persona contó en su check-in de hoy, en filas para "Tus datos".
// Solo repite lo que dijo: no juzga ni cambia el estado, que sale de las
// reglas sobre las mediciones (SISTEMA.md §1: las reglas deciden).
import type { CheckInFields } from "@/api/contract";
import { SYMPTOM_LABEL } from "@/api/symptomLabels";
import { MOOD_LEVELS, STRESS_LEVELS } from "@/features/voice/levels";
import { formatNumber, t } from "@/i18n";

export type CheckInRow = {
  key: "sleep" | "mood" | "stress" | "symptoms";
  label: string;
  value: string;
};

function sleepText(fields: CheckInFields): string {
  const hours =
    fields.sleepHours === null ? null : formatNumber(fields.sleepHours);
  const quality =
    fields.sleepQuality === null
      ? null
      : t(`voiceUi.fields.qualities.${fields.sleepQuality}`);
  if (hours !== null && quality !== null)
    return t("home.checkIn.hoursQuality", { hours, quality });
  if (hours !== null) return t("home.checkIn.hours", { hours });
  return quality ?? t("home.checkIn.notSaid");
}

const scaleText = (value: number | null, word: (value: number) => string) =>
  value === null
    ? t("home.checkIn.notSaid")
    : t("home.checkIn.scale", { value, word: word(value) });

export function checkInRows(fields: CheckInFields): CheckInRow[] {
  return [
    { key: "sleep", label: t("home.checkIn.sleep"), value: sleepText(fields) },
    {
      key: "mood",
      label: t("home.checkIn.mood"),
      value: scaleText(fields.mood, (value) =>
        t(`voiceUi.fields.moodLevels.${MOOD_LEVELS[value - 1]!}`),
      ),
    },
    {
      key: "stress",
      label: t("home.checkIn.stress"),
      value: scaleText(fields.stress, (value) =>
        t(`voiceUi.fields.stressLevels.${STRESS_LEVELS[value - 1]!}`),
      ),
    },
    {
      key: "symptoms",
      label: t("home.checkIn.symptoms"),
      value:
        fields.symptoms.length === 0
          ? t("home.checkIn.noSymptoms")
          : fields.symptoms.map((symptom) => SYMPTOM_LABEL[symptom]).join(", "),
    },
  ];
}
