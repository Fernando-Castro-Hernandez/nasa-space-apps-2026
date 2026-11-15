// El pulso y la SpO2 de este segundo, para quien solo necesita "lo que el
// sensor dice ahora" (el paso del sensor en Emergencia). Null si no hay
// conexión o si la estación todavía no tiene los dos valores.
import { useEffect, useState } from "react";
import { onSensorSample, useSensorLink } from "./sensorStore";

export type LiveVitals = { bpm: number; spo2: number };

export function useLiveVitals() {
  const link = useSensorLink();
  const [vitals, setVitals] = useState<LiveVitals | null>(null);

  useEffect(() => {
    if (link !== "on") return;
    const stop = onSensorSample((s) =>
      setVitals(
        s.bpm !== null && s.spo2 !== null ? { bpm: s.bpm, spo2: s.spo2 } : null,
      ),
    );
    return () => {
      stop();
      setVitals(null);
    };
  }, [link]);

  return { link, vitals: link === "on" ? vitals : null };
}
