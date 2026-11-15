// "Tu check-in de hoy" en Tus datos: lo que la persona le contó a Lunito
// (sueño, ánimo, estrés y síntomas) y a qué hora. Aparece cuando la bitácora
// de hoy ya está guardada; antes, Inicio invita a hacer el check-in.
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { useTodayVoiceLog } from "@/features/voice/voiceLogStore";
import { formatDate, t } from "@/i18n";
import { checkInRows } from "./checkInRows";

export function CheckInSummary() {
  const log = useTodayVoiceLog(useActiveProfile());
  if (!log) return null;
  return (
    <section className="checkin-summary" aria-labelledby="checkin-heading">
      <div className="checkin-summary-head">
        <h2 id="checkin-heading">{t("home.checkIn.title")}</h2>
        {log.savedAt !== undefined && (
          <p>
            {t("home.checkIn.savedAt", {
              // 24 h, como el resto de las horas de la misión.
              time: formatDate(log.savedAt, {
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23",
              }),
            })}
          </p>
        )}
      </div>
      <dl>
        {checkInRows(log.fields).map((row) => (
          <div key={row.key}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="checkin-summary-note">{t("home.checkIn.note")}</p>
    </section>
  );
}
