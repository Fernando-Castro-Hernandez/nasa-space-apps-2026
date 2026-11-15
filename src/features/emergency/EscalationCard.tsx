// Propuesta de avisar a Tierra cuando el estado llega a Atención (SISTEMA.md
// §7.4): el motivo ya lo dice el estado que tiene arriba; esto dice cuánto tarda la respuesta y qué se envía, y manda el
// reporte con un toque. Nunca se envía sola; "Todavía no" la oculta hasta que se
// vuelva a abrir la pantalla. Se ve en Inicio y en el resultado del check-in.
import { OctagonAlert } from "lucide-react";
import { useState } from "react";
import { useActiveCase } from "@/app/activeCase";
import { navigate } from "@/app/router";
import { MISSION } from "@/data/crew";
import { useLunitoDashboard } from "@/data/lunitoDashboard";
import { t } from "@/i18n";
import { openRedCase } from "./caseLogic";
import { saveCase } from "./caseStore";
import { escalationFor } from "./escalation";

export function EscalationCard() {
  const day = useLunitoDashboard();
  const active = useActiveCase();
  const [hidden, setHidden] = useState(false);
  const escalation = escalationFor({
    status: day.status,
    reason: day.reason,
    caseActive: active !== null,
  });
  if (!escalation || hidden) return null;

  const send = () => {
    saveCase(
      openRedCase(
        day.profile.id,
        day.profile.name,
        escalation.reason ?? "",
        {
          bpm: day.reading.bpm,
          spo2: day.reading.spo2,
          simulated: day.source !== "sensor",
        },
        Date.now(),
      ),
    );
    navigate("/emergencia");
  };

  return (
    <section
      className="emergency-notice escalation-card"
      aria-labelledby="escalation-title"
    >
      <h2 id="escalation-title">
        <OctagonAlert aria-hidden="true" />
        {t("emergency.escalation.title")}
      </h2>
      <p>{t("emergency.escalation.body", { minutes: MISSION.delayMinutes })}</p>
      <div className="escalation-actions">
        <button type="button" onClick={send} className="escalation-send">
          {t("emergency.escalation.send")}
        </button>
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="escalation-later"
        >
          {t("emergency.escalation.notNow")}
        </button>
      </div>
    </section>
  );
}
