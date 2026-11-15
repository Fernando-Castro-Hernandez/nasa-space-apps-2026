// Autonomía de la tripulación (HU-17): meta común, fase y desglose por
// peligro. Nunca hay métricas individuales ni rankings.
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MISSION } from "@/data/crew";
import {
  autonomy,
  byHazard,
  PHASE_GOAL,
  SAMPLE_HAZARD_CASES,
} from "./autonomy";

export function AutonomyCard() {
  const a = autonomy(SAMPLE_HAZARD_CASES.map((c) => c.outcome));
  const goal = Math.round(PHASE_GOAL * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Autonomía de la tripulación</CardTitle>
        <CardDescription>
          Fase: {MISSION.phase}. Meta: {goal} % de casos bien atendidos a bordo.
          Escalar bien también cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-2xl font-semibold">
          {Math.round(a.ratio * 100)} %{" "}
          <span className="text-base font-normal text-muted-foreground">
            · {a.wellHandled} de {a.closed} casos bien atendidos
          </span>
        </p>
        <div
          className="h-3 overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(a.ratio / PHASE_GOAL) * 100}%` }}
          />
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {byHazard(SAMPLE_HAZARD_CASES).map((h) => (
            <li key={h.hazard}>
              <span className="font-semibold">{h.hazard}:</span> {h.wellHandled}{" "}
              de {h.closed} bien atendidos
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Meta de equipo, sin rankings. Casos simulados.
        </p>
      </CardContent>
    </Card>
  );
}
