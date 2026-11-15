import { useRef, useState } from "react";
import type { LunitoDashboard, MetricKey } from "@/data/lunitoDashboard";
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
            <strong>Tus datos</strong> · {metric.label}
          </p>
        )}
      </div>
      <div className="data-content">
        <div className="data-heading-row">
          <div>
            <h1 id="data-heading">Tus datos</h1>
            <p>{period === "week" ? "Últimos 7 días" : "Últimas 4 semanas"}</p>
          </div>
          <fieldset
            className="period-selector"
            aria-label="Periodo"
            style={{ margin: 0, padding: 0, minWidth: 0 }}
          >
            {(
              [
                ["week", "Semana"],
                ["month", "Mes"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                aria-pressed={period === value}
              >
                {label}
              </button>
            ))}
          </fieldset>
        </div>
        <div className="metric-selector" role="tablist" aria-label="Métrica">
          {data.metrics.map((item) => (
            <button
              key={item.key}
              id={`metric-${item.key}`}
              role="tab"
              aria-selected={key === item.key}
              aria-controls="metric-panel"
              onClick={() => setKey(item.key)}
            >
              {item.key === "hrv" ? (
                <>
                  Variabilidad
                  <br />
                  cardíaca
                </>
              ) : item.key === "spo2" ? (
                <>
                  Oxígeno
                  <br />
                  en sangre
                </>
              ) : (
                item.label
              )}
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
              {metric.value}
              <span> {metric.unit}</span>
            </strong>
            <p>Último registro · {data.reading.time}</p>
          </div>
          <MetricChart
            key={`${key}-${period}`}
            metric={metric}
            period={period}
          />
          <div className="metric-summary">
            <p>
              Rango {period === "week" ? "semanal" : "mensual"}{" "}
              <strong>
                {min}–{max} {metric.unit}
              </strong>
            </p>
            <span />
            <p>
              Promedio{" "}
              <strong>
                {average} {metric.unit}
              </strong>
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
