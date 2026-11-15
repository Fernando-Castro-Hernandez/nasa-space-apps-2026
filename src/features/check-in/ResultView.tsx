// Cierre del check-in: el estado del día (la misma lectura que Inicio) con
// palabra, ícono y color, 1 o 2 acciones de las reglas y el único aviso de
// "no es un diagnóstico" del flujo. "Ir a Inicio" confirma antes de salir.
// Si la bitácora habló de una emergencia, eso va primero, con su acceso.
import { Check, OctagonAlert, TriangleAlert } from "lucide-react";
import { EmergencyNotice } from "@/components/emergency-access";
import { EscalationCard } from "@/features/emergency/EscalationCard";
import { STATUS_LABEL } from "@/domain/status";
import { t } from "@/i18n";
import type { CheckInResult } from "./result";
import "./check-in.css";

const ICON = { verde: Check, ambar: TriangleAlert, rojo: OctagonAlert };

type Props = {
  result: CheckInResult;
  /** Ya tocó "Ir a Inicio": se muestra "¡Listo!" un momento antes de salir. */
  leaving: boolean;
  onHome: () => void;
};

export function ResultView({ result, leaving, onHome }: Props) {
  const Icon = ICON[result.status];
  const word = STATUS_LABEL[result.status];

  return (
    <div className="checkin-step">
      {result.emergency && <EmergencyNotice line={result.emergency} />}
      <EscalationCard />
      <div className="result-today">
        <p>{t("checkin.result.today")}</p>
        <p className="result-status" data-status={result.status}>
          <Icon aria-hidden="true" />
          <span>
            {result.reason
              ? t("checkin.result.statusReason", {
                  status: word,
                  reason: result.reason,
                })
              : word}
          </span>
        </p>
      </div>
      {result.actions.length > 0 ? (
        <section className="result-actions" aria-labelledby="result-actions">
          <h2 id="result-actions">{t("checkin.result.forToday")}</h2>
          <ul>
            {result.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="result-all-done">{t("lunito.rules.allDone")}</p>
      )}
      <p className="checkin-note">{t("common.notDiagnosis")}</p>
      <button
        type="button"
        className="checkin-primary"
        onClick={onHome}
        disabled={leaving}
        data-leaving={leaving || undefined}
      >
        {leaving ? (
          <>
            <Check aria-hidden="true" />
            {t("checkin.result.done")}
          </>
        ) : (
          t("checkin.result.goHome")
        )}
      </button>
    </div>
  );
}
