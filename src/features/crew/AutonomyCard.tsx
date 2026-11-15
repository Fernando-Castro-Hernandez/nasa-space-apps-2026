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
import { casesWithCo2, useCo2State } from "@/features/demo/demoStore";
import { autonomy, byHazard, PHASE_GOAL } from "./autonomy";

export function AutonomyCard() {
  const cases = casesWithCo2(useCo2State());
  const a = autonomy(cases.map((c) => c.outcome));
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
          {(a.ratio * 100).toFixed(1)} %{" "}
          <span className="text-base font-normal text-muted-foreground">
            · {a.wellHandled} de {a.closed} casos bien atendidos
          </span>
        </p>
        <svg
          viewBox="0 0 200 112"
          className="mx-auto w-full max-w-xs"
          aria-hidden="true"
        >
          <path
            d="M20 100a80 80 0 0 1 160 0"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M20 100a80 80 0 0 1 160 0"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="14"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${Math.min(100, a.ratio * 100)} 100`}
          />
          <text
            x="100"
            y="100"
            textAnchor="middle"
            fill="var(--foreground)"
            fontSize="26"
            fontWeight="700"
          >
            {Math.round(a.ratio * 100)} %
          </text>
        </svg>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {byHazard(cases).map((h) => (
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
