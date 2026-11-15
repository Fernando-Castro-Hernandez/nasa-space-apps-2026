// SIN USO desde el check-in único (/buenos-dias usa SensorStep): retirar junto
// con /check-in.
// Lectura simulada del MAX30102: 60 s con el dedo quieto, pulso y SpO2 en vivo.
import { Fingerprint } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SAMPLE_READINGS } from "@/data/sample";
import { liveVitals, SENSOR_SECONDS } from "./simulation";
import { useElapsed } from "./useElapsed";

const FINAL_READING = SAMPLE_READINGS.find((s) => s.id === "low-rest")!.reading;

export function SensorCard({ running }: { running: boolean }) {
  const [elapsed] = useElapsed(running, SENSOR_SECONDS);
  const done = elapsed >= SENSOR_SECONDS;
  const v = liveVitals(elapsed, FINAL_READING);
  const progress = (elapsed / SENSOR_SECONDS) * 100;

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className="relative flex size-16 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--status-ok) ${progress}%, var(--muted) 0)`,
          }}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-card text-sm font-semibold">
            {Math.floor(elapsed)} s
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Fingerprint className="size-4" aria-hidden="true" />
            {done
              ? "Lectura completa"
              : running
                ? "Mantén el dedo quieto"
                : "Pon el dedo en el sensor"}
          </span>
          <div className="flex gap-6">
            <span className="text-2xl font-semibold">
              {running || done ? v.bpm : "–"}{" "}
              <small className="text-sm font-normal text-muted-foreground">
                lpm
              </small>
            </span>
            <span className="text-2xl font-semibold">
              {running || done ? v.spo2 : "–"}{" "}
              <small className="text-sm font-normal text-muted-foreground">
                % SpO2
              </small>
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Sensor de prototipo, sin validación médica.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
