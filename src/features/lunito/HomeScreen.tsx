// Mi Lunito (SISTEMA.md §9.1): Lunito sobre una luna, tu estado en palabras,
// el motivo en una línea y el check-in a un toque. Lunito es la única
// ilustración.
import { lazy, Suspense } from "react";
import { ArrowRight, Mic } from "lucide-react";
import { SAMPLE_BASELINE, SAMPLE_READINGS } from "@/data/sample";
import { STATUS_LABEL, STATUS_TOKEN } from "@/domain/status";
import { assessVitals } from "@/domain/vitals";
import { headline } from "./headline";
import { motionFor } from "./motion";

// three.js pesa 1 MB: se carga aparte para que la app abra rápido.
const LunitoScene = lazy(() =>
  import("./LunitoScene").then((m) => ({ default: m.LunitoScene })),
);

// La demo arranca con poco descanso para que el inicio muestre ámbar.
const reading = SAMPLE_READINGS.find(
  (s) => s.name === "Poco descanso",
)!.reading;

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Sin datos alrededor, Lunito puede ocupar casi todo el ancho.
const noAnchors = () => [];
const noop = () => {};
const frameLunito = () => 1.9;

export function HomeScreen() {
  const vitals = assessVitals(reading, SAMPLE_BASELINE);
  const motion = motionFor(reading, SAMPLE_BASELINE, {
    mode: "rest",
    reducedMotion: prefersReducedMotion(),
  });
  const color = STATUS_TOKEN[vitals.overall];

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-6 md:py-10">
      <div className="relative aspect-square w-full max-w-md">
        <div
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 38% 34%, #ffffff 0%, oklch(0.95 0.025 295) 55%, oklch(0.9 0.04 295) 100%)",
            boxShadow: "0 0 80px 10px oklch(0.85 0.06 295 / 45%)",
          }}
        />
        <Suspense fallback={null}>
          <LunitoScene
            motion={motion}
            status={vitals.overall}
            anchorsFor={noAnchors}
            onProject={noop}
            halfWidthFor={frameLunito}
          />
        </Suspense>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className="rounded-full border bg-card px-4 py-1.5 text-base font-semibold"
          style={{ color, borderColor: color }}
        >
          {STATUS_LABEL[vitals.overall]}
        </span>
        <p className="max-w-md text-base text-muted-foreground">
          {headline(vitals)}
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-3">
        <a
          href="/check-in"
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/85"
        >
          <Mic className="size-5" aria-hidden="true" />
          Hacer mi check-in
        </a>
        <a
          href="/estado"
          className="flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium text-primary hover:bg-accent"
        >
          Ver mi estado
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        Última lectura 07:12 · prototipo, no es un diagnóstico.
      </p>
    </div>
  );
}
