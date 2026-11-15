import { Bell, Lock } from "lucide-react";
import lunito from "@/features/day-checkin/assets/lunito-pregunta.webp";
import { t } from "@/i18n";

// Neither the Aurora unlocks nor reminders exist in the product yet: both are
// drawn as in the reference but inert (no button, no arrow), with no state
// that could be mistaken for real data. Whether they stay is up to the team
// lead (DECISIONS.md › Abierto).
export function SoonBlocks() {
  return (
    <>
      <section
        className="tasks-aurora"
        aria-label={t("tasks.soon.auroraLabel")}
      >
        <img src={lunito} alt="" />
        <div>
          <strong>{t("tasks.soon.aurora")}</strong>
          <span>{t("tasks.soon.auroraStyle")}</span>
          <em className="tasks-soon">{t("common.comingSoon")}</em>
        </div>
        <Lock aria-hidden="true" />
      </section>
      <section
        className="tasks-reminder"
        aria-label={t("tasks.soon.reminderLabel")}
      >
        <Bell aria-hidden="true" />
        <div>
          <strong>{t("tasks.soon.reminder")}</strong>
          <em className="tasks-soon">{t("common.comingSoon")}</em>
        </div>
      </section>
    </>
  );
}
