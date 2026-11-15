// Tripulación (SISTEMA.md §9.4): la constelación de Lunitos, la meta común de
// autonomía, el compañero del día y la vista del comandante.
import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { crewMember, MISSION } from "@/data/crew";
import { STATUS_TOKEN } from "@/domain/status";
import { autonomy, PHASE_GOAL, SAMPLE_CASES } from "./autonomy";
import { CommanderPanel } from "./CommanderPanel";
import { Constellation } from "./Constellation";

const PAIR: [string, string] = ["luis", "ana"];

export function CrewScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const a = autonomy(SAMPLE_CASES);
  const picked = selected ? crewMember(selected) : null;

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 p-4 md:gap-6 md:p-6">
      <Card className="col-span-12 lg:col-span-7">
        <CardHeader>
          <CardTitle className="text-lg">La constelación</CardTitle>
          <CardDescription>
            Toca un Lunito para ver cómo está. Solo ves cómo están, nunca sus
            datos médicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Constellation
            selected={selected}
            onSelect={setSelected}
            pair={PAIR}
          />
          {picked && (
            <div
              className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4"
              aria-live="polite"
            >
              <div>
                <p className="font-semibold">{picked.name}</p>
                <p className="text-sm text-muted-foreground">{picked.role}</p>
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: STATUS_TOKEN[picked.status] }}
              >
                {picked.mood}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="col-span-12 flex flex-col gap-4 md:gap-6 lg:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Autonomía de la tripulación
            </CardTitle>
            <CardDescription>
              Meta de la fase ({MISSION.phase}): {Math.round(PHASE_GOAL * 100)}{" "}
              % de casos bien atendidos a bordo. Escalar bien también cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-2xl font-semibold">
              {a.wellHandled} de {a.closed}{" "}
              <span className="text-base font-normal text-muted-foreground">
                casos bien atendidos a bordo
              </span>
            </p>
            <div
              className="h-3 overflow-hidden rounded-full bg-muted"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${a.ratio * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Meta de equipo, sin rankings. Casos simulados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartHandshake
                className="size-5 text-primary"
                aria-hidden="true"
              />
              Compañero del día
            </CardTitle>
            <CardDescription>Luis acompaña a Ana hoy.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm">Propuesta: tomen el café juntos.</p>
            <Button
              className="h-11 self-start px-5"
              disabled={sent}
              onClick={() => setSent(true)}
            >
              {sent ? "Ánimo enviado" : "Enviar ánimo"}
            </Button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {sent && "Le llegó tu ánimo a Ana. ✓"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12">
        <CommanderPanel />
      </div>
    </div>
  );
}
