// Propuesta del balanceador para el comandante (HU-27): un toque para aprobar
// o rechazar. Muestra solo el peligro, nunca datos de salud.
// ponytail: la decisión se registra en esta sesión de la pantalla; la
// persistencia llegará con HU-29 (D1).
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CREW, crewMember } from "@/data/crew";
import { AMBER_HAZARD, proposeSwap, TASKS, type SwapHazard } from "./swap";

type Decision = "pendiente" | "aprobado" | "rechazado";

const HAZARD_NAME: Record<SwapHazard, string> = {
  R: "Radiación",
  I: "Aislamiento",
  G: "Gravedad",
};

export function LoadBalancer() {
  const [decision, setDecision] = useState<Decision>("pendiente");
  const p = proposeSwap(CREW, TASKS, AMBER_HAZARD);
  if (!p) return null;
  const from = crewMember(p.fromId).name;
  const to = crewMember(p.toId).name;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/50 p-4">
      <p className="text-sm font-semibold">Balanceador de carga</p>
      <p className="text-sm">
        {from} está en ámbar por {HAZARD_NAME[p.hazard]} ({p.hazard}).
        ¿Intercambiar la {p.task} de {from} con {to}?
      </p>
      {decision === "pendiente" ? (
        <div className="flex gap-2">
          <Button className="h-11 px-5" onClick={() => setDecision("aprobado")}>
            Aprobar
          </Button>
          <Button
            variant="outline"
            className="h-11 px-5"
            onClick={() => setDecision("rechazado")}
          >
            Rechazar
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3" aria-live="polite">
          <span className="text-sm font-semibold">
            {decision === "aprobado"
              ? `Aprobado: ${to} hará la ${p.task}.`
              : `Rechazado: ${from} mantiene la ${p.task}.`}
          </span>
          <Button
            variant="ghost"
            className="h-11 px-3"
            onClick={() => setDecision("pendiente")}
          >
            Deshacer
          </Button>
        </div>
      )}
    </div>
  );
}
