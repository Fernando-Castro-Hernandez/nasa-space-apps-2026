// Autonomía de la tripulación (HU-17): meta común, fase y desglose por
// peligro. Nunca hay métricas individuales ni rankings. Un solo número (el del
// medidor), con los mismos casos (casesWithCo2) y el mismo redondeo
// (formatPercent) que Tu misión en Inicio.
import { MISSION } from "@/data/crew";
import { formatPercent } from "@/data/lunitoDashboard";
import { casesWithCo2, useCo2State } from "@/features/demo/demoStore";
import { t } from "@/i18n";
import { autonomy, byHazard, PHASE_GOAL } from "./autonomy";
import "./crew.css";

// Medio arco de 0 a 100 %, como el medidor de Tu misión.
const ARC = "M20 100a80 80 0 0 1 160 0";

export function AutonomyCard() {
  const cases = casesWithCo2(useCo2State());
  const a = autonomy(cases.map((c) => c.outcome));

  return (
    <section
      className="crew-card crew-autonomy"
      aria-labelledby="autonomy-title"
    >
      <div className="crew-autonomy-head">
        <div>
          <h2 id="autonomy-title" className="crew-eyebrow">
            {t("crew.autonomy.title")}
          </h2>
          <p className="crew-autonomy-goal">
            {t("crew.autonomy.phaseGoal", {
              phase: MISSION.phase,
              goal: formatPercent(PHASE_GOAL),
            })}
          </p>
          <p>
            {t("crew.autonomy.handled", {
              count: a.wellHandled,
              total: a.closed,
            })}
          </p>
        </div>
        <div className="crew-gauge">
          <svg viewBox="0 0 200 112" aria-hidden="true">
            <path d={ARC} className="crew-gauge-track" pathLength="100" />
            <path
              d={ARC}
              className="crew-gauge-value"
              pathLength="100"
              strokeDasharray={`${Math.min(100, a.ratio * 100)} 100`}
            />
          </svg>
          <strong>{formatPercent(a.ratio)}</strong>
        </div>
      </div>
      <p className="crew-autonomy-note">{t("crew.autonomy.escalating")}</p>
      <h3 className="crew-eyebrow">{t("crew.autonomy.byHazard")}</h3>
      <ul className="crew-hazards">
        {byHazard(cases).map((h) => (
          <li key={h.hazard}>
            <span>{t(`common.hazards.${h.hazard}`)}</span>
            <strong>
              {t("crew.autonomy.hazardCount", {
                count: h.wellHandled,
                total: h.closed,
              })}
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
