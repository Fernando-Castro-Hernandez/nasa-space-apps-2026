import { lazy, Suspense, useState } from "react";
import { WeekAreaChart } from "@/components/premium/chart-14/charts-14";
import { MonthBarsChart } from "@/components/premium/chart-17/charts-17";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Callout, type CalloutData } from "@/features/lunito/Callout";
import { HISTORY, type IndicatorKey } from "@/data/history";
import type { ScreenPoint } from "@/features/lunito/LunitoScene";
import { anchorsFor, halfWidthFor, isNarrow } from "./sceneLayout";
import { motionFor } from "@/features/lunito/motion";
import { SAMPLE_BASELINE, SAMPLE_READINGS } from "@/data/sample";
import { SideCards } from "./SideCards";
import { STATUS_LABEL, STATUS_TOKEN } from "@/domain/status";
import { assessVitals } from "@/domain/vitals";

// three.js pesa 1 MB: se carga aparte para que la app abra rápido.
const LunitoScene = lazy(() =>
  import("@/features/lunito/LunitoScene").then((m) => ({
    default: m.LunitoScene,
  })),
);

// Con movimiento reducido, Lunito se queda quieto y el dato sigue en números.
const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TABS: { key: IndicatorKey; label: string }[] = [
  { key: "bpm", label: "Pulso" },
  { key: "spo2", label: "Oxígeno" },
  { key: "hrv", label: "Recuperación" },
];

export function StatusScreen() {
  const [sample, setSample] = useState(0);
  const [scene, setScene] = useState<{ points: ScreenPoint[]; width: number }>({
    points: [],
    width: 0,
  });
  const [tab, setTab] = useState<IndicatorKey>("hrv");
  const { reading } = SAMPLE_READINGS[sample]!;
  const vitals = assessVitals(reading, SAMPLE_BASELINE);
  const motion = motionFor(reading, SAMPLE_BASELINE, {
    mode: "rest",
    reducedMotion: prefersReducedMotion(),
  });
  const history = HISTORY[tab];

  const callouts: CalloutData[] = [
    {
      side: "right",
      label: "Oxígeno",
      value: String(reading.spo2),
      unit: "% SpO2",
      indicator: vitals.oxygen,
    },
    {
      side: "left",
      label: "Pulso",
      value: String(reading.bpm),
      unit: "lpm",
      indicator: vitals.heart,
    },
    {
      side: "right",
      label: "Recuperación",
      value: String(reading.hrv),
      unit: "ms HRV",
      indicator: vitals.recovery,
    },
  ];

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 p-4 md:gap-6 md:p-6">
      <Card className="col-span-12 xl:col-span-7">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Cómo estás hoy</CardTitle>
            <CardDescription>Última lectura 07:12 · hace 3 h</CardDescription>
          </div>
          <span
            className="rounded-full border px-3 py-1 text-sm font-semibold"
            style={{ color: STATUS_TOKEN[vitals.overall] }}
          >
            {STATUS_LABEL[vitals.overall]}
          </span>
        </CardHeader>
        <CardContent>
          <div className="relative h-[26rem] md:h-[30rem]">
            <Suspense fallback={null}>
              <LunitoScene
                motion={motion}
                status={vitals.overall}
                anchorsFor={anchorsFor}
                halfWidthFor={halfWidthFor}
                onProject={(points, width) => setScene({ points, width })}
              />
            </Suspense>
            <div className="pointer-events-none absolute inset-0">
              {callouts.map((c, i) =>
                scene.points[i] ? (
                  <Callout
                    key={c.label}
                    {...c}
                    at={scene.points[i]}
                    compact={isNarrow(scene.width)}
                  />
                ) : null,
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <SideCards sample={sample} onSample={setSample} />

      <Card className="col-span-12 lg:col-span-7">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Últimos 7 días</CardTitle>
            <CardDescription>
              Línea punteada: tu normal antes del vuelo.
            </CardDescription>
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as IndicatorKey)}>
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.key} value={t.key}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <WeekAreaChart
            label={history.label}
            unit={history.unit}
            data={history.days}
            baseline={history.baseline}
          />
        </CardContent>
      </Card>

      <Card className="col-span-12 lg:col-span-5">
        <CardHeader>
          <CardTitle className="text-lg">Último mes</CardTitle>
          <CardDescription>
            Promedio semanal de {history.label.toLowerCase()} frente a tu
            normal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthBarsChart
            label={history.label}
            unit={history.unit}
            data={history.weeks}
          />
        </CardContent>
      </Card>

      <p className="col-span-12 text-center text-xs text-muted-foreground">
        Prototipo, no es un diagnóstico. Sensor sin validación médica. Historial
        simulado.
      </p>
    </div>
  );
}
