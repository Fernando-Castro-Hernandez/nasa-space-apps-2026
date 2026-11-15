// La medición en curso con la estación: junta la conexión (sensorStore) con la
// regla de validez (measurement.ts). Mientras `active` es verdadero y hay
// conexión, cada mensaje de la estación avanza la medición.
import { useEffect, useState } from "react";
import { addSample, EMPTY_MEASUREMENT, type Measurement } from "./measurement";
import type { SensorSample } from "./protocol";
import { onSensorSample, useSensorLink } from "./sensorStore";

type State = { measurement: Measurement; latest: SensorSample | null };

const START: State = { measurement: EMPTY_MEASUREMENT, latest: null };

export function useMeasurement(active: boolean) {
  const link = useSensorLink();
  const [state, setState] = useState(START);
  const listening = active && link === "on";

  useEffect(() => {
    if (!listening) return;
    const stop = onSensorSample((sample) =>
      setState((s) => ({
        measurement: addSample(s.measurement, sample),
        latest: sample,
      })),
    );
    return () => {
      stop();
      // Sin conexión los segundos dejan de ser seguidos: una medición a
      // medias se descarta; una terminada se conserva.
      setState((s) => (s.measurement.done ? s : START));
    };
  }, [listening]);

  return { link, ...state, restart: () => setState(START) };
}
