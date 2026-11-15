import { Check, OctagonAlert, TriangleAlert } from "lucide-react";
import { STATUS_LABEL } from "@/domain/status";
import type { Status } from "@/domain/vitals";
import { t, tn } from "@/i18n";
import type { HeadacheResult as Result } from "./headache";
import { Pending, Source } from "./parts";
import { UrgentLink } from "./UrgentLink";

// El color nunca va solo: cada nivel lleva su palabra y su ícono.
const LEVEL_ICON: Record<Status, typeof Check> = {
  verde: Check,
  ambar: TriangleAlert,
  rojo: OctagonAlert,
};

const title = (who: Result["who"]) =>
  who === "autocuidado"
    ? t("medicine.result.selfCare")
    : who === "oficial médico"
      ? t("medicine.result.cmo")
      : t("medicine.result.surgeon");

export function HeadacheResult({ r }: { r: Result }) {
  const Icon = LEVEL_ICON[r.level];
  return (
    <div className="medicine-result">
      <div className="medicine-verdict" data-level={r.level}>
        <span className="medicine-level">
          <Icon aria-hidden="true" />
          {STATUS_LABEL[r.level]}
        </span>
        <p className="medicine-verdict-title">{title(r.who)}</p>
        {r.reasons.map((reason) => (
          <p key={reason}>{reason}</p>
        ))}
        {r.level === "rojo" && (
          <>
            <UrgentLink label={t("medicine.result.toEmergency")} />
            <Source>{t("medicine.result.noLinkSource")}</Source>
          </>
        )}
        {r.level === "ambar" && (
          <Source>ICHD-3 8.2.3; Do et al., Neurology 2019; DailyMed.</Source>
        )}
      </div>

      {(r.checkVentilation || r.spaceAdaptation) && (
        <div className="medicine-context">
          {r.checkVentilation && (
            <p>
              {t("medicine.result.co2")} <Source>OCHMO-TB-004</Source>
            </p>
          )}
          {r.spaceAdaptation && (
            <p>
              {t("medicine.result.adaptation")} <Source>OCHMO-TB-033</Source>
            </p>
          )}
        </div>
      )}

      {r.level === "verde" && <SelfCare r={r} />}
    </div>
  );
}

function SelfCare({ r }: { r: Result }) {
  return (
    <div className="medicine-selfcare">
      <h3>{t("medicine.result.whatToDo")}</h3>
      <p>
        {t("medicine.result.rest")}{" "}
        <Source>van Oosterhout, Neurology 2024</Source>
      </p>
      <div className="medicine-drug">
        <h4>{t("medicine.result.paracetamol")}</h4>
        <p>
          {t("medicine.result.paracetamolOtc")}{" "}
          <strong>
            {tn("medicine.result.paracetamolLeft", r.paracetamolRemaining)}
          </strong>
        </p>
        <p className="medicine-muted">{t("medicine.result.paracetamolIss")}</p>
      </div>
      <div className="medicine-drug">
        <h4>{t("medicine.result.ibuprofen")}</h4>
        {r.ibuprofen === "no" ? (
          <p>{t("medicine.result.ibuprofenNo")}</p>
        ) : (
          <>
            {r.ibuprofenNeedsFood && (
              <p>
                <strong>{t("medicine.result.ibuprofenFood")}</strong>
              </p>
            )}
            <p>{t("medicine.result.ibuprofenOtc")}</p>
            <p className="medicine-muted">
              {t("medicine.result.ibuprofenIss")}
            </p>
          </>
        )}
      </div>
      <p>
        {t("medicine.result.preferParacetamol")} <Pending />
      </p>
      <p>
        {t("medicine.result.ventilate")} <Pending />
      </p>
      <Source>{t("medicine.result.kitSource")}</Source>
    </div>
  );
}
