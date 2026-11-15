// Paso opcional del check-in: la lectura del sensor MAX30102 (SISTEMA.md
// §7.1), 60 s con el dedo quieto. En la demo el sensor es simulado y se dice
// así; el pulso y la SpO2 en vivo se estabilizan en la lectura del día.
import { Check, Fingerprint } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { formatNumber, t } from "@/i18n";
import { liveVitals, SENSOR_SECONDS, type SensorTarget } from "./simulation";
import { useElapsed } from "./useElapsed";
import "./check-in.css";

type Props = { target: SensorTarget; onNext: () => void };

export function SensorStep({ target, onNext }: Props) {
  const [running, setRunning] = useState(false);
  const [elapsed] = useElapsed(running, SENSOR_SECONDS);
  const done = elapsed >= SENSOR_SECONDS;
  const live = running || done;
  const vitals = liveVitals(elapsed, target);
  const seconds = Math.floor(elapsed);
  const progress = {
    "--progress": `${(elapsed / SENSOR_SECONDS) * 100}%`,
  } as CSSProperties;

  return (
    <div className="checkin-step">
      <div className="sensor-reading">
        <progress
          className="sr-only"
          aria-label={t("checkin.sensor.progress")}
          max={SENSOR_SECONDS}
          value={seconds}
        />
        <div className="sensor-ring" aria-hidden="true" style={progress}>
          <span>{t("checkin.sensor.seconds", { seconds })}</span>
        </div>
        <dl className="sensor-values">
          <div>
            <dt>{t("common.metrics.bpm")}</dt>
            <dd>
              {live ? formatNumber(vitals.bpm) : "–"}
              <small>{t("common.units.bpm")}</small>
            </dd>
          </div>
          <div>
            <dt>{t("common.metrics.spo2")}</dt>
            <dd>
              {live ? formatNumber(vitals.spo2) : "–"}
              <small>{t("common.units.percent")}</small>
            </dd>
          </div>
        </dl>
      </div>
      <p className="checkin-status" aria-live="polite">
        {done ? (
          <>
            <Check aria-hidden="true" />
            {t("checkin.sensor.complete")}
          </>
        ) : running ? (
          t("checkin.sensor.hold")
        ) : null}
      </p>
      <p className="checkin-note">
        <Fingerprint aria-hidden="true" />
        {t("checkin.sensor.simulated")}
      </p>
      {done ? (
        <button type="button" className="checkin-primary" onClick={onNext}>
          {t("checkin.sensor.next")}
        </button>
      ) : (
        <>
          {!running && (
            <button
              type="button"
              className="checkin-primary"
              onClick={() => setRunning(true)}
            >
              {t("checkin.sensor.start")}
            </button>
          )}
          <button type="button" className="checkin-skip" onClick={onNext}>
            {t("checkin.sensor.skip")}
          </button>
        </>
      )}
    </div>
  );
}
