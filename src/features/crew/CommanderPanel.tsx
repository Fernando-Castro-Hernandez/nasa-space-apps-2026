// Vista del comandante: panel RIDGE de la tripulación y balanceador de carga
// (SISTEMA.md §3 y §7.3). El comandante aprueba con un toque.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_TOKEN } from "@/domain/status";
import { CO2_MODULE, useCo2Raised } from "@/features/demo/demoStore";
import type { Status } from "@/domain/vitals";

type Hazard = { letter: string; name: string; status: Status; word: string };

/** Estado simulado de los 5 peligros para la demo (SISTEMA.md §11). */
const RIDGE: Hazard[] = [
  { letter: "R", name: "Radiación", status: "verde", word: "Dosis en rango" },
  {
    letter: "I",
    name: "Aislamiento",
    status: "ambar",
    word: "Sueño bajo en Ana",
  },
  { letter: "D", name: "Distancia", status: "verde", word: "Botiquín al día" },
  { letter: "G", name: "Gravedad", status: "verde", word: "Ejercicio al día" },
  { letter: "E", name: "Ambiente", status: "verde", word: "Aire normal" },
];

type Decision = "pendiente" | "aprobado" | "rechazado";

/** El evento de CO2 de la demo (HU-28) cambia la luz E. */
const withCo2 = (hazards: Hazard[]): Hazard[] =>
  hazards.map((h) =>
    h.letter === "E"
      ? { ...h, status: "ambar", word: `CO2 alto: ${CO2_MODULE}` }
      : h,
  );

export function CommanderPanel() {
  const [decision, setDecision] = useState<Decision>("pendiente");
  const hazards = useCo2Raised() ? withCo2(RIDGE) : RIDGE;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vista del comandante</CardTitle>
        <CardDescription>
          Mei ve los 5 peligros de la tripulación.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="grid grid-cols-5 gap-2" aria-label="Panel RIDGE">
          {hazards.map((h) => (
            <li
              key={h.letter}
              className="flex flex-col items-center gap-1 text-center"
            >
              <span
                className="flex size-11 items-center justify-center rounded-full text-base font-bold text-white"
                style={{ background: STATUS_TOKEN[h.status] }}
                aria-hidden="true"
              >
                {h.letter}
              </span>
              <span className="text-xs font-medium">{h.name}</span>
              <span
                className="text-[0.7rem] leading-tight font-semibold"
                style={{ color: STATUS_TOKEN[h.status] }}
              >
                {h.word}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 rounded-xl border bg-muted/50 p-4">
          <p className="text-sm font-semibold">Balanceador de carga</p>
          <p className="text-sm">
            Ana está fatigada y mañana tiene caminata espacial. ¿Intercambiar la
            caminata espacial de Ana con Omar?
          </p>
          {decision === "pendiente" ? (
            <div className="flex gap-2">
              <Button
                className="h-11 px-5"
                onClick={() => setDecision("aprobado")}
              >
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
            <div
              className="flex flex-wrap items-center gap-3"
              aria-live="polite"
            >
              <span className="text-sm font-semibold">
                {decision === "aprobado"
                  ? "Aprobado: Omar hará la caminata espacial."
                  : "Rechazado: Ana mantiene la caminata espacial."}
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
      </CardContent>
    </Card>
  );
}
