// Junta lo que el resultado del check-in necesita: la lectura del día (la misma
// de Inicio), las acciones del día que siguen pendientes y quién es el oficial
// médico. El cálculo está en `checkInResult`.
import { DAY_ACTIONS } from "@/data/actions";
import { CREW, MISSION } from "@/data/crew";
import type { LunitoDashboard } from "@/data/lunitoDashboard";
import { useDailyActions } from "@/features/medicine/actionStore";
import { t, useLocale } from "@/i18n";
import { checkInResult, type CheckInResult } from "./result";

export function useCheckInResult(day: LunitoDashboard): CheckInResult {
  const locale = useLocale();
  const actions = useDailyActions();
  const cmoName =
    CREW.find((member) => member.role.includes("CMO"))?.name ??
    t("lunito.chat.cmoFallback");
  return checkInResult(
    {
      name: day.profile.name,
      status: day.status,
      reason: day.reason,
      pendingActions: DAY_ACTIONS.filter((a) => !actions.checked(a.id)).map(
        (a) => a.text,
      ),
      missionDay: MISSION.day,
      cmoName,
    },
    locale,
  );
}
