// "Tus datos" (referencia 05): una gráfica con pestañas por indicador, la
// semana o el mes, y debajo "Tu misión".
import { useRef, useState } from "react";
import type { LunitoDashboard, MetricKey } from "@/data/lunitoDashboard";
import { metricParts, metricText } from "@/features/lunito/metricFormat";
import { formatNumber, t } from "@/i18n";
import { MetricChart } from "./MetricChart";
import { MissionSection } from "./MissionSection";

export function DataPage({ data }: { data: LunitoDashboard }) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [key, setKey] = useState<MetricKey>("bpm");
  const [scrolled, setScrolled] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const metric = data.metrics.find((item) => item.key === key)!;
  const values = metric[period];
  const average = Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));
  const [value, unit] = metricParts(key, metric.value, metric.unit);

  return (
    <section
      className="data-page"
      ref={scroll}
      aria-labelledby="data-heading"
      onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 100)}
    >
      <div className="data-context" aria-hidden="true">
        {scrolled && (
          <p>
            <strong>{t("home.data.title")}</strong> · {metric.label}
          </p>
        )}
      </div>
      <div className="data-content">
        <div className="data-heading-row">
          <div>
            <h1 id="data-heading">{t("home.data.title")}</h1>
            <p>
              {period === "week"
                ? t("home.data.lastWeek")
                : t("home.data.lastMonth")}
            </p>
          </div>
          <fieldset
            className="period-selector"
            aria-label={t("home.data.period")}
            style={{ margin: 0, padding: 0, minWidth: 0 }}
          >
            {(["week", "month"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                aria-pressed={period === option}
              >
                {t(`home.data.${option}`)}
              </button>
            ))}
          </fieldset>
        </div>
        <div
          className="metric-selector"
          role="tablist"
          aria-label={t("home.data.metric")}
        >
          {data.metrics.map((item) => (
            <button
              key={item.key}
              type="button"
              id={`metric-${item.key}`}
              role="tab"
              aria-selected={key === item.key}
              aria-controls="metric-panel"
              onClick={() => setKey(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          id="metric-panel"
          role="tabpanel"
          aria-labelledby={`metric-${key}`}
        >
          <div className="metric-current">
            <p>{metric.label}</p>
            <strong>
              {value}
              <span>{unit}</span>
            </strong>
            <p>{t("home.data.lastReading", { time: data.reading.time })}</p>
          </div>
          <MetricChart
            key={`${key}-${period}`}
            metric={metric}
            period={period}
          />
          <div className="metric-summary">
            <p>
              {period === "week"
                ? t("home.data.weekRange")
                : t("home.data.monthRange")}{" "}
              <strong>
                {formatNumber(min)}–{metricText(key, max, metric.unit)}
              </strong>
            </p>
            <span />
            <p>
              {t("home.data.average")}{" "}
              <strong>{metricText(key, average, metric.unit)}</strong>
            </p>
          </div>
        </div>
        <MissionSection
          data={data}
          scrolled={scrolled}
          onToggle={() => {
            if (scrolled) scroll.current?.scrollTo({ top: 0 });
            else
              document
                .getElementById("mission-heading")
                ?.scrollIntoView({ block: "start", behavior: "auto" });
          }}
        />
      </div>
    </section>
  );
}
