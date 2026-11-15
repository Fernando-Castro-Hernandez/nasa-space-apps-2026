// Paso opcional del check-in: la lectura del sensor MAX30102 (SISTEMA.md
// §7.1), 60 s con el dedo quieto.
//
// Con la estación conectada por Bluetooth la lectura es real: se ve en vivo,
// se valida (HU-07) y se guarda para el perfil. Sin estación (o en un
// navegador sin Web Bluetooth) queda la lectura simulada de la demo, y se dice.
import { Bluetooth, Check, Fingerprint } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  MEASURE_SECONDS,
  readingOf,
  type SensorReading,
} from "@/features/sensor/measurement";
import { saveSensorReading } from "@/features/sensor/sensorReadingStore";
import { connectSensor } from "@/features/sensor/sensorStore";
import { useMeasurement } from "@/features/sensor/useMeasurement";
import { formatNumber, t } from "@/i18n";
import { liveVitals, SENSOR_SECONDS, type SensorTarget } from "./simulation";
import { useElapsed } from "./useElapsed";
import "./check-in.css";

type Props = {
  /** La lectura de muestra a la que converge el sensor simulado. */
  target: SensorTarget;
  /** El perfil al que se le guarda la lectura real. */
  profileId: string;
  onNext: () => void;
  /** Para las pruebas: guardar la lectura real. */
  onReading?: (profileId: string, reading: SensorReading) => void;
};

type DialProps = {
  seconds: number;
  total: number;
  bpm: number | null;
  spo2: number | null;
};

/** El anillo con los segundos y los dos valores, igual en vivo y simulado. */
function Dial({ seconds, total, bpm, spo2 }: DialProps) {
  const progress = {
    "--progress": `${(seconds / total) * 100}%`,
  } as CSSProperties;
  const whole = Math.floor(seconds);
  return (
    <div className="sensor-reading">
      <progress
        className="sr-only"
        aria-label={t("checkin.sensor.progress")}
        max={total}
        value={whole}
      />
      <div className="sensor-ring" aria-hidden="true" style={progress}>
        <span>{t("checkin.sensor.seconds", { seconds: whole })}</span>
      </div>
      <dl className="sensor-values">
        <div>
          <dt>{t("common.metrics.bpm")}</dt>
          <dd>
            {bpm === null ? "–" : formatNumber(bpm)}
            <small>{t("common.units.bpm")}</small>
          </dd>
        </div>
        <div>
          <dt>{t("common.metrics.spo2")}</dt>
          <dd>
            {spo2 === null ? "–" : formatNumber(spo2)}
            <small>{t("common.units.percent")}</small>
          </dd>
        </div>
      </dl>
    </div>
  );
}

const Status = ({ children }: { children: ReactNode }) => (
  <p className="checkin-status" aria-live="polite">
    {children}
  </p>
);

const Skip = ({ onNext }: { onNext: () => void }) => (
  <button type="button" className="checkin-skip" onClick={onNext}>
    {t("checkin.sensor.skip")}
  </button>
);

/** La lectura simulada: cuenta 60 s y converge a la lectura de muestra. */
function SimulatedReading({
  target,
  onNext,
  note,
}: Pick<Props, "target" | "onNext"> & { note: string }) {
  const [running, setRunning] = useState(false);
  const [elapsed] = useElapsed(running, SENSOR_SECONDS);
  const done = elapsed >= SENSOR_SECONDS;
  const live = running || done;
  const vitals = liveVitals(elapsed, target);

  return (
    <div className="checkin-step">
      <Dial
        seconds={elapsed}
        total={SENSOR_SECONDS}
        bpm={live ? vitals.bpm : null}
        spo2={live ? vitals.spo2 : null}
      />
      <Status>
        {done ? (
          <>
            <Check aria-hidden="true" />
            {t("checkin.sensor.complete")}
          </>
        ) : running ? (
          t("checkin.sensor.hold")
        ) : null}
      </Status>
      <p className="checkin-note">
        <Fingerprint aria-hidden="true" />
        {note}
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
          <Skip onNext={onNext} />
        </>
      )}
    </div>
  );
}

export function SensorStep({
  target,
  profileId,
  onNext,
  onReading = saveSensorReading,
}: Props) {
  const [simulated, setSimulated] = useState(false);
  const { link, measurement, latest, restart } = useMeasurement(!simulated);
  const reading = readingOf(measurement);

  // La lectura se guarda en cuanto termina: así el resultado del check-in y
  // Inicio ya la usan aunque la persona no toque "Seguir".
  useEffect(() => {
    if (reading) onReading(profileId, reading);
    // Una medición terminada no cambia: basta con verla terminar.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [measurement.done]);

  if (link === "unsupported")
    return (
      <SimulatedReading
        target={target}
        onNext={onNext}
        note={t("checkin.sensor.unsupported")}
      />
    );
  if (simulated)
    return (
      <SimulatedReading
        target={target}
        onNext={onNext}
        note={t("checkin.sensor.simulated")}
      />
    );

  if (link !== "on" && !reading)
    return (
      <div className="checkin-step">
        <Dial seconds={0} total={MEASURE_SECONDS} bpm={null} spo2={null} />
        <Status>{link === "lost" ? t("checkin.sensor.lost") : null}</Status>
        <button
          type="button"
          className="checkin-primary"
          disabled={link === "connecting"}
          onClick={() => void connectSensor()}
        >
          <Bluetooth aria-hidden="true" />
          {link === "connecting"
            ? t("checkin.sensor.connecting")
            : link === "lost"
              ? t("checkin.sensor.reconnect")
              : t("checkin.sensor.connect")}
        </button>
        <button
          type="button"
          className="checkin-skip"
          onClick={() => setSimulated(true)}
        >
          {t("checkin.sensor.useSimulated")}
        </button>
        <Skip onNext={onNext} />
      </div>
    );

  return (
    <div className="checkin-step">
      <Dial
        seconds={reading ? MEASURE_SECONDS : measurement.seconds}
        total={MEASURE_SECONDS}
        bpm={reading ? reading.bpm : (latest?.bpm ?? null)}
        spo2={reading ? reading.spo2 : (latest?.spo2 ?? null)}
      />
      <Status>
        {reading ? (
          <>
            <Check aria-hidden="true" />
            {t("checkin.sensor.complete")}
          </>
        ) : measurement.seconds > 0 ? (
          t("checkin.sensor.hold")
        ) : measurement.notice ? (
          t(`checkin.sensor.${measurement.notice}`)
        ) : latest?.contact ? (
          t("checkin.sensor.settling")
        ) : (
          t("checkin.sensor.waiting")
        )}
      </Status>
      <p className="checkin-note">
        <Fingerprint aria-hidden="true" />
        {t("checkin.sensor.live")}
      </p>
      {reading ? (
        <>
          <button type="button" className="checkin-primary" onClick={onNext}>
            {t("checkin.sensor.next")}
          </button>
          <button type="button" className="checkin-skip" onClick={restart}>
            {t("checkin.sensor.again")}
          </button>
        </>
      ) : (
        <Skip onNext={onNext} />
      )}
    </div>
  );
}
