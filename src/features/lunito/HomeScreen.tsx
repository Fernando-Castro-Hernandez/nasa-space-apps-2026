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
import { Mic } from "lucide-react";
import { crewMember } from "@/data/crew";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { DailyActions } from "@/features/medicine/TasksScreen";

export function HomeScreen() {
  const person = crewMember(useActiveProfile());
  const [looking, setLooking] = useState<IndicatorView["key"] | null>(null);
  const index = useReadingIndex();
  const { reading } = DASHBOARD_READINGS[index]!;
  const vitals = assessVitals(reading, DASHBOARD_BASELINE);
  const items = indicatorsFor(reading, vitals);

  return (
    <div style={DASH_VARS} className="orbita-home">
      <section aria-labelledby="hoy-titulo" className="orbita-today">
        <header>
          <p className="orbita-kicker">Así estás hoy</p>
          <h2
            id="hoy-titulo"
            className="text-4xl font-semibold"
            style={{ color: "var(--dash-ink)" }}
          >
            Buenos días, <em>{person.name}</em>
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

      <div className="orbita-side">
        <a
          href="/check-in"
          className="orbita-checkin"
          aria-label="Hacer check-in con Lunito"
        >
          <span>
            <small>CHECK-IN DE HOY · 60 S</small>
            <strong>Cuéntale a Lunito cómo amaneciste</strong>
          </span>
          <Mic aria-hidden="true" />
        </a>
        <EvolutionPanel
          key={index}
          items={items}
          status={vitals.overall}
          looking={looking}
          onLook={setLooking}
        />
        <DailyActions />
        <a href="/tripulacion" className="orbita-setting-link">
          Tu constelación <span aria-hidden="true">→</span>
        </a>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Prototipo, no es un diagnóstico. Datos simulados.
        </p>
      </div>
    </div>
  );
}
