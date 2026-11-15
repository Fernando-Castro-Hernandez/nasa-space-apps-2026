// Vista del comandante: panel RIDGE de la tripulación y balanceador de carga
// (SISTEMA.md §3 y §7.3).
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_TOKEN } from "@/domain/status";
import {
  co2Module,
  useCo2State,
  type Co2State,
} from "@/features/demo/demoStore";
import type { Status } from "@/domain/vitals";
import { LoadBalancer } from "./LoadBalancer";

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

/** El evento de CO2 de la demo (HU-28) cambia la luz E. El módulo se nombra
 *  al momento, en el idioma activo. */
const co2E = (state: Exclude<Co2State, "normal">): Partial<Hazard> =>
  state === "alto"
    ? { status: "ambar", word: `CO2 alto: ${co2Module()}` }
    : { status: "verde", word: "CO2 resuelto a bordo" };

const withCo2 = (hazards: Hazard[], state: Co2State): Hazard[] =>
  state === "normal"
    ? hazards
    : hazards.map((h) => (h.letter === "E" ? { ...h, ...co2E(state) } : h));

export function CommanderPanel() {
  const hazards = withCo2(RIDGE, useCo2State());

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

        <LoadBalancer />
      </CardContent>
    </Card>
  );
}
