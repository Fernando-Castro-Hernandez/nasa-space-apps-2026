// Mi estado (SISTEMA.md §1, "el detalle"): la misma lectura del día que
// Inicio (useLunitoDashboard, que sigue al panel /demo), indicador por
// indicador, con su línea base, su peligro RIDGE y los datos de la nave. Se
// muestra dentro de MareaPage, que pone la cabecera y el título.
import { ChevronRight, Droplet, Heart, HeartPulse } from "lucide-react";
import { useState } from "react";
import { DAY_ACTIONS } from "@/data/actions";
import { useLunitoDashboard, type MetricKey } from "@/data/lunitoDashboard";
import { HAZARD_NAME, type Hazard } from "@/domain/finding";
import { STATUS_LABEL } from "@/domain/status";
import { metricParts, metricText } from "@/features/lunito/metricFormat";
import { StatusMark } from "@/features/lunito/StatusMark";
import { MetricChart } from "@/features/lunito-home/MetricChart";
import { useDailyActions } from "@/features/medicine/actionStore";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { useTodayVoiceLog } from "@/features/voice/voiceLogStore";
import { t } from "@/i18n";
import { initialMetric } from "./initialMetric";
import { ShipFeedCard } from "./ShipFeedCard";
import "@/features/lunito-home/data.css";
import "./status.css";

const ICON = { bpm: Heart, hrv: HeartPulse, spo2: Droplet };
/** Por qué importa cada indicador: el peligro de NASA al que responde. */
const HAZARD: Record<MetricKey, Hazard> = { hrv: "I", bpm: "G", spo2: "E" };

export function StatusScreen() {
  const data = useLunitoDashboard();
  const profile = useActiveProfile();
  const [key, setKey] = useState<MetricKey>(() =>
    initialMetric(window.location.search),
  );
  const [period, setPeriod] = useState<"week" | "month">("week");
  const metric = data.metrics.find((m) => m.key === key)!;
  const baseline = data.baseline[key].mean;

  // Lo mismo que cuenta Tareas: el check-in del día y las acciones de hoy.
  const actions = useDailyActions();
  const checkIn = useTodayVoiceLog(profile) !== null;
  const tasks = [checkIn, ...DAY_ACTIONS.map((a) => actions.checked(a.id))];

  return (
    <div className="status-page">
      <section className="status-card status-summary">
        <p className="status-line" aria-live="polite">
          <StatusMark status={data.status} className="size-9" />
          <strong>{STATUS_LABEL[data.status]}</strong>
        </p>
        {data.reason && <p className="status-reason">{data.reason}</p>}
        <p className="status-time">
          {t(
            data.source === "sensor"
              ? "status.sensorReading"
              : "status.lastReading",
            { time: data.reading.time },
          )}
        </p>
      </section>

      <div
        className="status-metrics"
        role="tablist"
        aria-label={t("status.indicators")}
      >
        {data.metrics.map((item) => {
          const Icon = ICON[item.key];
          const [value, unit] = metricParts(item.key, item.value, item.unit);
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`status-tab-${item.key}`}
              aria-selected={item.key === key}
              aria-controls="status-panel"
              data-status={item.status}
              className="status-metric"
              onClick={() => setKey(item.key)}
            >
              <span className="status-metric-name">
                <Icon aria-hidden="true" />
                {item.label}
              </span>
              <strong>
                {value}
                <small>{unit}</small>
              </strong>
              <span className="status-metric-state">
                <StatusMark status={item.status} className="size-5" />
                {STATUS_LABEL[item.status]}
              </span>
            </button>
          );
        })}
      </div>

      <section
        id="status-panel"
        role="tabpanel"
        aria-labelledby={`status-tab-${key}`}
        className="status-card status-panel"
      >
        <div className="status-panel-head">
          <h2>{metric.label}</h2>
          <span className="status-hazard">
            {t("status.hazard", { hazard: HAZARD_NAME[HAZARD[key]] })}
          </span>
        </div>
        <p className="status-explain">{t(`status.explain.${key}`)}</p>
        <div className="status-trend-head">
          <h3>{t("status.trend")}</h3>
          <fieldset
            className="period-selector"
            aria-label={t("home.data.period")}
          >
            {(["week", "month"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                aria-pressed={period === value}
              >
                {t(`home.data.${value}`)}
              </button>
            ))}
          </fieldset>
        </div>
        <MetricChart
          key={`${key}-${period}`}
          metric={metric}
          period={period}
          baseline={baseline}
        />
        <p className="status-legend">
          {t("status.baseline", {
            value: metricText(key, baseline, metric.unit),
          })}
        </p>
      </section>

      <a href="/tareas" className="status-card status-tasks">
        <span>
          <strong>{t("status.tasks")}</strong>
          <span>
            {t("status.tasksDone", {
              count: tasks.filter(Boolean).length,
              total: tasks.length,
            })}
          </span>
        </span>
        <ChevronRight aria-hidden="true" />
      </a>

      <ShipFeedCard personId={profile} />
    </div>
  );
}
