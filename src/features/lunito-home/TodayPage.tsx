// "Así estás hoy" (referencia 06): Lunito vivo con su pancita como semáforo,
// el estado en palabras con su ícono y su motivo, y los tres indicadores en
// burbujas que salen de su cuerpo. Tocar a Lunito abre la conversación.
import { ArrowRight, Droplet, Heart, HeartPulse, Mic } from "lucide-react";
import { useState } from "react";
import type { LunitoDashboard, MetricKey } from "@/data/lunitoDashboard";
import { STATUS_LABEL } from "@/domain/status";
import { LunitoAvatar } from "@/features/lunito/LunitoAvatar";
import { metricParts, metricText } from "@/features/lunito/metricFormat";
import { LunitoTalkSheet } from "@/features/lunito/LunitoTalkSheet";
import { StatusMark } from "@/features/lunito/StatusMark";
import { StatusMeaning } from "@/features/lunito/StatusMeaning";
import { STATUS_VIEW } from "@/features/lunito/theme";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { statusHref } from "@/features/status/initialMetric";
import { useTodayVoiceLog } from "@/features/voice/voiceLogStore";
import { t } from "@/i18n";
import { Marea } from "./Marea";

const ICON = { bpm: Heart, hrv: HeartPulse, spo2: Droplet };

// De qué parte del cuerpo sale cada dato (DISENO.md): el pulso del brazo
// izquierdo, la HRV de la mano derecha y el oxígeno de la pancita. Medidas en
// el espacio del escenario (100 de ancho por 90 de alto); cada línea empieza
// escondida bajo su burbuja y termina en un punto sobre Lunito.
const LINK: Record<MetricKey, { path: string; dot: [number, number] }> = {
  bpm: { path: "M74.8 28 Q64.7 27.5 59 39.5", dot: [59, 39.5] },
  hrv: { path: "M75.9 44.4 Q65.7 41.4 58.2 45.8", dot: [58.2, 45.8] },
  spo2: { path: "M25.4 48.8 Q29.3 50.8 34.1 53.6", dot: [34.1, 53.6] },
};

export function TodayPage({
  data,
  onNext,
}: {
  data: LunitoDashboard;
  onNext: () => void;
}) {
  const profile = useActiveProfile();
  const checkedIn = useTodayVoiceLog(profile) !== null;
  const [talking, setTalking] = useState(false);
  const status = STATUS_LABEL[data.status];

  return (
    <section className="today-page" aria-labelledby="today-heading">
      <h1 id="today-heading">{t("home.today.title")}</h1>
      <div className="today-status">
        {/* La palabra y el ícono se funden al cambiar el estado. */}
        <p className="status-word" aria-live="polite">
          <span key={data.status} className="status-swap">
            <StatusMark status={data.status} className="status-check" />
            <strong>{status}</strong>
          </span>
        </p>
        <span className="status-divider" />
        <StatusMeaning className="status-meaning" />
      </div>
      {data.reason && (
        <p key={data.reason} className="today-reason">
          {data.reason}
        </p>
      )}
      <div className="today-scene">
        <div className="today-stage">
          <Marea />
          <LunitoAvatar
            className="today-lunito"
            status={data.status}
            reading={data.reading}
            baseline={data.baseline}
            fallbackSrc={STATUS_VIEW[data.status].image}
            label={t("home.today.lunito", { status })}
            onTap={() => setTalking(true)}
          />
          <svg
            className="metric-connectors"
            viewBox="0 0 100 90"
            aria-hidden="true"
          >
            {data.metrics.map(({ key }) => (
              <g key={key}>
                <path d={LINK[key].path} className="connector-line" />
                <circle
                  cx={LINK[key].dot[0]}
                  cy={LINK[key].dot[1]}
                  r="0.8"
                  className="connector-dot"
                />
              </g>
            ))}
          </svg>
          {data.metrics.map((metric) => {
            const Icon = ICON[metric.key];
            const [value, unit] = metricParts(
              metric.key,
              metric.value,
              metric.unit,
            );
            return (
              <a
                key={metric.key}
                href={statusHref(metric.key)}
                className={`metric-bubble bubble-${metric.key}`}
                data-status={metric.status}
                aria-label={t("home.today.bubble", {
                  metric: metric.label,
                  value: metricText(metric.key, metric.value, metric.unit),
                  status: STATUS_LABEL[metric.status],
                })}
              >
                <Icon aria-hidden="true" />
                <span>{metric.label}</span>
                <strong>
                  {value}
                  <small>{unit}</small>
                </strong>
                {metric.status !== "verde" && (
                  <em>{STATUS_LABEL[metric.status]}</em>
                )}
              </a>
            );
          })}
        </div>
        {/* Sin el check-in de hoy, Lunito invita a hacerlo; después, a hablar. */}
        {checkedIn ? (
          <button
            type="button"
            className="talk-row"
            onClick={() => setTalking(true)}
          >
            <Mic aria-hidden="true" />
            {t("home.today.talk")}
          </button>
        ) : (
          <a className="talk-row" href="/buenos-dias">
            <Mic aria-hidden="true" />
            {t("home.today.checkIn")}
            <ArrowRight aria-hidden="true" />
          </a>
        )}
      </div>
      <button type="button" className="swipe-invitation" onClick={onNext}>
        {t("home.today.swipe")} <ArrowRight aria-hidden="true" />
      </button>
      <LunitoTalkSheet
        open={talking}
        onOpenChange={setTalking}
        status={data.status}
        reason={data.reason}
      />
    </section>
  );
}
