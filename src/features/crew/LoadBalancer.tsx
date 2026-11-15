// Propuesta del balanceador para el comandante (HU-27): un toque para aprobar
// o rechazar, y se puede deshacer. Muestra solo el peligro, nunca datos de
// salud.
// ponytail: la decisión se registra en esta sesión de la pantalla; la
// persistencia llegará con HU-29 (D1).
import { useState } from "react";
import { Check, Undo2, X } from "lucide-react";
import { CREW, crewMember } from "@/data/crew";
import { STATUS_LABEL } from "@/domain/status";
import { t } from "@/i18n";
import { AMBER_HAZARD, proposeSwap, TASKS } from "./swap";
import "./crew.css";

type Decision = "pendiente" | "aprobado" | "rechazado";

export function LoadBalancer() {
  const [decision, setDecision] = useState<Decision>("pendiente");
  const p = proposeSwap(CREW, TASKS, AMBER_HAZARD);
  if (!p) return null;
  const name = crewMember(p.fromId).name;
  const to = crewMember(p.toId).name;
  const task = p.task;

  return (
    <section
      className="crew-card crew-balancer"
      aria-labelledby="balancer-title"
    >
      <h2 id="balancer-title" className="crew-eyebrow">
        {t("crew.balancer.title")}
      </h2>
      <p className="crew-balancer-proposal">
        {t("crew.balancer.proposal", {
          name,
          status: STATUS_LABEL.ambar,
          hazard: t(`common.hazards.${p.hazard}`),
          task,
          to,
        })}
      </p>
      {/* Región viva fija: al decidir o deshacer, se lee el cambio. */}
      <div aria-live="polite">
        {decision === "pendiente" ? (
          <div className="crew-actions">
            <button
              type="button"
              className="crew-button crew-button-solid"
              onClick={() => setDecision("aprobado")}
            >
              <Check aria-hidden="true" />
              {t("crew.balancer.approve")}
            </button>
            <button
              type="button"
              className="crew-button"
              onClick={() => setDecision("rechazado")}
            >
              <X aria-hidden="true" />
              {t("crew.balancer.reject")}
            </button>
          </div>
        ) : (
          <div className="crew-decision">
            <p>
              {decision === "aprobado"
                ? t("crew.balancer.approved", { to, task })
                : t("crew.balancer.rejected", { name, task })}
            </p>
            <button
              type="button"
              className="crew-button"
              onClick={() => setDecision("pendiente")}
            >
              <Undo2 aria-hidden="true" />
              {t("crew.balancer.undo")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
