// "Tu misión" (referencia 05): el compañero del día con "Enviar ánimo", la
// autonomía de la fase (la misma que en Equipo) y, solo para el comandante,
// el panel RIDGE. La meta es 100 % (DECISIONS.md): el medidor no lleva marca
// de meta, que caería sobre el extremo del arco; la dice el texto.
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatPercent, type LunitoDashboard } from "@/data/lunitoDashboard";
import { STATUS_LABEL } from "@/domain/status";
import { EncourageButton } from "@/features/crew/EncourageButton";
import { t } from "@/i18n";
import { Marea } from "./Marea";

export function MissionSection({
  data,
  scrolled,
  onToggle,
}: {
  data: LunitoDashboard;
  scrolled: boolean;
  onToggle: () => void;
}) {
  const { mission } = data;
  const { autonomy, companion } = mission;
  const value = formatPercent(autonomy.ratio);
  const target = formatPercent(mission.target);
  return (
    <section className="mission-section" aria-labelledby="mission-heading">
      <Marea variant="mission" />
      <button
        type="button"
        className="mission-toggle"
        onClick={onToggle}
        aria-controls="mission-content"
      >
        <h2 id="mission-heading">{t("home.mission.title")}</h2>
        {scrolled ? (
          <ChevronUp aria-hidden="true" />
        ) : (
          <ChevronDown aria-hidden="true" />
        )}
      </button>
      <div id="mission-content" className="mission-content">
        <article className="companion-panel">
          <div>
            <p className="mission-eyebrow">{t("home.mission.buddy")}</p>
            <h3>
              {companion
                ? t("home.mission.withBuddy", { name: companion.name })
                : t("home.mission.noBuddyTitle")}
            </h3>
            <p>{companion ? companion.action : t("home.mission.noBuddy")}</p>
          </div>
          {companion && (
            <EncourageButton toId={companion.id} className="encouragement" />
          )}
        </article>
        <article className="autonomy-panel">
          <div>
            <p className="mission-eyebrow">{t("home.mission.autonomy")}</p>
            <p>
              {t("home.mission.wellHandled", {
                count: autonomy.wellHandled,
                total: autonomy.closed,
              })}
            </p>
            <p className="autonomy-target">
              {t("home.mission.target")} <strong>{target}</strong>
            </p>
          </div>
          <figure
            className="autonomy-gauge"
            aria-label={t("home.mission.gauge", { value, target })}
          >
            <svg viewBox="0 0 200 112" aria-hidden="true">
              <defs>
                <linearGradient id="gauge-color">
                  <stop style={{ stopColor: "var(--reference-violet)" }} />
                  <stop
                    offset="1"
                    style={{ stopColor: "var(--reference-violet-soft)" }}
                  />
                </linearGradient>
              </defs>
              <path
                d="M16 100 A84 84 0 0 1 184 100"
                fill="none"
                style={{ stroke: "var(--reference-lavender-200)" }}
                strokeWidth="15"
                strokeLinecap="round"
              />
              <path
                d="M16 100 A84 84 0 0 1 184 100"
                fill="none"
                stroke="url(#gauge-color)"
                strokeWidth="15"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray={`${Math.min(100, autonomy.ratio * 100)} 100`}
              />
            </svg>
            <strong>{value}</strong>
          </figure>
        </article>
        {data.isCommander && (
          <article className="ridge-panel">
            <h3>{t("home.mission.ridgeTitle")}</h3>
            <p>{t("home.mission.ridgeView")}</p>
            <ul aria-label={t("home.mission.ridgeList")}>
              {mission.ridge.map((hazard) => (
                <li key={hazard.key}>
                  <span className="ridge-key">{hazard.key}</span>
                  <span>{hazard.label}</span>
                  <strong data-status={hazard.status}>
                    {STATUS_LABEL[hazard.status]}
                  </strong>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>
    </section>
  );
}
