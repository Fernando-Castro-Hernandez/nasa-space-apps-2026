// Inicio (DISENO.md, referencia 2): "Así estás hoy" con Lunito y sus tres
// burbujas, y "Tu evolución" al lado en tablet o debajo en celular. Datos de
// muestra: la lectura se elige desde /demo.
import { DASHBOARD_BASELINE, DASHBOARD_READINGS } from "@/data/dashboard";
import { assessVitals } from "@/domain/vitals";
import { useReadingIndex } from "@/features/demo/readingStore";
import { EvolutionPanel } from "@/features/status/EvolutionPanel";
import { prefersReducedMotion } from "./anim";
import { useState } from "react";
import { indicatorsFor, reasonFor, type IndicatorView } from "./dashboardData";
import { motionFor } from "./motion";
import { StatusSummary } from "./StatusSummary";
import { DASH_VARS } from "./theme";
import { TodayHero } from "./TodayHero";

export function HomeScreen() {
  const [looking, setLooking] = useState<IndicatorView["key"] | null>(null);
  const index = useReadingIndex();
  const { reading } = DASHBOARD_READINGS[index]!;
  const vitals = assessVitals(reading, DASHBOARD_BASELINE);
  const items = indicatorsFor(reading, vitals);

  return (
    <div
      style={DASH_VARS}
      className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 md:py-8"
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.05fr)_1px_minmax(0,1fr)] md:gap-8">
        <section aria-labelledby="hoy-titulo" className="flex flex-col gap-4">
          <header>
            <h2
              id="hoy-titulo"
              className="text-4xl font-semibold"
              style={{ color: "var(--dash-ink)" }}
            >
              Así estás hoy
            </h2>
            <p className="mt-1 text-lg text-muted-foreground">
              Tu bienestar, reflejado en Lunito
            </p>
          </header>
          <TodayHero
            key={index}
            items={items}
            status={vitals.overall}
            highlight={looking}
            motion={motionFor(reading, DASHBOARD_BASELINE, {
              mode: "rest",
              reducedMotion: prefersReducedMotion(),
            })}
          />
          <StatusSummary
            key={`s${index}`}
            status={vitals.overall}
            reason={reasonFor(vitals)}
          />
        </section>

        <div className="hidden bg-border md:block" aria-hidden="true" />

        <EvolutionPanel
          key={index}
          items={items}
          status={vitals.overall}
          looking={looking}
          onLook={setLooking}
        />
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Prototipo, no es un diagnóstico. Datos simulados.
      </p>
    </div>
  );
}
