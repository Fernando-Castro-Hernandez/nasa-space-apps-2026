// Columna lateral de la consola: recursos a bordo y estado del enlace.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmergencyCase } from "./caseLogic";
import { arrivesAt, formatTime } from "./link";

// Simulado para la demo; el inventario real vive en el botiquín.
const RESOURCES = [
  { name: "Oxígeno", note: "disponible · sin usar" },
  { name: "Paracetamol 325 mg", note: "según inventario" },
  { name: "Ibuprofeno 400 mg", note: "según inventario" },
  { name: "Desfibrilador (AED)", note: "disponible" },
];

type Props = { c: EmergencyCase; delayMinutes: number; now: number };

export function ConsoleSide({ c, delayMinutes, now }: Props) {
  const received = c.events.filter((e) => now >= arrivesAt(e.at, delayMinutes));
  const pending = c.events.length - received.length;
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recursos a bordo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {RESOURCES.map((r) => (
            <div key={r.name} className="flex justify-between gap-3">
              <span>{r.name}</span>
              <span className="text-right text-muted-foreground">{r.note}</span>
            </div>
          ))}
          <span className="pt-1 text-xs text-muted-foreground">
            Inventario simulado.
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado del enlace</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <span>
            Aviso enviado {formatTime(c.openedAt)} · llega{" "}
            {formatTime(arrivesAt(c.openedAt, delayMinutes))}
          </span>
          <span>
            Recibidos {received.length} de {c.events.length}
            {pending > 0 && ` · ${pending} en camino`}
          </span>
          <span className="text-xs text-muted-foreground">
            Tu respuesta llega a la nave {delayMinutes} min después de enviarla.
            Si no hay enlace, el oficial médico sigue el protocolo.
          </span>
        </CardContent>
      </Card>
    </>
  );
}
